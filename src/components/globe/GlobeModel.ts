import * as THREE from 'three';

import { Uniforms } from './types';

interface GlobeOpts {
  container: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  lookupContext: CanvasRenderingContext2D;
  lookupTexture: THREE.Texture;
  camera: THREE.PerspectiveCamera;
  center: THREE.Vector3;
  globeMesh: THREE.Mesh;
  mapUniforms: Uniforms;
}

class GlobeModel {
  public container: HTMLElement;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly lookupContext: CanvasRenderingContext2D;
  public readonly lookupTexture: THREE.Texture;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly center: THREE.Vector3;
  public readonly globeMesh: THREE.Mesh;
  public readonly mapUniforms: Uniforms;

  public constructor({
    container,
    renderer,
    scene,
    camera,
    center,
    lookupContext,
    lookupTexture,
    mapUniforms,
    globeMesh,
  }: GlobeOpts) {
    this.container = container;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.center = center;
    this.lookupContext = lookupContext;
    this.lookupTexture = lookupTexture;
    this.mapUniforms = mapUniforms;
    this.globeMesh = globeMesh;
  }
}

export default GlobeModel;
