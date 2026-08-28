# Audio cues

Drop sound files here to activate the audio layer. The site works fine
without them: every missing file silently disables its own cue.

Expected filenames (wired in `js/config.js` -> `AUDIO.files`):

| File              | Cue                                                   |
|-------------------|-------------------------------------------------------|
| ambient.mp3       | Low room tone, loops quietly once sound is enabled    |
| door-open.mp3     | Threshold crossing, around 42% sequence progress      |
| exterior-whoosh.mp3 | Camera begins moving, around 15%                    |
| interior-whoosh.mp3 | Entry into the house, around 58%                    |
| workstation-reveal.mp3 | Monitor becomes dominant, around 86%            |
| transition.mp3    | Section 1 -> Section 2 handoff                        |
| hover.mp3         | Interactive element hover (subtle, desktop only)      |
| click.mp3         | Interactive element activation                        |

Keep files small (mono, 96-128 kbps MP3, loops under 30 seconds).
Audio never starts on its own: the visitor must press SOUND ON first.
