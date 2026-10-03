# Third-party notices

This I-BFM browser viewer is derived from [humanoid-policy-viewer](https://github.com/Axellwppr/humanoid-policy-viewer) and preserves its BSD-3-Clause license. Third-party components and robot assets retain their respective licenses.

## Code and libraries

- **Three.js r151** — MIT; the viewer includes a modified `Reflector.js`. See `LICENSES/Three.js-MIT.txt`.
- **MuJoCo / mujoco-js** — Apache-2.0. See `LICENSES/Apache-2.0.txt`.
- **MuJoCo WASM community** — acknowledgements to `zalo/mujoco_wasm` and `stillonearth/MuJoCo-WASM`. See `LICENSES/MuJoCo-WASM-MIT.txt`.
- **ONNX Runtime Web** and **Vue** — MIT.
- Build/test dependencies are listed in `package.json` and retain their own licenses.

## Robot assets

The G1 robot description and meshes under `public/examples/scenes/g1/` originate from Unitree Robotics, with I-BFM scene adaptations. See `LICENSES/Unitree-BSD-3-Clause.txt`.

## I-BFM policy

The I-BFM 166.560M-step FP32 actor is not bundled in this repository or its Git history. The viewer downloads it from the configured external URL only after explicit user interaction. Its expected SHA-256 is `198a8738a35c77e8dd901081e80877fbc2d18dcb6f79dc4c43bb8aa4dd5e45a2`.
