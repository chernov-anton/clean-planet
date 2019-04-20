import * as THREE from 'three';

interface MapLoadOptions {
  mapImage: HTMLImageElement;
  resultContext: CanvasRenderingContext2D;
  material: THREE.MeshPhongMaterial;
}

interface TransLoadOptions extends MapLoadOptions {
  transImage: HTMLImageElement;
  mapCanvas: HTMLCanvasElement;
  mapData: ImageData;
  mapContext: CanvasRenderingContext2D;
}

interface RenderOptions {
  renderer: THREE.Renderer;
  globe: THREE.Mesh;
  clouds: THREE.Mesh;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  container: HTMLElement;
}

type RenderFunc = (delta: number, now: number) => void;

class Globe {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private globe: THREE.Mesh;
  private clouds: THREE.Mesh;

  public constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = this.initRenderer(container);
    this.scene = this.initScene();
    this.camera = this.initCamera(container);

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
  }

  private initRenderer(container: HTMLElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  }

  private initScene(): THREE.Scene {
    return new THREE.Scene();
  }

  private initCamera(container: HTMLElement): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      1000
    );
    camera.position.z = 1.5;

    return camera;
  }

  private initAmbientLight(): THREE.Light {
    return new THREE.AmbientLight(0x888888);
  }

  private initDirectionalLight(): THREE.Light {
    const directionalLight = new THREE.DirectionalLight(0xcccccc, 0.5);
    directionalLight.position.set(5, 3, 5);
    return directionalLight;
  }

  private createGlobe(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshPhongMaterial();
    const globe = new THREE.Mesh(geometry, material);
    const loader = new THREE.TextureLoader();
    material.map = loader.load('img/earth_texture.jpg');
    material.bumpMap = loader.load('img/earthbump1k.jpg');
    material.bumpScale = 0.05;
    material.specularMap = loader.load('img/earthspec1k.jpg');
    material.specular = new THREE.Color('grey');
    this.scene.add(globe);

    return globe;
  }

  private createClouds(): THREE.Mesh {
    // create destination canvas
    const canvasResult = document.createElement('canvas');
    canvasResult.width = 1024;
    canvasResult.height = 512;
    const resultContext = canvasResult.getContext('2d');
    if (!resultContext) {
      throw new Error('Context is missed!');
    }

    const material = new THREE.MeshPhongMaterial({
      map: new THREE.Texture(canvasResult),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const geometry = new THREE.SphereGeometry(0.51, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);

    // load earthcloudmap
    const mapImage = new Image();
    mapImage.addEventListener('load', this.onMapLoad({ mapImage, resultContext, material }), false);
    mapImage.src = 'img/earthcloudmap.jpg';

    return mesh;
  }

  private onMapLoad({ mapImage, resultContext, material }: MapLoadOptions): () => void {
    return (): void => {
      // create dataMap ImageData for earthcloudmap
      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = mapImage.width;
      mapCanvas.height = mapImage.height;
      const mapContext = mapCanvas.getContext('2d');
      if (!mapContext) {
        throw new Error('Context is missed!');
      }
      mapContext.drawImage(mapImage, 0, 0);
      const mapData = mapContext.getImageData(0, 0, mapCanvas.width, mapCanvas.height);

      // load earthcloudmaptrans
      const transImage = new Image();
      transImage.addEventListener(
        'load',
        this.onTransLoad({
          transImage,
          mapData,
          mapContext,
          mapImage,
          mapCanvas,
          resultContext,
          material,
        })
      );
      transImage.src = 'img/earthcloudmaptrans.jpg';
    };
  }

  private onTransLoad({
    transImage,
    mapData,
    mapContext,
    mapImage,
    mapCanvas,
    resultContext,
    material,
  }: TransLoadOptions): () => void {
    return function(): void {
      // create dataTrans ImageData for earthcloudmaptrans
      const transCanvas = document.createElement('canvas');
      transCanvas.width = transImage.width;
      transCanvas.height = transImage.height;
      const transContext = transCanvas.getContext('2d');
      if (!transContext) {
        throw new Error('Context is missed!');
      }

      transContext.drawImage(transImage, 0, 0);
      const dataTrans = transContext.getImageData(0, 0, transCanvas.width, transCanvas.height);
      // merge dataMap + dataTrans into dataResult
      const dataResult = mapContext.createImageData(mapCanvas.width, mapCanvas.height);
      for (let y = 0, offset = 0; y < mapImage.height; y++) {
        for (let x = 0; x < mapImage.width; x++, offset += 4) {
          dataResult.data[offset + 0] = mapData.data[offset + 0];
          dataResult.data[offset + 1] = mapData.data[offset + 1];
          dataResult.data[offset + 2] = mapData.data[offset + 2];
          dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0];
        }
      }
      // update texture with result
      resultContext.putImageData(dataResult, 0, 0);
      if (material.map) {
        material.map.needsUpdate = true;
      }
    };
  }

  private initStarField(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(90, 32, 32);
    const material = new THREE.MeshBasicMaterial();
    const loader = new THREE.TextureLoader();
    material.map = loader.load('img/galaxy_starfield.png');
    material.side = THREE.BackSide;
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  public render(): void {
    const { renderer, globe, scene, camera, clouds, container } = this;
    const renderFuncs: RenderFunc[] = [];

    renderFuncs.push(
      (delta: number): void => {
        globe.rotateY((1 / 32) * delta);
      }
    );

    renderFuncs.push(
      (delta: number): void => {
        clouds.rotateY((1 / 16) * delta);
      }
    );

    const mouse = { x: 0, y: 0 };
    window.addEventListener(
      'mousemove',
      function(event): void {
        mouse.x = event.clientX / window.innerWidth - 0.5;
        mouse.y = event.clientY / window.innerHeight - 0.5;
      },
      false
    );

    window.addEventListener('resize', function onWindowResize(): void {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    renderFuncs.push(
      (delta: number): void => {
        camera.position.x += mouse.x * 2 - camera.position.x;
        camera.position.y += mouse.y * 2 - camera.position.y;
        camera.lookAt(scene.position);
      }
    );

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
