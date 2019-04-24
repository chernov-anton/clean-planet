import * as THREE from 'three';
import Controls from './Controls';

type RenderFunc = (delta: number, now: number) => void;

const EARTH_IMAGE = 'img/2_no_clouds_4k.jpg';
const EARTH_BUMP = 'img/elev_bump_4k.jpg';
const EARTH_SPEC = 'img/water_4k.png';
const CLOUD_IMAGE = 'img/fair_clouds_4k.png';
const STAR_IMAGE = 'img/galaxy_starfield.png';

const MAX_ZOOM = 0.7;
const MIN_ZOOM = 5;

class Globe {
  private container: HTMLElement;
  private controls: Controls;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private center: THREE.Vector3;
  private globe: THREE.Mesh;
  private clouds: THREE.Mesh;

  public constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = this.initRenderer(container);
    this.scene = this.initScene();
    this.camera = this.initCamera();
    this.center = this.initCenter();
    this.camera.lookAt(this.center);

    const ambientLight = this.initAmbientLight();
    this.scene.add(ambientLight);

    const directionalLight = this.initDirectionalLight();
    this.scene.add(directionalLight);

    this.globe = this.createGlobe();
    this.scene.add(this.globe);

    this.clouds = this.createClouds();
    this.scene.add(this.clouds);

    const stars = this.initStarField();
    this.scene.add(stars);

    this.controls = new Controls(
      container,
      this.drag.bind(this),
      this.zoomIn.bind(this),
      this.zoomOut.bind(this)
    );
  }

  private initRenderer(container: HTMLElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  }

  private initScene(): THREE.Scene {
    return new THREE.Scene();
  }

  private initCamera(): THREE.PerspectiveCamera {
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

  private initCenter(): THREE.Vector3 {
    return new THREE.Vector3();
  }

  private initAmbientLight(): THREE.Light {
    return new THREE.AmbientLight(0x333333);
  }

  private initDirectionalLight(): THREE.Light {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    return directionalLight;
  }

  private createGlobe(): THREE.Mesh {
    const loader = new THREE.TextureLoader();
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32).rotateX(THREE.Math.degToRad(90)),
      new THREE.MeshPhongMaterial({
        map: loader.load(EARTH_IMAGE),
        bumpMap: loader.load(EARTH_BUMP),
        bumpScale: 0.01,
        specularMap: loader.load(EARTH_SPEC),
        specular: new THREE.Color('grey'),
      })
    );
  }

  private createClouds(): THREE.Mesh {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.5 + 0.003, 32, 32).rotateX(THREE.Math.degToRad(90)),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(CLOUD_IMAGE),
        transparent: true,
      })
    );
  }

  private initStarField(): THREE.Mesh {
    return new THREE.Mesh(
      new THREE.SphereGeometry(90, 64, 64).rotateX(THREE.Math.degToRad(90)),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(STAR_IMAGE),
        side: THREE.BackSide,
      })
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
        .multiplyScalar(0.9)
        .add(this.center);
    }
  }

  private zoomOut(): void {
    if (this.camera.position.length() < MIN_ZOOM) {
      this.camera.position
        .sub(this.center)
        .multiplyScalar(1.1)
        .add(this.center);
    }
  }

  public render(): void {
    const { renderer, globe, scene, camera, clouds, container } = this;
    const renderFuncs: RenderFunc[] = [];

    renderFuncs.push(
      (delta: number): void => {
        globe.rotateZ((1 / 32) * delta);
      }
    );

    renderFuncs.push(
      (delta: number): void => {
        clouds.rotateZ((1 / 24) * delta);
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
