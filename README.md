# I-BFM project website

Static project page for **I-BFM: Reward-Conditioned Robust Humanoid Interaction via Unsupervised Reinforcement Learning**.

## Website

- **Project website:** [https://iamhardworking.github.io/I-BFM/](https://iamhardworking.github.io/I-BFM/)
- **Source repository:** [https://github.com/iamhardworking/I-BFM](https://github.com/iamhardworking/I-BFM)
- **Code repository (private):** [https://github.com/iamhardworking/I-BFM-Code](https://github.com/iamhardworking/I-BFM-Code)

## Live MuJoCo viewer

The interactive section runs real MuJoCo WebAssembly physics and the original 166.560M-step FP32 ONNX actor in the browser. It is not a prerecorded trace or a CSS controller preview.

- 1252-D actor input assembled from current robot/object/contact state, action history, privileged context, and the selected 256-D learned phase latent
- 29-D joint-position action with the original action scaling, clipping, PD gains, joint limits, and 50 Hz policy rate
- The [Carry Box viewer](https://iamhardworking.github.io/I-BFM/static/live-mujoco/?task=carry) retains its frozen approach/lift/transport/place/recovery stack
- Movable target, box nudge, robot push, pause, and reset remain interactive in the carry session
- The 129.1 MB actor is loaded only after the visitor clicks the **Load carry session** button

## Showcase videos

The real-world showcase appears before Results in this order: Robust Carry Box,
Robust Push Box, Robust Kick Box, and Robust Goal Reaching. All four published
MP4 files have no audio track. Each video starts when scrolled into view and loops.
The Overview project movie retains its audio and sound toggle; the hero background
uses a separate silent copy of its video stream.

Additional real-world clips are grouped beneath the matching showcase: Carry (`carry-1`, `getup-and-carry-1`), Push (`push-1`, `push2-1`), and Kick (`normal-kick-1`, `kick1-1`). These clips live under `static/video/{carry,push,kick}/` and use a two-column layout that stacks on mobile.

The Results section presents the formal 3×100 evaluations for three tasks and
three conditions using the same 166.560M policy:

| Condition | Carry Box | Push Box | Kick Box |
| --- | ---: | ---: | ---: |
| Nominal | 283/300 (94.33%) | 270/300 (90.00%) | 245/300 (81.67%) |
| Box disturbance (SR-O) | 273/300 (91.00%) | 256/300 (85.33%) | 239/300 (79.67%) |
| Robot disturbance (SR-R) | 268/300 (89.33%) | 254/300 (84.67%) | 260/300 (86.67%) |

The corresponding local source report is
`analysis/166.560M-push-kick-grid5x5-benchmark/EVAL_CARRY_PUSH_KICK_5X5_COMBINED.md`.
Each cell shows one selected successful simulation video. The nominal Carry and
box-disturbance Carry clips come from existing 166.560M recordings; the nominal
and box-disturbance Push/Kick clips replay successful benchmark samples selected
by seed and episode. The SR-R clips are selected from 12 validated recordings
per task. Videos illustrate the condition; all reported success rates use 300
evaluation episodes per task and condition.

The box-disturbance Kick Box clip replays seed `166559744`, episode `27` from
the formal benchmark. The replacement recording reaches the success criterion
at 16.5 s after a complete 200 N, 0.2 s box disturbance, with zero physical
hand-to-box contact steps and zero robot falls in its recorded trace. It uses a
45° side camera to keep the foot interaction visible.

Carry uses a 3D `<0.20 m` goal criterion within 60 s. Push and Kick use an XY
`≤0.20 m` criterion within 90 s. Each criterion must hold for 100 control
steps. The box disturbance is a 200 N force for 0.2 s: downward for Carry,
random fixed XY direction for Push/Kick with a 2 m flight limit. The robot
disturbance is a 2,000 N downward pelvis force for 0.3 s. Disturbances trigger
when the box first reaches half its initial XY distance to the goal.

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

- `index.html` — project page and lazy-loaded carry viewer
- `static/css/site.css` — responsive visual system
- `static/js/site.js` — overview tabs, section navigation, and lazy viewer loading
- `static/live-mujoco/` — generated browser viewer (MuJoCo + ONNX Runtime Web), licenses, and notices
- `static/video/{nominal,sro,srr}-*.mp4` — one representative success rollout per task and condition
- `static/paper/I-BFM.pdf` — manuscript
- `ebd2e43d024df6559dd51a95911e760d.mp4` — project video and hero background
