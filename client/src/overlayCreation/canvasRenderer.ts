import { MapboxMap } from "react-map-gl";
import * as twgl from "twgl.js";
import { metersInPixel } from "../components/Map/mapUtils";
import { Filter, FilterGroup } from "../components/Sidebar/Filter/Filters";
import {
  applyGaussianBlur,
  setupGaussianBlurFilter,
} from "../webgl/gaussianBlurFilter";
import {
  combineOverlayFragmentShader,
  defaultVertexShader,
} from "../webgl/shaders";
import {
  makeAlphaMask as applyAlphaMask,
  readImageFromCanvas,
} from "./canvasUtils";
import {
  bindAttribute,
  createBuffer,
  createTexture,
  setRectangle,
  setupCanvasForDrawing,
} from "./../webgl/webglUtils";
import MapLayerManager from "../mapLayerMangager";
import MapStore from "../stores/MapStore";
import LegendStore from "../stores/LegendStore";
import {
  endPerformanceMeasure,
  startPerformanceMeasure,
} from "../../../shared/benchmarking";
import { applyMerge, setupMergeFilter } from "../webgl/mergeFilter";
//import WebWorker from "worker-loader!../worker";

// the number of textures to combine
let textureCount;

class CanvasRenderer {
  //2D canvas api
  private overlayCanvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private map: MapboxMap;

  // webgl resources
  private glCtx!: WebGL2RenderingContext | WebGLRenderingContext;
  private glProgram!: WebGLProgram;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // others
  private weights: number[] = [];
  allTextures: HTMLImageElement[] = [];

  private currentBlurSize = 0;
  //this.currentBlurType = BlurType.WebglBlur

  constructor(map: MapboxMap) {
    const canvas = document.querySelector(
      "#texture_canvas"
    ) as HTMLCanvasElement;
    canvas.width = map.getCanvas().clientWidth;
    canvas.height = map.getCanvas().clientHeight;
    this.map = map;
    this.overlayCanvas = canvas;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No 2d context in canvasRenderer available!");
    }
    this.ctx = context;

