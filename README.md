# I-BFM project website

Static project page for **I-BFM: Reward-Conditioned Robust Humanoid Interaction via Unsupervised Reinforcement Learning**.

## Website

- **Project website:** [https://iamhardworking.github.io/I-BFM/](https://iamhardworking.github.io/I-BFM/)
- **Source repository:** [https://github.com/iamhardworking/I-BFM](https://github.com/iamhardworking/I-BFM)
- **Code repository:** [https://github.com/iamhardworking/I_BFM](https://github.com/iamhardworking/I_BFM)

## Live MuJoCo viewer

The interactive section runs real MuJoCo WebAssembly physics and the original 166.560M-step FP32 ONNX actor in the browser. It is not a prerecorded trace or a CSS controller preview.

- 1252-D actor input assembled from current robot/object/contact state, action history, privileged context, and the selected 256-D learned phase latent
- 29-D joint-position action with the original action scaling, clipping, PD gains, joint limits, and 50 Hz policy rate
- Frozen z2z controller stack: approach, physical-contact lift, transport, near-goal closed-loop pivot candidate switching, rolling guards, placement, recovery/get-up, and strict 3D terminal latch
- Default scene is formal seed `166559744`, episode `0000` from the paired 3×100 evaluation; movable target, box nudge, robot push, pause, and reset remain interactive
- The 129.1 MB actor is loaded only after the visitor clicks **Load live session**

The reported `283/300 = 94.3%` nominal carry success rate is from the formal
CUDA 3×100 evaluation. The live viewer uses the same actor, latents, controller
thresholds, default sample, and MuJoCo contact protocol, but runs ONNX/WASM in
the browser; the formal CUDA aggregate is not relabeled as a browser benchmark.

The actor is intentionally kept outside Git history. During Pages deployment, GitHub Actions downloads the public Release asset, verifies it, and injects it into the Pages artifact so browser loading is same-origin. Its expected SHA-256 is:

```text
198a8738a35c77e8dd901081e80877fbc2d18dcb6f79dc4c43bb8aa4dd5e45a2
```

## Preview locally

Serve this directory over HTTP:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. To test with a local actor without copying it into this repository, expose it as `static/live-mujoco/model.onnx` and open:

```text
http://localhost:8000/static/live-mujoco/?model=./model.onnx
```

## Main files

- `index.html` — project page and lazy-loaded live viewer
- `static/css/site.css` — responsive visual system
- `static/js/site.js` — overview tabs, section navigation, and lazy viewer loading
- `static/live-mujoco/` — generated browser viewer (MuJoCo + ONNX Runtime Web), licenses, and notices
- `static/paper/I-BFM.pdf` — manuscript
- `ebd2e43d024df6559dd51a95911e760d.mp4` — project video and hero background
