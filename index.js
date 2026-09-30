main();

function main() {
  /*========== Create a WebGL Context ==========*/
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL unavailable");
    return;
  }

  /*========== Define and Store the Geometry ==========*/
  const ox = 0.15;
  const oy = 0.15;

  function shiftVertex(x, y, z) {
    const factor = z + 0.5;
    return [x + ox * factor, y + oy * factor, z];
  }

  // --- 1. КУБ (36 вершин = 6 граней) слева: x in [-0.75, -0.25]
  const cubeVerts = {
    flb: [-0.75, -0.25, -0.5],
    frb: [-0.25, -0.25, -0.5],
    frt: [-0.25,  0.25, -0.5],
    flt: [-0.75,  0.25, -0.5],
    blb: [-0.75, -0.25,  0.5],
    brb: [-0.25, -0.25,  0.5],
    brt: [-0.25,  0.25,  0.5],
    blt: [-0.75,  0.25,  0.5]
  };

  const cubePositionsRaw = [
    // Front face
    ...cubeVerts.flb, ...cubeVerts.frb, ...cubeVerts.frt,
    ...cubeVerts.flb, ...cubeVerts.frt, ...cubeVerts.flt,
    // Right face
    ...cubeVerts.frb, ...cubeVerts.brb, ...cubeVerts.brt,
    ...cubeVerts.frb, ...cubeVerts.brt, ...cubeVerts.frt,
    // Top face
    ...cubeVerts.flt, ...cubeVerts.frt, ...cubeVerts.brt,
    ...cubeVerts.flt, ...cubeVerts.brt, ...cubeVerts.blt,
    // Back face
    ...cubeVerts.brb, ...cubeVerts.blb, ...cubeVerts.blt,
    ...cubeVerts.brb, ...cubeVerts.blt, ...cubeVerts.brt,
    // Left face
    ...cubeVerts.blb, ...cubeVerts.flb, ...cubeVerts.flt,
    ...cubeVerts.blb, ...cubeVerts.flt, ...cubeVerts.blt,
    // Bottom face
    ...cubeVerts.blb, ...cubeVerts.brb, ...cubeVerts.frb,
    ...cubeVerts.blb, ...cubeVerts.frb, ...cubeVerts.flb
  ];

  const cubePositions = [];
  for (let i = 0; i < cubePositionsRaw.length; i += 3) {
    cubePositions.push(...shiftVertex(cubePositionsRaw[i], cubePositionsRaw[i+1], cubePositionsRaw[i+2]));
  }

  const cRed = [0.95, 0.26, 0.21, 1.0];
  const cGreen = [0.30, 0.69, 0.31, 1.0];
  const cBlue = [0.13, 0.59, 0.95, 1.0];
  const cYellow = [1.0, 0.85, 0.24, 1.0];
  const cPurple = [0.61, 0.15, 0.69, 1.0];
  const cOrange = [1.0, 0.60, 0.0, 1.0];
  const cCyan = [0.0, 0.85, 0.85, 1.0];

  const cubeColors = [
    // Front face -> ГРАДИЕНТ
    ...cRed, ...cGreen, ...cBlue,
    ...cRed, ...cBlue, ...cYellow,
    // Right face
    ...cPurple, ...cPurple, ...cPurple, ...cPurple, ...cPurple, ...cPurple,
    // Top face
    ...cOrange, ...cOrange, ...cOrange, ...cOrange, ...cOrange, ...cOrange,
    // Back face
    ...cBlue, ...cBlue, ...cBlue, ...cBlue, ...cBlue, ...cBlue,
    // Left face
    ...cYellow, ...cYellow, ...cYellow, ...cYellow, ...cYellow, ...cYellow,
    // Bottom face
    ...cGreen, ...cGreen, ...cGreen, ...cGreen, ...cGreen, ...cGreen
  ];

  // --- 2. ОКТАЭДР (24 вершины = 8 граней) справа: x = 0.5, r = 0.25
  const octVerts = {
    top:    [0.5,  0.25,  0.0],
    bottom: [0.5, -0.25,  0.0],
    right:  [0.75, 0.0,   0.0],
    left:   [0.25, 0.0,   0.0],
    front:  [0.5,  0.0,  -0.25],
    back:   [0.5,  0.0,   0.25]
  };

  const octaPositionsRaw = [
    // Верхние 4 грани
    ...octVerts.top, ...octVerts.left, ...octVerts.front,
    ...octVerts.top, ...octVerts.front, ...octVerts.right,
    ...octVerts.top, ...octVerts.right, ...octVerts.back,
    ...octVerts.top, ...octVerts.back, ...octVerts.left,
    // Нижние 4 грани
    ...octVerts.bottom, ...octVerts.front, ...octVerts.left,
    ...octVerts.bottom, ...octVerts.right, ...octVerts.front,
    ...octVerts.bottom, ...octVerts.back, ...octVerts.right,
    ...octVerts.bottom, ...octVerts.left, ...octVerts.back
  ];

  const octaPositions = [];
  for (let i = 0; i < octaPositionsRaw.length; i += 3) {
    octaPositions.push(...shiftVertex(octaPositionsRaw[i], octaPositionsRaw[i+1], octaPositionsRaw[i+2]));
  }

  const octaColors = [
    // Грань 1 -> ГРАДИЕНТ
    ...cRed, ...cGreen, ...cCyan,
    // Плоские цвета
    ...cYellow, ...cYellow, ...cYellow,
    ...cPurple, ...cPurple, ...cPurple,
    ...cOrange, ...cOrange, ...cOrange,
    ...cBlue, ...cBlue, ...cBlue,
    ...cGreen, ...cGreen, ...cGreen,
    ...cCyan, ...cCyan, ...cCyan,
    ...cRed, ...cRed, ...cRed
  ];

  const positions = [...cubePositions, ...octaPositions];
  const colors = [...cubeColors, ...octaColors];

  console.assert(colors.length === (positions.length / 3) * 4, "Color array length mismatch!");

  const cubeVertexCount = cubePositions.length / 3;
  const octaVertexCount = octaPositions.length / 3;

  const buffers = initBuffers(gl, positions, colors);

  /*========== Shaders ==========*/
  const vsSource = `
    attribute vec4 aPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    void main() {
      gl_Position = aPosition;
      vColor = aVertexColor;
      gl_PointSize = 6.0;
    }
  `;

  const fsSource = `
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;

  const vShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = createProgram(gl, vShader, fShader);

  /*====== Connect the attributes with the vertex shader ======*/
  const aPosition = gl.getAttribLocation(program, "aPosition");
  const aVertexColor = gl.getAttribLocation(program, "aVertexColor");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(aVertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexColor);

  /*========== Drawing ==========*/
  const modes = {
    "1": { mode: gl.TRIANGLES, name: "gl.TRIANGLES" },
    "2": { mode: gl.LINE_LOOP, name: "gl.LINE_LOOP" },
    "3": { mode: gl.LINES, name: "gl.LINES" },
    "4": { mode: gl.LINE_STRIP, name: "gl.LINE_STRIP" },
    "5": { mode: gl.POINTS, name: "gl.POINTS" },
    "6": { mode: gl.TRIANGLE_STRIP, name: "gl.TRIANGLE_STRIP" }
  };

  const state = {
    mode: gl.TRIANGLES,
    modeName: "gl.TRIANGLES",
    depth: true,
    cubeFirst: true
  };

  const statusEl = document.querySelector("#status");

  function render() {
    if (state.depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    gl.clearColor(0.12, 0.12, 0.12, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const firstDraw = state.cubeFirst ? { first: 0, count: cubeVertexCount } : { first: cubeVertexCount, count: octaVertexCount };
    const secondDraw = state.cubeFirst ? { first: cubeVertexCount, count: octaVertexCount } : { first: 0, count: cubeVertexCount };

    gl.drawArrays(state.mode, firstDraw.first, firstDraw.count);
    gl.drawArrays(state.mode, secondDraw.first, secondDraw.count);

    statusEl.textContent = `Student ID: 241487 | Mode: ${state.modeName} | Depth: ${state.depth ? "ON" : "OFF"} | Draw order: ${state.cubeFirst ? "Cube -> Solid" : "Solid -> Cube"}`;
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    if (modes[key]) {
      state.mode = modes[key].mode;
      state.modeName = modes[key].name;
      render();
    } else if (key === "D") {
      state.depth = !state.depth;
      render();
    } else if (key === "S") {
      state.cubeFirst = !state.cubeFirst;
      render();
    }
  });

  render();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  return program;
}

function initBuffers(gl, positions, colors) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return { position: positionBuffer, color: colorBuffer };
}