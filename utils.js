//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function latex(str) {
  return "\\(" + str + "\\)";
}

function matToLatex(mat) {
  nn = mat.length;
  n = Math.sqrt(mat.length)
  var output = "";
  for (let i = 0; i < n; i++) {
    for (let j = i; j < nn; j += n) {
      let val = mat[j] == 0 ? 0 : mat[j].toFixed(1);
      output += val;
      if (j != i + n - 1) output += "&";
    }
    output += "\\\\";
  }

  return "\\begin{bmatrix}" + output + "\\end{bmatrix}";
}

// Compile shaders
function loadShader(gl, type, source) {
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
function initShaderProgram(gl, vsSource, fsSource) {
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

  const numAttribs = gl.getProgramParameter(
    shaderProgram,
    gl.ACTIVE_ATTRIBUTES
  );
  for (let i = 0; i < numAttribs; ++i) {
    const attribInfo = gl.getActiveAttrib(shaderProgram, i);
    const idx = gl.getAttribLocation(shaderProgram, attribInfo.name);
    console.log(idx, attribInfo.name);
  }

  const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; ++i) {
    const uniformInfo = gl.getActiveUniform(shaderProgram, i);
    const idx = gl.getUniformLocation(shaderProgram, uniformInfo.name);
    console.log(idx, uniformInfo.name);
  }

  return {
    program: shaderProgram,
  };
}
