import countryColorMap from './countryColorMap';
import countryLookup from './country_iso3166.json';
import * as THREE from 'three';
import { Uniforms } from './types';

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
    this.colorIndex = 1;

    this.highlightCountry('Australia');
  }

  public onCountryClick = (e: MouseEvent): void => {
    e.preventDefault();
    //	make the rest not work if the event was actually a drag style click
    //if (Math.abs(this.pressX - this.mouseX) > 3 || Math.abs(this.pressY - this.mouseY) > 3) return;
    this.highlightCountry();
    let pickColorIndex = this.getPickColor(e);
    console.log(pickColorIndex);

    if (pickColorIndex) {
      this.colorIndex = pickColorIndex;
    } else {
      pickColorIndex = this.colorIndex;
    }

    //	find it
    for (let i in countryColorMap) {
      let countryCode = i;
      let countryColorIndex = countryColorMap[i];
      if (pickColorIndex === countryColorIndex) {
        // console.log("selecting code " + countryCode);
        // @ts-ignore
        let countryName = countryLookup[countryCode];
        // console.log("converts to " + countryName);
        if (countryName === undefined) return;

        this.highlightCountry(countryName);
        // console.log('selecting ' + countryName + ' from click');
        return;
      }
    }
  };

  private getPickColor(e: MouseEvent): number {
    this.mapUniforms['outlineLevel'].value = 0;

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    let gl = this.renderer.context;
    let canvas = gl.canvas;

    let mouseX = e.clientX - canvas.offsetLeft;
    let mouseY = -e.clientY + canvas.height + canvas.offsetTop;

    let buf = new Uint8Array(4);
    gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    this.mapUniforms['outlineLevel'].value = 1;

    return buf[0];
  }

  private cleanupContext(): void {
    this.lookupContext.clearRect(0, 0, 256, 1);
  }

  private highlightCountry(country?: string): void {
    this.cleanupContext();

    if (country) {
      let countryCode = CountrySelect.findCode(country);

      let ctx = this.lookupContext;

      ctx.fillStyle = 'rgb(10,10,10)';
      ctx.fillRect(0, 0, 1, 1);

      let colorIndex = countryColorMap[countryCode];

      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(colorIndex, 0, 1, 1);
    }

    this.lookupTexture.needsUpdate = true;
  }

  private static findCode(countryName: string): string {
    countryName = countryName.toUpperCase();
    for (let i in countryLookup) {
      if (countryLookup[i as keyof typeof countryLookup] === countryName) {
        return i;
      }
    }
    throw new Error('not found');
  }
}

export default CountrySelect;
