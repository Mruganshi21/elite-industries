# Homepage video

Two clips, doing different jobs:

| File | Role | Size |
| --- | --- | --- |
| `elite-industries-intro.mp4` | The title card that plays over the homepage on the first visit of a session | 482 KB |
| `hero.mp4` | The looping background of the hero section | 20.5 MB |

Both paths come from `CompanyProfile` (`IntroVideoPath`, `HeroVideoPath`) — do
not hard-code them in a view.

Both had `moov` after `mdat` as delivered and both have had the qt-faststart
transform applied; `tools/faststart.py` does it and explains why.

---

## `elite-industries-intro.mp4`

5.1 s, 992x432, H.264 + AAC. Supplied as `v2_awv-2557badae3305d3e.mp4`.

Played by `wwwroot/js/intro.js` behind the company name — see the block comment
at the top of that file for the exit conditions, and `wwwroot/css/intro.css` for
the card itself. It is cropped with `object-fit: cover` to whatever the viewport
is, so anything that has to survive is best kept near the centre.

The card is shown **once per session** (`sessionStorage`, key `ei.intro.seen`)
and skipped outright under `prefers-reduced-motion`. To see it again during
development, open a new tab, use a private window, or clear session storage.

It has an audio track. Browsers will not autoplay audible video, so it starts
muted with a sound control offering it; that control only appears once the clip
is genuinely playing.

Replacing it: drop a new file in under the same name, run
`python tools/faststart.py wwwroot/video/elite-industries-intro.mp4`, and keep it
short — the homepage is behind it the whole time it runs.

---

## `hero.mp4`

`hero.mp4` is the looping background of the homepage hero. It came from
`Screen Recording 2026-08-24 111906.mp4` — 29.9 s, 1080p, 20.5 MB.

### What was done to it

The source had its `moov` atom **after** `mdat`, meaning a browser had to
download all 20.5 MB before it could render a single frame. The atom was
relocated to the front (the qt-faststart transform) so playback can begin while
the rest still downloads.

No re-encoding took place — the `mdat` bitstream is byte-for-byte identical and
the file is exactly the same size. Only the chunk-offset tables (`stco`) were
rewritten to account for the move.

### It is still 20.5 MB

That is large for a hero background, so `wwwroot/js/hero.js` is deliberate about
when it loads at all. The video is **skipped entirely** when:

| Condition | Why |
| --- | --- |
| `prefers-reduced-motion: reduce` | Accessibility |
| Viewport under 760 px | 20 MB over mobile data is not a fair default |
| `navigator.connection.saveData` | User asked for less data |
| Effective connection is 2G, or downlink < 1.5 Mbps | It would never finish in time |

When it is not skipped, the video is fetched only after `window.load` fires and
the browser reports itself idle, so it never competes with the CSS, fonts or the
hero artwork. Until it is playing, the rotating SVG scenes in
`wwwroot/img/hero/` are the background — and they remain the background on every
skipped case above. The video cross-fades in over them once it actually plays.

It also pauses when scrolled out of view or when the tab is hidden, so it is not
decoding frames nobody is watching.

Any of those thresholds can be changed in `shouldSkipVideo()` in
`wwwroot/js/hero.js`.

### Recommended: compress it

ffmpeg is not installed on this machine, so the file could not be re-encoded.
Getting it under ~4 MB would let it load on far more connections:

```
ffmpeg -i hero.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 28 -preset slow \
       -movflags +faststart hero-compressed.mp4

# optional smaller VP9 version for Chrome/Firefox
ffmpeg -i hero.mp4 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 36 -b:v 0 hero.webm
```

`-an` drops the audio track (the source has one; the hero plays muted anyway).
`-movflags +faststart` does the same relocation described above, so a re-encode
supersedes it.

To offer the `.webm` as well, add a second `<source>` in `Views/Home/Index.cshtml` —
note the element currently takes its URL from `data-src` rather than `src`, since
JS controls when loading starts.

### Replacing the clip

Drop a new file in as `hero.mp4` and it is picked up automatically — the path
comes from `CompanyProfile.HeroVideoPath`. Keep it muted-friendly and
centre-weighted: it is cropped with `object-fit: cover` and carries a dark scrim
plus white headline text over its left half.