    // setup the webgl code for the gaussian blur filter
    setupGaussianBlurFilter();
    setupMergeFilter();
  }

  /**
   * Draws all polygons for the given filter on a canvas and applies a blur effect.
   * @param mapLayer the current filter layer, e.g. one for park, restaurant, etc.
   */
  async renderPolygons(mapLayer: Filter[], relevance: number): Promise<any> {
    // clear the canvas
    this.ctx.clearRect(
      0,
      0,
      this.overlayCanvas.width,
      this.overlayCanvas.height
    );
    this.weights.push(relevance);
    this.calculateBlurSize(mapLayer[0].distance);
    startPerformanceMeasure("RenderLayerPolygons");
    if (mapLayer.length === 1) {
      // calculate the blur size for this layer based on the distance the user specified

      if (mapLayer[0].wanted) {
        //fill canvas black initially
        this.ctx.fillStyle = "rgba(0.0, 0.0, 0.0, 1.0)";
        this.ctx.fillRect(
          0,
          0,
          this.overlayCanvas.width,
          this.overlayCanvas.height
        );

        // fill polygons white, fully opaque
        this.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
      } else {
        //fill canvas white initially
        this.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        this.ctx.fillRect(
          0,
          0,
          this.overlayCanvas.width,
          this.overlayCanvas.height
        );

        // fill polygons black, fully opaque
        this.ctx.fillStyle = "rgba(0.0, 0.0, 0.0, 1.0)";
      }

      for (const polygon of mapLayer[0].points) {
        //let start = performance.now();
        const startPoint = polygon[0];
        if (!startPoint) {
          continue;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);

        // draw the polygon
        for (let index = 1; index < polygon.length; index += 1) {
          if (polygon[index] && polygon[index]) {
            this.ctx.lineTo(polygon[index].x, polygon[index].y);
          }
        }
        this.ctx.closePath();

        this.ctx.fill("evenodd");
      }

      endPerformanceMeasure("RenderLayerPolygons");

      await this.applyGaussianBlur();

      startPerformanceMeasure("ReadAndSaveLayer");
      const blurredImage = await readImageFromCanvas(this.overlayCanvas);
      // save the blurred image for this layer
      this.allTextures.push(blurredImage);
      endPerformanceMeasure("ReadAndSaveLayer");
    } else {
      console.log("else");
      const images: HTMLImageElement[] = [];
      for (let i = 0; i < mapLayer.length; i++) {
        if (mapLayer[i].wanted) {
          //fill canvas black initially
          this.ctx.fillStyle = "rgba(0.0, 0.0, 0.0, 1.0)";
          this.ctx.fillRect(
            0,
            0,
            this.overlayCanvas.width,
            this.overlayCanvas.height
          );

          // fill polygons white, fully opaque
          this.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        } else {
          //fill canvas white initially
          this.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
          this.ctx.fillRect(
            0,
            0,
            this.overlayCanvas.width,
            this.overlayCanvas.height
          );

          // fill polygons black, fully opaque
          this.ctx.fillStyle = "rgba(0.0, 0.0, 0.0, 1.0)";
        }

        /*
      //* for benchmarking:
      let renderPolyBenchmarks = 0;
      let blurBenchmarks = 0;
      const avgBlur = [];
      */

        for (const polygon of mapLayer[i].points) {
          //let start = performance.now();
          const startPoint = polygon[0];
          if (!startPoint) {
            continue;
          }

          this.ctx.beginPath();
          this.ctx.moveTo(startPoint.x, startPoint.y);

          // draw the polygon
          for (let index = 1; index < polygon.length; index += 1) {
            if (polygon[index] && polygon[index]) {
              this.ctx.lineTo(polygon[index].x, polygon[index].y);
            }
          }
          this.ctx.closePath();

          this.ctx.fill("evenodd");

          /*
        //! this code is used to measure performance for every polygon blur for benchmarking!
        let end = performance.now();
        renderPolyBenchmarks += end - start;
  
        start = performance.now();
        await this.applyGaussianBlur();
        end = performance.now();
        const diff = end - start;
        blurBenchmarks += diff;
        avgBlur.push(diff);
        */
        }
        const layerImage = await readImageFromCanvas(this.overlayCanvas);
        images.push(layerImage);
      }

      endPerformanceMeasure("RenderLayerPolygons");

      this.ctx.clearRect(
        0,
        0,
        this.overlayCanvas.width,
        this.overlayCanvas.height
      );
      this.applyColorMerge(images);
      await this.applyGaussianBlur();
      startPerformanceMeasure("ReadAndSaveLayer");
      const blurredImage = await readImageFromCanvas(this.overlayCanvas);
      // save the blurred image for this layer
      this.allTextures.push(blurredImage);
      endPerformanceMeasure("ReadAndSaveLayer");
    }
  }

  //TODO: find a better function to bring the pixelDistance in relation to the blur size
  //TODO: -> should probably rise quite slow (upper bound may not even be necessary then?)
  calculateBlurSize(layerDistance: number): void {
    const pixelDist = metersInPixel(
      layerDistance,
      this.map.getCenter().lat,
      this.map.getZoom()
    );

    // divide by 2 to make it look a bit sharper
    // floor is needed for glsl to provide an integer which can be used as the matrix size
    let blurStrength = Math.floor(pixelDist / 2);

    //! define upper and lower bounds to prevent dividing by zero in glsl or getting a too large kernel
    //! these bounds are not really necessary for the canvas blur and the fastgaußblur
    if (blurStrength <= 5) {
      blurStrength = 5;
    } else if (blurStrength >= 80) {
      blurStrength = 80;
    }

    this.currentBlurSize = blurStrength;
  }

  applyColorMerge(images: HTMLImageElement[]): void {
    const mergedCanvas = applyMerge(images);
    this.ctx.drawImage(mergedCanvas, 0, 0);
  }
  async applyGaussianBlur(): Promise<void> {
    startPerformanceMeasure("GetImageFromCanvas");
    const img = await readImageFromCanvas(this.overlayCanvas);
    endPerformanceMeasure("GetImageFromCanvas");

    startPerformanceMeasure("BlurImage");
    const blurredCanvas = applyGaussianBlur(img, this.currentBlurSize);
    endPerformanceMeasure("BlurImage");

    // draw the blurred canvas on the overlayCanvas
    this.ctx.drawImage(blurredCanvas, 0, 0);
  }

  /**
   * * Utility-Function to normalize all importance scores for all textures so they add up to 1
   * * but at the same time keep their relative importance to the other layers
   */

  normalizeWeights(textureCount: number): void {
    let sum = 0;
    for (let i = 0; i < textureCount; i++) {
      sum += this.weights[i];
    }
    // calculate a normalizer value so that all values will eventually sum up to 1
    const normalizer = 1 / sum;
    // normalize all values
    for (let index = 0; index < this.weights.length; index++) {
      this.weights[index] *= normalizer;
    }
  }

  /**
   * Combines the given image textures into one overlay canvas that can be used as a canvas layer for mapbox.
   * @param textureLayers the image elements that need to be comined for the final overlay
   */
  combineOverlays(textureLayers: HTMLImageElement[]): any {
    if (textureLayers.length === 0) {
      console.log("TextureLayers are empty! Overlay can't be created!");
      return;
    }

    // create an in-memory canvas and set width and height to fill the whole map on screen
    const canvas = document.createElement("canvas");
    canvas.width = this.map.getCanvas().clientWidth;
    canvas.height = this.map.getCanvas().clientHeight;

    //handle webgl context loss
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        console.log("Webgl Context lost");
        event.preventDefault();
      },
      false
    );
    canvas.addEventListener(
      "webglcontextrestored",
      () => {
        //this.combineOverlays(textureLayers);
        console.log("context restored! reloadin application...");
      },
      false
    );

    //options: {stencil: true, antialias: true, premultipliedAlpha: false, alpha: false, preserveDrawingBuffer: false});
    const gl = canvas.getContext("webgl");
    if (!gl) {
      // TODO: handleWebglInitError();
      return;
    }

    this.glCtx = gl;

    // set the number of texture to use
    textureCount = textureLayers.length;
    //* Add the textureCount to the top of the fragment shader so it can dynamically use the
    //* correct number of textures. The shader MUST be created (or updated) AFTER the textureCount
    //* variable has been set as js/ts won't update the string itself when textureCount changes later.
    const fragmentSource =
      `#define NUM_TEXTURES ${textureCount.toString()}\n` +
      combineOverlayFragmentShader();
    const vertexSource = defaultVertexShader();

    // create and link program
    const program = twgl.createProgramFromSources(gl, [
      vertexSource,
      fragmentSource,
    ]);

    // lookup attributes
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // lookup uniforms
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const weightsLoc = gl.getUniformLocation(program, "u_weights[0]");
    // lookup the location for the textures
    const textureLoc = gl.getUniformLocation(program, "u_textures[0]");

    // setup buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //* this works only because all images have the same size!
    setRectangle(gl, 0, 0, textureLayers[0].width, textureLayers[0].height);

    // texture coordinates are always in the space between 0.0 and 1.0
    const texcoordBuffer = createBuffer(
      gl,
      new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
      ])
    );

    // setup textures
    const textures = [];
    for (let ii = 0; ii < textureLayers.length; ++ii) {
      const texture = createTexture(gl, textureLayers[ii], ii, gl.NEAREST);
      textures.push(texture);
    }

    // ##### drawing code: #####

    setupCanvasForDrawing(gl, [0.0, 0.0, 0.0, 0.0]);

    gl.useProgram(program);

    //gl.disable(gl.DEPTH_TEST);

    // Turn on the position attribute
    bindAttribute(gl, positionBuffer, positionLocation);
    // Turn on the texcoord attribute
    bindAttribute(gl, texcoordBuffer, texcoordLocation);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    this.normalizeWeights(textureLayers.length);
    gl.uniform1fv(weightsLoc, this.weights);

    // Tell the shader to use texture units 0 to textureCount - 1
    gl.uniform1iv(textureLoc, Array.from(Array(textureCount).keys())); //uniform variable location and texture Index (or array of indices)

    // see https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png/
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); //* this is the correct one for pre-multiplied alpha
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); //* this is the correct one for un-premultiplied alpha

    const vertexCount = 6; // 2 triangles for a rectangle
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

    gl.disable(gl.BLEND);

    this.ctx.drawImage(canvas, 0, 0);

    //cleanup and delete webgl resources
    this.cleanupResources();
  }

  createOverlay(textures: HTMLImageElement[]): HTMLCanvasElement {
    startPerformanceMeasure("CombiningTextures");
    this.combineOverlays(textures);
    endPerformanceMeasure("CombiningTextures");
    return this.overlayCanvas;
  }

  /**
   * Cleanup webgl resources to prevent memory leaks,
   * see https://stackoverflow.com/questions/23598471/how-do-i-clean-up-and-unload-a-webgl-canvas-context-from-gpu-after-use
   */
  cleanupResources(): void {
    // desallocate memory and free resources to avoid memory leak issues
    /* eslint-disable */
    const numTextureUnits = this.glCtx.getParameter(
      this.glCtx.MAX_TEXTURE_IMAGE_UNITS
    );
    for (let unit = 0; unit < numTextureUnits; ++unit) {
      this.glCtx.activeTexture(this.glCtx.TEXTURE0 + unit);
      this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
      this.glCtx.bindTexture(this.glCtx.TEXTURE_CUBE_MAP, null);
    }

    this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
    this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    this.glCtx.bindRenderbuffer(this.glCtx.RENDERBUFFER, null);
    this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);

    // Delete all your resources
    this.glCtx.deleteProgram(this.glProgram);
    this.glCtx.deleteBuffer(this.positionBuffer);
    this.glCtx.deleteBuffer(this.texCoordBuffer);

    //this.glCtx.getExtension("WEBGL_lose_context")?.loseContext();
    //this.glCtx.getExtension("WEBGL_lose_context")?.restoreContext();
  }

  /**
   * Reset weights and textures for next draw.
   */
  reset(): void {
    this.weights = [];
    this.allTextures.forEach((texture) => {
      texture.remove();
    });
    // clear images by setting its length to 0
    this.allTextures = [];
  }
}

export async function createOverlay(
  data: FilterGroup[],
  map: MapboxMap,
  mapStore: MapStore,
  legendStore: LegendStore
): Promise<void> {
  const renderer = new CanvasRenderer(map);

  startPerformanceMeasure("CreateCanvasLayer");
  startPerformanceMeasure("RenderAllPolygons");
  const allRenderProcesses = data.map((group) => {
    return renderer.renderPolygons(group.filters, group.groupRelevance);
  });
  await Promise.all(allRenderProcesses);
  endPerformanceMeasure("RenderAllPolygons");
  //console.log("Current number of saved textures in canvasRenderer: ", renderer.allTextures.length);

  const resultCanvas = renderer.createOverlay(renderer.allTextures);
  endPerformanceMeasure("CreateCanvasLayer");

  applyAlphaMask(resultCanvas, map, new MapLayerManager(mapStore, legendStore));

  //Reset state for next rendering
  renderer.reset();
  //console.log("finished blurring and compositing");
}
