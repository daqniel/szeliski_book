import { frag_default, vert_default } from "./shaders.js";
const DEG_TO_RADIANS = 0.0174533;

document.addEventListener("DOMContentLoaded", main, false);
//
// Start here
//

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Projection matrix
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  const DISTANCE_FROM_CAMERA = 20;

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // ModelView Matrix, default camera/view
  const modelViewMatrix = mat4.create();

  // translate square further back in scene
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -DISTANCE_FROM_CAMERA] //
  ); // amount to translate

  // Translate
  var x_trans = document.getElementById("2d_x_trans_slider").value;
  var y_trans = document.getElementById("2d_y_trans_slider").value;
  var translate_vector = vec3.fromValues(x_trans, y_trans, 0);

  // format for display in HTML
  var trans_mat_disp = mat3.create();
  trans_mat_disp = mat3.fromTranslation(trans_mat_disp, translate_vector);

  var trans_x_disp = document.getElementById("x_trans_disp");
  trans_x_disp.innerHTML = latex(`t_x = ${x_trans}`);
  renderMathInElement(trans_x_disp);
  var trans_y_disp = document.getElementById("y_trans_disp");
  trans_y_disp.innerHTML = latex(`t_y = ${y_trans}`);
  renderMathInElement(trans_y_disp);

  var translation_matrix_display = document.getElementById(
    "translation_matrix_display"
  );
  translation_matrix_display.innerHTML = latex(matToLatex(trans_mat_disp));
  renderMathInElement(translation_matrix_display);

  // perform translation
  mat4.translate(modelViewMatrix, modelViewMatrix, translate_vector);

  // Rotation
  var degree_rot = document.getElementById("2d_rotation_slider").value;
  var rotation_axis = vec3.fromValues(0, 0, 1);

  // format for display in HTML
  var rot_mat_disp = mat3.create();
  rot_mat_disp = mat3.fromRotation(rot_mat_disp, degree_rot * DEG_TO_RADIANS);

  var rotation_degree_display = document.getElementById(
    "rotation_degree_display"
  );
  rotation_degree_display.innerHTML = latex(
    `\\text{degree} = ${degree_rot}\\degree`
  );
  renderMathInElement(rotation_degree_display);

  var rotation_matrix_display = document.getElementById(
    "rotation_matrix_display"
  );
  rotation_matrix_display.innerHTML = latex(matToLatex(rot_mat_disp));
  renderMathInElement(rotation_matrix_display);

  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    -degree_rot * DEG_TO_RADIANS,
    rotation_axis
  );

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

var then = 0.0;

function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");

  // If we don't have a GL context, give up now

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vert_default, frag_default);

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  function render(now) {
    now *= 0.001;
    const deltatime = now - then;
    then = now;

    drawScene(gl, programInfo, initBuffers(gl), deltatime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
