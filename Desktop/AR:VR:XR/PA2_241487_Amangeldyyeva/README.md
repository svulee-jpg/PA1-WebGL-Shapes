# PA1 — 3D Shapes in WebGL

- Course: AR/VR/XR Applications (6B04103 AI Business, 3rd year)
- Student Name: Saule Amangeldyyeva
- Student ID: 241487

## Variant Configuration
- Second-to-last digit (8): 8 mod 4 = 0 -> Depth Offset Vector (ox, oy) = (+0.15, +0.15)
  - Visible cube faces with Depth Test ON: Front, Top, and Right
- Last digit (7): Assigned Solid: Octahedron (8 triangular faces = 24 vertices)

## How to Run
1. Open this directory in VS Code.
2. Launch with a local web server (e.g. extension "Live Server", Python `python -m http.server 8000`, or Servez).
3. Open `http://localhost:5500` (or the appropriate port) in Google Chrome or Mozilla Firefox.

## Keyboard Controls
- 1: gl.TRIANGLES (default)
- 2: gl.LINE_LOOP
- 3: gl.LINES
- 4: gl.LINE_STRIP
- 5: gl.POINTS (gl_PointSize set)
- 6: gl.TRIANGLE_STRIP
- D: Toggle depth testing on/off
- S: Swap draw order (Cube first <-> Solid first)
