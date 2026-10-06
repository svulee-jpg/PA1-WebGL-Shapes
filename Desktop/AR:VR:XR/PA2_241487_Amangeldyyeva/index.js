const STUDENT_ID = "241487";

main();

function main() {
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL unavailable");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  /* 1. ШЕЙДЕРЫ */
  const vsSource = `
    attribute vec4 aPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main() {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
      vColor = aVertexColor;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;

  const program = createProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  const aPositionLoc = gl.getAttribLocation(program, "aPosition");
  const aVertexColorLoc = gl.getAttribLocation(program, "aVertexColor");
  const uModelLoc = gl.getUniformLocation(program, "uModelMatrix");
  const uViewLoc = gl.getUniformLocation(program, "uViewMatrix");
  const uProjLoc = gl.getUniformLocation(program, "uProjectionMatrix");

  /* 2. ТОЧКИ КУБИКА И ОКТАЭДРА */
  const cubeVerts = [
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
     0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,
     0.5, -0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
  ];

  const cubeColors = [];
  const faceColors = [
    [1.0, 0.2, 0.2, 1.0], [0.2, 1.0, 0.2, 1.0], [0.2, 0.4, 1.0, 1.0],
    [1.0, 1.0, 0.2, 1.0], [1.0, 0.5, 0.0, 1.0], [0.7, 0.2, 0.9, 1.0]
  ];
  for (let c of faceColors) {
    for (let i = 0; i < 6; i++) cubeColors.push(...c);
  }

  const top = [0, 0.5, 0], bot = [0, -0.5, 0];
  const px = [0.5, 0, 0],  nx = [-0.5, 0, 0];
  const pz = [0, 0, 0.5],  nz = [0, 0, -0.5];

  const octFaces = [
    top, px, pz,   top, pz, nx,   top, nx, nz,   top, nz, px,
    bot, pz, px,   bot, nx, pz,   bot, nz, nx,   bot, px, nz
  ];
  const octVerts = [];
  for (let p of octFaces) octVerts.push(...p);

  const octColors = [];
  const oCols = [
    [0.1, 0.9, 0.9, 1], [0.9, 0.1, 0.8, 1], [0.8, 0.9, 0.2, 1], [0.2, 0.8, 0.4, 1],
    [0.9, 0.5, 0.2, 1], [0.4, 0.3, 0.9, 1], [0.3, 0.8, 0.9, 1], [0.9, 0.9, 0.9, 1]
  ];
  for (let c of oCols) {
    for (let i = 0; i < 3; i++) octColors.push(...c);
  }

  const allVertices = new Float32Array([...cubeVerts, ...octVerts]);
  const allColors = new Float32Array([...cubeColors, ...octColors]);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, allVertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPositionLoc);

  const colBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, allColors, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aVertexColorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexColorLoc);

  /* 3. УПРАВЛЕНИЕ */
  const state = {
    t: 0,
    paused: false,
    ortho: false,
    fovDeg: 60,
    azimuthDeg: 0,
    aspect: 1
  };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    state.aspect = canvas.clientWidth / canvas.clientHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  document.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") state.paused = !state.paused;
    if (e.key === "o" || e.key === "O") state.ortho = !state.ortho;
    if (e.key === "+" || e.key === "=") state.fovDeg = Math.min(100, state.fovDeg + 5);
    if (e.key === "-" || e.key === "_") state.fovDeg = Math.max(20, state.fovDeg - 5);
    if (e.key === "ArrowLeft") state.azimuthDeg -= 5;
    if (e.key === "ArrowRight") state.azimuthDeg += 5;
    if (e.key === "r" || e.key === "R") {
      state.t = 0; state.paused = false; state.ortho = false; state.fovDeg = 60; state.azimuthDeg = 0;
    }
  });

  /* 4. ОТРИСОВКА И АНИМАЦИЯ */
  let then = 0;
  let frameCount = 0;
  let lastFpsUpdate = 0;
  let fps = 0;
  const statusEl = document.querySelector("#status");

  function render(now) {
    now *= 0.001;
    const dt = Math.min(now - then, 0.1);
    then = now;

    if (!state.paused) {
      state.t += dt;
    }

    frameCount++;
    if (now - lastFpsUpdate >= 1.0) {
      fps = frameCount / (now - lastFpsUpdate);
      frameCount = 0;
      lastFpsUpdate = now;
    }

    statusEl.textContent = `${STUDENT_ID} | ${state.ortho ? "Ortho" : "Perspective"} | FOV: ${state.fovDeg}° | t: ${state.t.toFixed(1)}s | FPS: ${Math.round(fps)}`;

    gl.clearColor(0.08, 0.08, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projMatrix = mat4.create();
    if (!state.ortho) {
      const fovRad = (state.fovDeg * Math.PI) / 180;
      mat4.perspective(projMatrix, fovRad, state.aspect, 0.5, 25.0);
    } else {
      const halfHeight = 3.6;
      const halfWidth = halfHeight * state.aspect;
      mat4.ortho(projMatrix, -halfWidth, halfWidth, -halfHeight, halfHeight, 0.5, 25.0);
    }
    gl.uniformMatrix4fv(uProjLoc, false, projMatrix);

    const viewMatrix = mat4.create();
    let eye = vec3.fromValues(5.0, 3.0, 5.0);
    if (state.azimuthDeg !== 0) {
      const rot = mat4.create();
      mat4.rotateY(rot, rot, (state.azimuthDeg * Math.PI) / 180);
      vec3.transformMat4(eye, eye, rot);
    }
    mat4.lookAt(viewMatrix, eye, [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);

    const cubeM = cubeModelMatrix(state.t);
    gl.uniformMatrix4fv(uModelLoc, false, cubeM);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    const solidM = solidModelMatrix(state.t);
    gl.uniformMatrix4fv(uModelLoc, false, solidM);
    gl.drawArrays(gl.TRIANGLES, 36, 24);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function cubeModelMatrix(t) {
  const m = mat4.create();
  const axis = vec3.fromValues(1, 1, 1);
  vec3.normalize(axis, axis);
  mat4.rotate(m, m, 1.2 * t, axis);
  return m;
}

function solidModelMatrix(t) {
  const m = mat4.create();
  const T = 13.0;
  const orbitAngle = (2.0 * Math.PI * t) / T;
  const s = 0.65 + 0.15 * Math.sin((2.0 * Math.PI * t) / 3.0);

  mat4.rotateX(m, m, orbitAngle);
  mat4.translate(m, m, [0.0, 0.0, 2.5]);
  mat4.rotateY(m, m, 2.0 * t);
  mat4.scale(m, m, [s, s, s]);

  return m;
}

function createShader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createProgram(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}