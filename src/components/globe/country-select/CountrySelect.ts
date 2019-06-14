import countryColorMap from './countryColorMap';
import * as THREE from 'three';
import { Uniforms } from '../types';
import findKey from 'lodash/findKey';

interface CountrySelectParams {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  mapUniforms: Uniforms;
  lookupContext: CanvasRenderingContext2D;
  lookupTexture: THREE.Texture;
  camera: THREE.PerspectiveCamera;
}

class CountrySelect {
  private renderer: THREE.WebGLRenderer;
  private readonly lookupContext: CanvasRenderingContext2D;
  private readonly camera: THREE.PerspectiveCamera;
  private lookupTexture: THREE.Texture;
  private readonly scene: THREE.Scene;
  private mapUniforms: Uniforms;
  private colorIndex: number;

  public constructor({
    scene,
    renderer,
    mapUniforms,
    lookupContext,
    lookupTexture,
    camera,
  }: CountrySelectParams) {
    this.scene = scene;
    this.renderer = renderer;
    this.mapUniforms = mapUniforms;
    this.lookupContext = lookupContext;
    this.lookupTexture = lookupTexture;
    this.camera = camera;
    this.colorIndex = 0;

    this.highlightOcean();
  }

  public onCountryClick = (x: number, y: number): void => {
    this.cleanupContext();
    let pickedColorIndex = this.getPickColor(x, y);

    if (pickedColorIndex) {
      this.colorIndex = pickedColorIndex;
    } else if (this.colorIndex) {
      // if !pickedColorIndex then user clicked on ocean and we shouldn't change selected country
      pickedColorIndex = this.colorIndex;
    } else {
      this.highlightOcean();
      return;
    }

    const countryCode = findKey(
      countryColorMap,
      (countryColorIndex): boolean => countryColorIndex === pickedColorIndex
    );

    if (countryCode) {
      this.highlightCountry(countryCode);
      this.highlightOcean();
    }
  };

  private getPickColor(x: number, y: number): number {
    this.mapUniforms['outlineLevel'].value = 0;

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    let gl = this.renderer.context;
    let canvas = gl.canvas;

    let mouseX = x - canvas.offsetLeft;
    let mouseY = -y + canvas.height + canvas.offsetTop;

    let buf = new Uint8Array(4);
    gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    this.mapUniforms['outlineLevel'].value = 1;

    return buf[0];
  }

  private cleanupContext(): void {
    this.lookupContext.clearRect(0, 0, 256, 1);
    this.lookupTexture.needsUpdate = true;
  }

  private highlightOcean(): void {
    let ctx = this.lookupContext;
    ctx.fillStyle = 'rgb(10,10,10)';
    ctx.fillRect(0, 0, 1, 1);
    this.lookupTexture.needsUpdate = true;
  }

  private highlightCountry(countryCode?: string): void {
    this.cleanupContext();

    if (countryCode) {
      let colorIndex = countryColorMap[countryCode];

      let ctx = this.lookupContext;

      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(colorIndex, 0, 1, 1);
    }

    this.lookupTexture.needsUpdate = true;
  }
}

export default CountrySelect;
