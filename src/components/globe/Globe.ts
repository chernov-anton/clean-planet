import * as THREE from 'three';
import Controls from './controls';
import CountrySelect from './country-select';

/* eslint import/no-webpack-loader-syntax: off */
import fragmentShader from '!raw-loader!glslify-loader!./shaders/fragment.glsl';
/* eslint import/no-webpack-loader-syntax: off */
import vertexShader from '!raw-loader!glslify-loader!./shaders/vertex.glsl';
import { Uniforms } from './types';

type RenderFunc = (delta: number, now: number) => void;

const INDEXED_MAP_IMAGE = 'img/map_indexed.png';
const OUTLINED_MAP_IMAGE = 'img/map_outline.png';

const MAX_ZOOM = 1;
const MIN_ZOOM = 4;

class Globe {
  private container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly lookupContext: CanvasRenderingContext2D;
  private readonly lookupTexture: THREE.Texture;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly center: THREE.Vector3;
  private readonly globe: THREE.Mesh;
  private readonly mapUniforms: Uniforms;

  public constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = Globe.getRenderer(container);
    this.scene = Globe.getScene();
    this.camera = Globe.getCamera();
    this.center = Globe.getCenter();
    this.camera.lookAt(this.center);

    const ambientLight = Globe.getAmbientLight();
    this.scene.add(ambientLight);

    const lookupCanvas = Globe.getLookupCanvas();
    this.lookupContext = Globe.getLookupContext(lookupCanvas);
    this.lookupTexture = Globe.getLookupTexture(lookupCanvas);
    this.mapUniforms = Globe.getMapUniforms(this.lookupTexture);

    this.globe = Globe.createGlobe(this.mapUniforms);
    this.scene.add(this.globe);

    const select = new CountrySelect({
      scene: this.scene,
      lookupContext: this.lookupContext,
      lookupTexture: this.lookupTexture,
      mapUniforms: this.mapUniforms,
      renderer: this.renderer,
      camera: this.camera,
    });

    new Controls(
      container,
      this.drag.bind(this),
      select.onCountryClick,
      this.zoomIn.bind(this),
      this.zoomOut.bind(this)
    );
  }

  private static getRenderer(container: HTMLElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  }

  private static getScene(): THREE.Scene {
    return new THREE.Scene();
  }

  private static getCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      300
    );

    camera.up = new THREE.Vector3(0, 0, 1);
    camera.position.x = 2;

    return camera;
  }

  private static getCenter(): THREE.Vector3 {
    return new THREE.Vector3();
  }

  private static getAmbientLight(): THREE.Light {
    return new THREE.AmbientLight(0xffffff);
  }

  private static getLookupCanvas(): HTMLCanvasElement {
    const lookupCanvas = document.createElement('canvas');
    lookupCanvas.width = 256;
    lookupCanvas.height = 1;
    return lookupCanvas;
  }

  private static getLookupContext(lookupCanvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const lookupContext = lookupCanvas.getContext('2d');
    if (!lookupContext) {
      throw new Error('Lookup context is empty!');
    }
    return lookupContext;
  }

  private static getLookupTexture(lookupCanvas: HTMLCanvasElement): THREE.Texture {
    const lookupTexture = new THREE.Texture(lookupCanvas);
    lookupTexture.magFilter = THREE.NearestFilter;
    lookupTexture.minFilter = THREE.NearestFilter;
    return lookupTexture;
  }

  private static getMapUniforms(lookupTexture: THREE.Texture): Uniforms {
    const loader = new THREE.TextureLoader();

    const mapTexture = loader.load(INDEXED_MAP_IMAGE);
    mapTexture.magFilter = THREE.NearestFilter;
    mapTexture.minFilter = THREE.NearestFilter;

    const outlineTexture = loader.load(OUTLINED_MAP_IMAGE);

    return {
      mapIndex: { type: 't', value: mapTexture },
      outline: { type: 't', value: outlineTexture },
      lookup: { type: 't', value: lookupTexture },
      outlineLevel: { type: 'f', value: 1 },
    };
  }

  private static createGlobe(uniforms: Uniforms): THREE.Mesh {
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    return new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32).rotateX(THREE.Math.degToRad(90)),
      planeMaterial
    );
  }

  private drag(deltaX: number, deltaY: number): void {
    let radPerPixel = Math.PI / 450,
      deltaPhi = radPerPixel * deltaX,
      deltaTheta = radPerPixel * deltaY,
      pos = this.camera.position.sub(this.center),
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

    this.camera.position.add(this.center);
    this.camera.lookAt(this.center);
  }

  private zoomIn(): void {
    if (this.camera.position.length() > MAX_ZOOM) {
      this.camera.position
        .sub(this.center)
        .multiplyScalar(0.95)
        .add(this.center);
    }
  }

  private zoomOut(): void {
    if (this.camera.position.length() < MIN_ZOOM) {
      this.camera.position
        .sub(this.center)
        .multiplyScalar(1.05)
        .add(this.center);
    }
  }

  public render(): void {
    const { renderer, globe, scene, camera, container } = this;
    const renderFuncs: RenderFunc[] = [];

    renderFuncs.push(
      (delta: number): void => {
        globe.rotateZ((1 / 32) * delta);
      }
    );

    window.addEventListener('resize', function onWindowResize(): void {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    renderFuncs.push(
      (): void => {
        renderer.render(scene, camera);
      }
    );

    let lastTimeMsec: number | null = null;
    requestAnimationFrame(function animate(nowMsec): void {
      // measure time
      lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
      const deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
      lastTimeMsec = nowMsec;
      // call each update
      renderFuncs.forEach(
        (renderFunc: RenderFunc): void => {
          renderFunc(deltaMsec / 1000, nowMsec / 1000);
        }
      );

      // keep looping
      requestAnimationFrame(animate);
    });
  }
}

export default Globe;
