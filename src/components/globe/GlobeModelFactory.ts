import * as THREE from 'three';

/* eslint import/no-webpack-loader-syntax: off */
import fragmentShader from '!raw-loader!glslify-loader!./shaders/fragment.glsl';
/* eslint import/no-webpack-loader-syntax: off */
import vertexShader from '!raw-loader!glslify-loader!./shaders/vertex.glsl';
import { Uniforms } from './types';
import GlobeModel from './GlobeModel';

const INDEXED_MAP_IMAGE = 'img/map_indexed.png';
const OUTLINED_MAP_IMAGE = 'img/map_outline.png';

class GlobeModelFactory {
  public static init(container: HTMLElement): GlobeModel {
    const renderer = GlobeModelFactory.getRenderer(container);
    const scene = GlobeModelFactory.getScene();
    const camera = GlobeModelFactory.getCamera();
    const center = GlobeModelFactory.getCenter();
    camera.lookAt(center);

    const ambientLight = GlobeModelFactory.getAmbientLight();
    scene.add(ambientLight);

    const lookupCanvas = GlobeModelFactory.getLookupCanvas();
    const lookupContext = GlobeModelFactory.getLookupContext(lookupCanvas);
    const lookupTexture = GlobeModelFactory.getLookupTexture(lookupCanvas);
    const mapUniforms = GlobeModelFactory.getMapUniforms(lookupTexture);

    const globeMesh = GlobeModelFactory.createGlobeMesh(mapUniforms);
    scene.add(globeMesh);

    return new GlobeModel({
      container,
      renderer,
      scene,
      camera,
      center,
      lookupContext,
      lookupTexture,
      mapUniforms,
      globeMesh,
    });
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

  private static createGlobeMesh(uniforms: Uniforms): THREE.Mesh {
    const planetMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    return new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32).rotateX(THREE.Math.degToRad(90)),
      planetMaterial
    );
  }
}

export default GlobeModelFactory;
