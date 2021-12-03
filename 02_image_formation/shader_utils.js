// Compile shaders
export function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // send source to obj
  gl.shaderSource(shader, source);

  // compile shader
  gl.compileShader(shader);

  // check if successful
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shader: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  // return compiled shader
  return shader;
}

// Link shader program
export function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // shader program creation
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);


  // check if shader program linking failed
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  const numAttribs = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttribs; ++i)
  {
    const attribInfo = gl.getActiveAttrib(shaderProgram, i);
    const idx = gl.getAttribLocation(shaderProgram, attribInfo.name);
    console.log(idx, attribInfo.name);
  }

  const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; ++i)
  {
    const uniformInfo = gl.getActiveUniform(shaderProgram, i);
    const idx = gl.getUniformLocation(shaderProgram, uniformInfo.name);
    console.log(idx, uniformInfo.name);
  }

  return {
    program: shaderProgram,
  }
}