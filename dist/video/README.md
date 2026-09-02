# Homepage video

One clip in use:

| File | Role | Size |
| --- | --- | --- |
| `elite-industries-intro.mp4` | The looping background of the hero section | 482 KB |
| `hero.mp4` | **Unused.** The old hero background | 20.5 MB |

The path comes from `CompanyProfile.HeroVideoPath` — do not hard-code it in a
view.

Both files had `moov` after `mdat` as delivered and both have had the
qt-faststart transform applied; `tools/faststart.py` does it and explains why.

---

## `elite-industries-intro.mp4`

5.1 s, 992x432, H.264 + AAC.

This clip used to play as a full-screen title card over the homepage on the
first visit of a session, with the hero behind it. That card was removed — the
homepage now opens straight on the hero — and the same clip became the hero's
background instead, which is where it had more to do anyway. Nothing plays over
the page any more, and `sessionStorage` key `ei.intro.seen` is no longer read or
written.

It is cropped with `object-fit: cover` to whatever the viewport is, sits under a
dark scrim weighted to the left where the copy is, and loops. So anything that
has to survive is best kept near the centre-right of the frame.

The audio track is still in the file and is never played: `wwwroot/js/hero.js`
sets `muted` on the property as well as the attribute, and the band offers no
control to unmute. A hero that pops audio is the worst thing this band could do.

### When it loads

`wwwroot/js/hero.js` fetches it only after `window.load` and an idle callback, so
it never competes with the CSS, the fonts or first paint. Until it is playing —
and permanently, in the skipped cases below — the drawn isometric ground in
`wwwroot/css/hero.css` is the background. The video cross-fades in over it once
it actually plays, and pauses when the band scrolls out of view or the tab is
hidden.

It is **skipped entirely**, leaving the drawn ground, when:

| Condition | Why |
| --- | --- |
| `prefers-reduced-motion: reduce` | Accessibility |
| `navigator.connection.saveData` | User asked for less data |
| Effective connection is 2G or slower | Half a megabyte there is most of a minute |

There is no viewport-width gate and no downlink floor any more. Both existed
because the background used to be `hero.mp4` at 20.5 MB; at 482 KB the clip is
smaller than the fonts the page already fetches, so phones and middling
connections get it. Any of this can be changed in `shouldSkipVideo()` in
`wwwroot/js/hero.js`.

### Replacing the clip

Drop a new file in under the same name, run
`python tools/faststart.py wwwroot/video/elite-industries-intro.mp4`, and keep it
centre-weighted and loop-friendly — a visible cut back to the first frame is the
one thing a looping background cannot hide.

---

## `hero.mp4` — unused

29.9 s, 1080p, 20.5 MB, from `Screen Recording 2026-08-24 111906.mp4`. It was
the hero background until the intro clip took the job. Nothing references it:
`CompanyProfile` has one video path and it points at the intro clip.

It is kept on disk only so the decision is reversible. To go back to it, repoint
`CompanyProfile.HeroVideoPath` — and restore a size-aware loading policy in
`shouldSkipVideo()` first, because the current one will happily push 20.5 MB at
a phone. Otherwise delete the file; it is by far the largest thing in the repo.

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

To offer a `.webm` as well, add a second `<source>` in
`Views/Home/_Hero.cshtml` — note the element takes its URL from `data-src`
rather than `src`, since JS controls when loading starts.
