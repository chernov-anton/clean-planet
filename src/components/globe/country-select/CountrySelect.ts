import countryColorMap from './countryColorMap';
import * as THREE from 'three';
import { CountryChangeCallback, Uniforms } from '../types';
import findKey from 'lodash/findKey';
import { getMarker, removeMarker, Marker } from '../marker/Marker';

interface CountrySelectParams {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  mapUniforms: Uniforms;
  lookupContext: CanvasRenderingContext2D;
  lookupTexture: THREE.Texture;
  camera: THREE.PerspectiveCamera;
  onCountryChange: CountryChangeCallback;
}

class CountrySelect {
  private renderer: THREE.WebGLRenderer;
  private readonly lookupContext: CanvasRenderingContext2D;
  private readonly camera: THREE.PerspectiveCamera;
  private lookupTexture: THREE.Texture;
  private readonly scene: THREE.Scene;
  private mapUniforms: Uniforms;
  private previousColorIndex: number;
  private readonly onCountryChange: CountryChangeCallback;
  public marker?: Marker;

  public constructor({
    scene,
    renderer,
    mapUniforms,
    lookupContext,
    lookupTexture,
    camera,
    onCountryChange,
  }: CountrySelectParams) {
    this.scene = scene;
    this.renderer = renderer;
    this.mapUniforms = mapUniforms;
    this.lookupContext = lookupContext;
    this.lookupTexture = lookupTexture;
    this.camera = camera;
    this.previousColorIndex = 0;
    this.onCountryChange = onCountryChange;

    this.highlightOcean();
  }

  public onCountryClick = (x: number, y: number): void => {
    this.cleanupContext();

    const { mouseX, mouseY } = this.getMouseCoordinates(x, y);
    const pickedColorIndex = this.getPickColor(mouseX, mouseY) || this.previousColorIndex;

    if (pickedColorIndex) {
      // save color index for the click on ocean
      this.previousColorIndex = pickedColorIndex;

      const countryCode = findKey(
        countryColorMap,
        (countryColorIndex): boolean => countryColorIndex === pickedColorIndex
      );

      if (countryCode) {
        this.highlightCountry(countryCode);
        if (this.marker) {
          removeMarker(this.marker);
        }
        this.marker = getMarker(countryCode);
        this.onCountryChange(countryCode);
      }
    }

    this.highlightOcean();
  };

  private getMouseCoordinates(x: number, y: number): { mouseX: number; mouseY: number } {
    let canvas = this.renderer.context.canvas;

    let mouseX = x - canvas.offsetLeft;
    let mouseY = -y + canvas.height + canvas.offsetTop;

    return { mouseX, mouseY };
  }

  private getPickColor(mouseX: number, mouseY: number): number {
    this.mapUniforms['outlineLevel'].value = 0;

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    let gl = this.renderer.context;

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
