# Homepage video

Nothing in this directory is in use.

| File | Former role | Size |
| --- | --- | --- |
| `elite-industries-intro.mp4` | Intro title card, then the hero background | 482 KB |
| `hero.mp4` | The hero background before that | 20.5 MB |

The homepage hero is now a single image, `wwwroot/img/hero-export-packaging.jpeg`
(see `Views/Home/_Hero.cshtml`). `wwwroot/js/hero.js`, which lazy-loaded and
played the clip, and `CompanyProfile.HeroVideoPath` were removed with the video.
Both files are kept only so that decision is reversible; delete them if it is
not going to be revisited.

Both files had `moov` after `mdat` as delivered and both have had the
qt-faststart transform applied; `tools/faststart.py` does it and explains why.

---

## `elite-industries-intro.mp4` — unused

5.1 s, 992x432, H.264 + AAC. It played as a full-screen title card on the first
visit of a session, then as the looping muted background of the hero, loaded
after `window.load` and skipped under reduced motion, save-data and 2G. A video
hero that returns should keep that policy: muted on the property as well as the
attribute, fetched late, paused out of view.

---

## `hero.mp4` — unused

29.9 s, 1080p, 20.5 MB, from `Screen Recording 2026-08-24 111906.mp4`. It was
the hero background until the intro clip took the job. Nothing references it.

It is kept on disk only so the decision is reversible. Reinstating it means
rebuilding the video hero, with a size-aware loading policy — 20.5 MB is not a
fair thing to push at a phone. Otherwise delete the file; it is by far the
largest thing in the repo.

If you do reinstate it, compress it first. ffmpeg was not installed on the
machine this was set up on, so it was never re-encoded — only the `moov` atom
was moved to the front. Under ~4 MB it would be reasonable:

```
ffmpeg -i hero.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 28 -preset slow \
       -movflags +faststart hero-compressed.mp4

# optional smaller VP9 version for Chrome/Firefox
ffmpeg -i hero.mp4 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 36 -b:v 0 hero.webm
```

`-an` drops the audio track; the hero plays muted anyway. `-movflags +faststart`
does the same relocation described above, so a re-encode supersedes it.

To offer a `.webm` as well, give the rebuilt `<video>` a second `<source>`.
