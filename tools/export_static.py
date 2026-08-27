#!/usr/bin/env python3
"""Render the whole site to flat HTML for a static host (Cloudflare Pages).

Why this exists
---------------
Every page on this site is built from `ProductCatalog` and `CompanyProfile`,
both of which are hardcoded C#. Nothing reads a database and nothing varies per
visitor, so the server does identical work on every request and can do it once
here instead. That buys hosting that is free, has no cold start, and has no
running process to fall over.

The one genuinely dynamic thing is the contact form's POST, which a static host
cannot serve. `--form-endpoint` repoints it at a form service; see README.

    python tools/export_static.py --form-endpoint https://formspree.io/f/XXXX

It builds the app, starts it, crawls it, writes ./dist, and stops it again.
"""

import argparse
import html
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parent.parent

# Anything with one of these extensions ships by copying wwwroot wholesale, so
# the crawler must not mistake it for a page to follow.
ASSET_SUFFIXES = {
    ".css", ".js", ".map", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
    ".ico", ".mp4", ".webm", ".pdf", ".woff", ".woff2", ".ttf", ".eot",
    ".json", ".txt", ".xml",
}

HREF_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)


def wait_for(base, timeout=90):
    """Block until the app answers. Kestrel takes a moment to bind."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(base + "/", timeout=5) as r:
                if r.status == 200:
                    return True
        except Exception:
            time.sleep(1)
    return False


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "static-export"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read(), r.headers.get_content_type()
    except urllib.error.HTTPError as e:
        return e.code, b"", ""


def out_path(dist, route):
    """/      -> dist/index.html
       /About -> dist/About/index.html

    The nested-directory form is what lets every exported link stay exactly as
    the app wrote it: a static host resolves /About to /About/index.html, so no
    href has to be rewritten to end in `.html`.
    """
    route = route.strip("/")
    if not route:
        return dist / "index.html"
    return dist / route / "index.html"


def discover(body, route, base):
    """Pull the internal page links out of one rendered page."""
    found = set()
    for raw in HREF_RE.findall(body.decode("utf-8", "replace")):
        raw = html.unescape(raw).strip()
        if not raw or raw.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
            continue
        absolute = urljoin(base + route, raw)
        parts = urlsplit(absolute)
        # Off-site links are left alone; they keep working as written.
        if parts.netloc and parts.netloc != urlsplit(base).netloc:
            continue
        path = parts.path or "/"
        if Path(path).suffix.lower() in ASSET_SUFFIXES:
            continue
        # A query string cannot survive on a static host. The only one here is
        # the products search box, whose unfiltered page is crawled anyway.
        found.add(path)
    return found


def crawl(base, dist):
    seen, queue, written, failed = set(), ["/"], [], []
    while queue:
        route = queue.pop(0)
        if route in seen:
            continue
        seen.add(route)

        status, body, ctype = fetch(base + route)
        if status != 200:
            failed.append((route, status))
            continue
        if ctype != "text/html":
            continue

        target = out_path(dist, route)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(body)
        written.append(route)

        for link in sorted(discover(body, route, base)):
            if link not in seen:
                queue.append(link)

    return written, failed


def write_404(base, dist):
    """A static host looks for /404.html; the app's error view supplies it.

    /Home/Error is not linked from anywhere, so the crawler never reaches it —
    it has to be asked for by name.
    """
    status, body, ctype = fetch(base + "/Home/Error")
    if status != 200 or ctype != "text/html":
        return False
    (dist / "404.html").write_bytes(body)
    return True


def copy_assets(dist):
    """wwwroot is served at the site root, so its contents land at dist root."""
    src = ROOT / "wwwroot"
    count = 0
    for item in src.iterdir():
        dest = dist / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
            count += sum(1 for p in dest.rglob("*") if p.is_file())
        else:
            shutil.copy2(item, dest)
            count += 1
    return count


def rewire_contact_form(dist, endpoint):
    """Point the contact form at a form service and drop the ASP.NET plumbing.

    The antiforgery token is validated by a server that will not exist once this
    is deployed, and leaving it in means the hidden field is posted to the form
    service as a junk entry on every enquiry. The `name` attributes the model
    binder used are exactly the labels a form service shows in its dashboard, so
    those stay as they are.
    """
    page = dist / "Contact" / "index.html"
    if not page.exists():
        return False

    text = page.read_text(encoding="utf-8")
    before = text

    text = re.sub(
        r'(<form[^>]*?)action="[^"]*"',
        lambda m: m.group(1) + 'action="' + endpoint + '"',
        text,
        count=1,
        flags=re.I,
    )
    text = re.sub(
        r'<input[^>]*name="__RequestVerificationToken"[^>]*>\s*',
        "",
        text,
        flags=re.I,
    )
    page.write_text(text, encoding="utf-8")
    return text != before


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=5199)
    ap.add_argument("--out", default="dist")
    ap.add_argument(
        "--form-endpoint",
        default="",
        help="Form-service POST URL for the contact form, e.g. a Formspree "
             "https://formspree.io/f/XXXXXXXX. Omitting it leaves the form "
             "posting to a route that will not exist on a static host.",
    )
    args = ap.parse_args()

    base = "http://localhost:%d" % args.port
    dist = ROOT / args.out
    if dist.exists():
        shutil.rmtree(dist)
    dist.mkdir(parents=True)

    publish = ROOT / "artifacts" / "static-publish"
    print("building...", flush=True)
    subprocess.run(
        ["dotnet", "publish", "-c", "Release", "-o", str(publish)],
        cwd=str(ROOT), check=True,
        stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
    )

    env = dict(os.environ)
    env["ASPNETCORE_ENVIRONMENT"] = "Production"
    env["ASPNETCORE_URLS"] = base
    print("starting app on %s ..." % base, flush=True)
    app = subprocess.Popen(
        ["dotnet", str(publish / "EliteIndustries.dll")],
        cwd=str(publish), env=env,
        stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
    )

    try:
        if not wait_for(base):
            print("app did not come up", file=sys.stderr)
            return 1

        print("crawling...", flush=True)
        written, failed = crawl(base, dist)
        not_found = write_404(base, dist)
        assets = copy_assets(dist)

        rewired = False
        if args.form_endpoint:
            rewired = rewire_contact_form(dist, args.form_endpoint)
    finally:
        app.terminate()
        try:
            app.wait(timeout=20)
        except subprocess.TimeoutExpired:
            app.kill()

    print("\n%d pages -> %s" % (len(written), dist))
    print("%d static files copied" % assets)
    print("404.html written" if not_found else "404.html MISSING")
    print("contact form repointed" if rewired
          else "contact form NOT repointed (no --form-endpoint)")
    if failed:
        print("\n%d route(s) did not return 200:" % len(failed))
        for route, status in failed:
            print("  %s  %s" % (status, route))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
