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
  camera: THREE.Camera;
}

type RenderFunc = (delta: number, now: number) => void;

function init(): void {
  // TODO move init logic to separate file
  const renderer = initRenderer();
  const scene = initScene();
  const camera = initCamera();
  addLight(scene);
  const globe = createGlobe(scene);
  const clouds = createClouds(scene);
  addStarField(scene);
  render({ renderer, globe, clouds, scene, camera });
}

function initRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  return renderer;
}

function initScene(): THREE.Scene {
  return new THREE.Scene();
}

function initCamera(): THREE.Camera {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.z = 1.5;

  return camera;
}

function addLight(scene: THREE.Scene): void {
  const ambientLight = new THREE.AmbientLight(0x888888);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xcccccc, 0.5);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);
}

function createGlobe(scene: THREE.Scene): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshPhongMaterial();
  const globe = new THREE.Mesh(geometry, material);
  const loader = new THREE.TextureLoader();
  material.map = loader.load('img/earthmap1k.jpg');
  material.bumpMap = loader.load('img/earthbump1k.jpg');
  material.bumpScale = 0.05;
  material.specularMap = loader.load('img/earthspec1k.jpg');
  material.specular = new THREE.Color('grey');
  scene.add(globe);

  return globe;
}

function createClouds(scene: THREE.Scene): THREE.Mesh {
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
  scene.add(mesh);

  // load earthcloudmap
  const mapImage = new Image();
  mapImage.addEventListener('load', onMapLoad({ mapImage, resultContext, material }), false);
  mapImage.src = 'img/earthcloudmap.jpg';

  return mesh;
}

function onMapLoad({ mapImage, resultContext, material }: MapLoadOptions): () => void {
  return function(): void {
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
      onTransLoad({ transImage, mapData, mapContext, mapImage, mapCanvas, resultContext, material })
    );
    transImage.src = 'img/earthcloudmaptrans.jpg';
  };
}

function onTransLoad({
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

function addStarField(scene: THREE.Scene): void {
  const geometry = new THREE.SphereGeometry(90, 32, 32);
  const material = new THREE.MeshBasicMaterial();
  const loader = new THREE.TextureLoader();
  material.map = loader.load('img/galaxy_starfield.png');
  material.side = THREE.BackSide;
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function render({ renderer, globe, scene, camera, clouds }: RenderOptions): void {
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
  document.addEventListener(
    'mousemove',
    function(event): void {
      mouse.x = event.clientX / window.innerWidth - 0.5;
      mouse.y = event.clientY / window.innerHeight - 0.5;
    },
    false
  );
  renderFuncs.push(
    (delta: number): void => {
      camera.position.x += (mouse.x * 5 - camera.position.x) * (delta * 3);
      camera.position.y += (mouse.y * 5 - camera.position.y) * (delta * 3);
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
    // call each update function
    renderFuncs.forEach(
      (renderFunc: RenderFunc): void => {
        renderFunc(deltaMsec / 1000, nowMsec / 1000);
      }
    );

    // keep looping
    requestAnimationFrame(animate);
  });
}

export default init;
