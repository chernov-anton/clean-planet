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
  private scene: THREE.Scene;
  private mapUniforms: Uniforms;

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
  }

  public onCountryClick = (e: MouseEvent): void => {
    console.log(e);
    e.preventDefault();
    //	make the rest not work if the event was actually a drag style click
    //if (Math.abs(this.pressX - this.mouseX) > 3 || Math.abs(this.pressY - this.mouseY) > 3) return;

    let pickColorIndex = this.getPickColor(e);
    console.log(pickColorIndex);
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

        this.selectVisualization([countryName]);
        // console.log('selecting ' + countryName + ' from click');
        return;
      }
    }
  };

  private selectVisualization(countries: string[]): void {
    let cName = countries[0].toUpperCase();

    //	build the mesh
    console.time('getVisualizedMesh');
    const affectedCountries: string[] = [];
    console.timeEnd('getVisualizedMesh');

    affectedCountries.push(cName);

    console.log(affectedCountries);

    this.highlightCountry(affectedCountries);
  }

  private getPickColor(e: MouseEvent): number {
    this.highlightCountry([]);
    this.mapUniforms['outlineLevel'].value = 0;

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    let gl = this.renderer.context;
    console.log(gl);

    let mouseX = e.clientX - window.innerWidth * 0.5;
    let mouseY = e.clientY - window.innerHeight * 0.5;
    let mx = mouseX + this.renderer.context.canvas.width / 2;
    let my = -mouseY + this.renderer.context.canvas.height / 2;
    mx = Math.floor(mx);
    my = Math.floor(my);

    let buf = new Uint8Array(4);
    gl.readPixels(mx, my, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    this.mapUniforms['outlineLevel'].value = 1;

    return buf[0];
  }

  private highlightCountry(countries: string[]) {
    let countryCodes = [];
    for (let i in countries) {
      let code = CountrySelect.findCode(countries[i]);
      countryCodes.push(code);
    }

    let ctx = this.lookupContext;
    ctx.clearRect(0, 0, 256, 1);

    //	color index 0 is the ocean, leave it something neutral

    //	this fixes a bug where the fill for ocean was being applied during pick
    //	all non-countries were being pointed to 10 - bolivia
    //	the fact that it didn't select was because bolivia shows up as an invalid country due to country name mismatch
    //	...
    let pickMask = countries.length === 0 ? 0 : 1;
    let oceanFill = 10 * pickMask;
    ctx.fillStyle = 'rgb(' + oceanFill + ',' + oceanFill + ',' + oceanFill + ')';
    ctx.fillRect(0, 0, 1, 1);

    for (const i in countryCodes) {
      let countryCode = countryCodes[i];
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
