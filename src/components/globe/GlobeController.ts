import Controls from '../controls';
import CountrySelect from './country-select';

import { CountryChangeCallback } from './types';
import GlobeModel from './GlobeModel';

type RenderFunc = (delta: number, now: number) => void;

const MAX_ZOOM = 1;
const MIN_ZOOM = 4;

class GlobeController {
  private readonly globeModel: GlobeModel;
  private readonly countrySelect: CountrySelect;
  private lastTimeMs: number | null;
  private renderFuncs: RenderFunc[];

  public constructor(globeModel: GlobeModel, onCountryChange: CountryChangeCallback) {
    this.globeModel = globeModel;
    this.lastTimeMs = null;
    this.renderFuncs = [];

    this.countrySelect = new CountrySelect({
      scene: this.globeModel.scene,
      lookupContext: this.globeModel.lookupContext,
      lookupTexture: this.globeModel.lookupTexture,
      mapUniforms: this.globeModel.mapUniforms,
      renderer: this.globeModel.renderer,
      camera: this.globeModel.camera,
      onCountryChange,
    });

    new Controls({
      domObject: this.globeModel.container,
      drag: this.drag,
      click: this.countrySelect.onCountryClick,
      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
    });

    window.addEventListener('resize', this.resize);

    this.renderFuncs.push(this.rotate);

    this.renderFuncs.push(this.render);
  }

  private resize = (): void => {
    const { renderer, camera, container } = this.globeModel;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  private drag = (deltaX: number, deltaY: number): void => {
    let radPerPixel = Math.PI / 450,
      deltaPhi = radPerPixel * deltaX,
      deltaTheta = radPerPixel * deltaY,
      pos = this.globeModel.camera.position.sub(this.globeModel.center),
      radius = pos.length(),
      theta = Math.acos(pos.z / radius),
      phi = Math.atan2(pos.y, pos.x);

    // Subtract deltaTheta and deltaPhi
    theta = Math.min(Math.max(theta - deltaTheta, 0), Math.PI);
    phi -= deltaPhi;

    // Turn back into Cartesian coordinates
    pos.x = radius * Math.sin(theta) * Math.cos(phi);
    pos.y = radius * Math.sin(theta) * Math.sin(phi);
    pos.z = radius * Math.cos(theta);

    this.globeModel.camera.position.add(this.globeModel.center);
    this.globeModel.camera.lookAt(this.globeModel.center);
  };

  private zoomIn = (): void => {
    if (this.globeModel.camera.position.length() > MAX_ZOOM) {
      this.globeModel.camera.position
        .sub(this.globeModel.center)
        .multiplyScalar(0.99)
        .add(this.globeModel.center);
    }
  };

  private zoomOut = (): void => {
    if (this.globeModel.camera.position.length() < MIN_ZOOM) {
      this.globeModel.camera.position
        .sub(this.globeModel.center)
        .multiplyScalar(1.01)
        .add(this.globeModel.center);
    }
  };

  private rotate = (delta: number): void => {
    this.globeModel.globeMesh.rotateZ((1 / 32) * delta);
  };

  public addRenderFunc(func: RenderFunc): void {
    this.renderFuncs.push(func);
  }

  private render = (): void => {
    const { renderer, scene, camera } = this.globeModel;
    renderer.render(scene, camera);
  };

  private animate = (nowMs: number): void => {
    // measure time
    this.lastTimeMs = this.lastTimeMs || nowMs - 1000 / 60;
    const deltaMs = Math.min(200, nowMs - this.lastTimeMs);
    this.lastTimeMs = nowMs;
    // call each update
    this.renderFuncs.forEach(
      (renderFunc: RenderFunc): void => {
        renderFunc(deltaMs / 1000, nowMs / 1000);
      }
    );

    // keep looping
    requestAnimationFrame(this.animate);
  };

  public show(): void {
    requestAnimationFrame(this.animate);
  }
}

export default GlobeController;
