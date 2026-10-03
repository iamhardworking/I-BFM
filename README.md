# I-BFM project website

Static project page for **I-BFM: Reward-Conditioned Robust Humanoid Interaction via Unsupervised Reinforcement Learning**.


## Website

- **Project website:** [https://iamhardworking.github.io/I-BFM/](https://iamhardworking.github.io/I-BFM/)
- **Source repository:** [https://github.com/iamhardworking/I-BFM](https://github.com/iamhardworking/I-BFM)
- **Local preview:** [http://localhost:8000](http://localhost:8000)

The public site is hosted from the standalone `iamhardworking/I-BFM` repository. The local URL works while the preview server below is running.

## Preview locally

Run from this directory:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The HTTP server is required for loading the saved CSV traces used by the interactive z2z panel.

## Interactive modules

- **Reward → z2z** loads three real 166.560M rollout videos, summaries, and CSV traces. The low and middle presets are completed placements; the high preset honestly reports that its 40-second recording window ended during transport.
- **Manual carry** recreates the keyboard bindings and controller phase transitions saved with the 166.560M solve-close setup: arrow keys steer, `Down`/`Space` stop, `B` requests lift, `F` requests place, `P` prints state, and `R` resets. It is explicitly presented as a controller preview, not browser-side MuJoCo or ONNX inference.

## Main files

- `index.html` — page structure and content
- `static/css/site.css` — responsive visual system
- `static/js/site.js` — trace viewer, video presets, and manual controller preview
- `static/paper/I-BFM.pdf` — manuscript
- `ebd2e43d024df6559dd51a95911e760d.mp4` — main project video and hero background
- `static/video/` — interactive rollout videos
- `static/data/` — copied experiment traces and summaries

All runtime assets are local; the page has no CDN or package-manager dependency.
