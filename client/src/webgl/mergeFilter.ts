import { getMergeFS, getVSForMerge } from "./shaders";
//import { computeKernelWeight, getBlurFilterKernel } from "./webglUtils";

const renderCanvas = document.createElement("canvas");
const sourceTextureSize = [0, 0];

/*
const blurKernel = getBlurFilterKernel("gaussianBlur");
const kernelWeight = computeKernelWeight(blurKernel);
*/

let glProgram: WebGLProgram;

let renderImageCoordinatesBuffer: WebGLBuffer | null;
let renderImageTexureCoordinatesBuffer: WebGLBuffer | null;

let gl: WebGL2RenderingContext | WebGLRenderingContext;

let textureCount: number;
import { createProgramFromSources } from "twgl.js";

export function setupMergeFilter(): void {
  const glCtx = renderCanvas.getContext("webgl");
  if (!glCtx) {
    throw new Error("Couldn't get a webgl context for combining the overlays!");
    return;
  }
  gl = glCtx;

  gl.clearColor(0.0, 0.0, 0.0, 1.0); // black, fully opaque
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // buffers for the textured plane in normalized space
  renderImageCoordinatesBuffer = gl.createBuffer();
  renderImageTexureCoordinatesBuffer = gl.createBuffer();
  const renderImageVertices = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
  gl.bindBuffer(gl.ARRAY_BUFFER, renderImageCoordinatesBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(renderImageVertices),
    gl.STATIC_DRAW
  );

  const renderImageTextureCoordinates = [0, 0, 1, 0, 0, 1, 1, 1];
  gl.bindBuffer(gl.ARRAY_BUFFER, renderImageTexureCoordinatesBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(renderImageTextureCoordinates),
    gl.STATIC_DRAW
  );
}

//handle webgl context loss
renderCanvas.addEventListener(
  "webglcontextlost",
  (event) => {
    //console.log("Webgl Context lost");
    event.preventDefault();
    console.log("Webgl Context Lost! Restarting application necessary!");
    //showSnackbar("Webgl Context Lost! Restarting application necessary!", SnackbarType.ERROR, 4000);
    //init();
  },
  false
);
// TODO: renderCanvas.addEventListener("webglcontextrestored", init, false);

function setupProgram(): void {
  //! the blur size needs to be defined as a constant so it can be used as an array index in the shader!
  //const blurShaderSource = `#version 300 es\n#define MSIZE ${blurSize}` + getGaussianBlurFS();
  const mergeShaderSource =
    `#define NUM_TEXTURES ${textureCount.toString()}\n` + getMergeFS();
  //console.log(blurShaderSource);

  // create and link program
  /* eslint-disable */
  glProgram = createProgramFromSources(gl, [
    getVSForMerge(),
    mergeShaderSource,
  ]);

  // the coordinate attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, renderImageCoordinatesBuffer);
  const coordinateLocation = gl.getAttribLocation(glProgram, "coordinate");
  gl.enableVertexAttribArray(coordinateLocation);
  gl.vertexAttribPointer(coordinateLocation, 3, gl.FLOAT, false, 0, 0);

  // the textureCoordinate attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, renderImageTexureCoordinatesBuffer);
  const textureCoordinateLocation = gl.getAttribLocation(
    glProgram,
    "textureCoordinate"
  );
  gl.enableVertexAttribArray(textureCoordinateLocation);
  gl.vertexAttribPointer(textureCoordinateLocation, 2, gl.FLOAT, false, 0, 0);
}

function setupSourceTexture(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  sourceTextureImages: HTMLImageElement[]
): WebGLTexture[] {
  const textures: WebGLTexture[] = [];
  for (let ii = 0; ii < sourceTextureImages.length; ii++) {
    const sourceTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + ii);
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); //* to premultiply alpha

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      sourceTextureImages[ii]
    );

    if (sourceTexture) {
      textures.push(sourceTexture);
    }
  }
  return textures;
}

function render(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  sourceTexture: WebGLTexture[]
): void {
  gl.viewport(0, 0, renderCanvas.width, renderCanvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(glProgram);

  // set up the sourceTextureSize
  gl.uniform2f(
    gl.getUniformLocation(glProgram, "sourceTextureSize"),
    sourceTextureSize[0],
    sourceTextureSize[1]
  );
  // set up the sourceTexelSize
  gl.uniform2f(
    gl.getUniformLocation(glProgram, "sourceTexelSize"),
    1.0 / sourceTextureSize[0],
    1.0 / sourceTextureSize[1]
  );

  const textureLoc = gl.getUniformLocation(glProgram, "u_textures[0]");
  gl.uniform1iv(textureLoc, Array.from(Array(textureCount).keys())); //uniform variable location and texture Index (or array of indices)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export function applyMerge(images: HTMLImageElement[]): HTMLCanvasElement {
  sourceTextureSize[0] = images[0].width;
  sourceTextureSize[1] = images[0].height;

  renderCanvas.width = images[0].width;
  renderCanvas.height = images[0].height;

  const ctx = gl;
  if (!ctx) {
    throw new Error("GL context not available for merge!");
  }

  textureCount = images.length;
  setupProgram();

  const textures = setupSourceTexture(ctx, images);
  render(ctx, textures);

  /*
  // setup textures
  const textureArr = [];
  for (let ii = 0; ii < textures.length; ++ii) {
    const texture = setupSourceTexture(ctx, textures[ii]);
    textureArr.push(texture);
  }
  textureArr.forEach((element) => {
    render(ctx, element, blurStrength);
  });
  */

  return renderCanvas;
}
