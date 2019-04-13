(function(window) {
  // TODO fix texture has been resized problem
  // TODO move init logic to separate file
  const renderer = initRenderer();
  const scene = initScene();
  const camera = initCamera();
  addLight(scene);
  const globe = createGlobe(scene);
  const clouds = createClouds(scene);
  addStarField(scene);
  render({ renderer, globe, clouds, scene, camera });

  function initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return renderer;
  }

  function initScene() {
    return new THREE.Scene();
  }

  function initCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.z = 1.5;

    return camera;
  }

  function addLight(scene) {
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xcccccc, 0.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
  }

  function createGlobe(scene) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshPhongMaterial();
    const globe = new THREE.Mesh(geometry, material);
    const loader = new THREE.TextureLoader()
    material.map = loader.load("img/earthmap1k.jpg");
    material.bumpMap = loader.load("img/earthbump1k.jpg");
    material.bumpScale = 0.05;
    material.specularMap = loader.load("img/earthspec1k.jpg");
    material.specular = new THREE.Color("grey");
    scene.add(globe);

    return globe;
  }

  function createClouds(scene) {
    // create destination canvas
    var canvasResult = document.createElement("canvas");
    canvasResult.width = 1024;
    canvasResult.height = 512;
    var contextResult = canvasResult.getContext("2d");

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener(
      "load",
      function() {
        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement("canvas");
        canvasMap.width = imageMap.width;
        canvasMap.height = imageMap.height;
        var contextMap = canvasMap.getContext("2d");
        contextMap.drawImage(imageMap, 0, 0);
        var dataMap = contextMap.getImageData(
          0,
          0,
          canvasMap.width,
          canvasMap.height
        );

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function() {
          // create dataTrans ImageData for earthcloudmaptrans
          var canvasTrans = document.createElement("canvas");
          canvasTrans.width = imageTrans.width;
          canvasTrans.height = imageTrans.height;
          var contextTrans = canvasTrans.getContext("2d");
          contextTrans.drawImage(imageTrans, 0, 0);
          var dataTrans = contextTrans.getImageData(
            0,
            0,
            canvasTrans.width,
            canvasTrans.height
          );
          // merge dataMap + dataTrans into dataResult
          var dataResult = contextMap.createImageData(
            canvasMap.width,
            canvasMap.height
          );
          for (var y = 0, offset = 0; y < imageMap.height; y++) {
            for (var x = 0; x < imageMap.width; x++, offset += 4) {
              dataResult.data[offset + 0] = dataMap.data[offset + 0];
              dataResult.data[offset + 1] = dataMap.data[offset + 1];
              dataResult.data[offset + 2] = dataMap.data[offset + 2];
              dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0];
            }
          }
          // update texture with result
          contextResult.putImageData(dataResult, 0, 0);
          material.map.needsUpdate = true;
        });
        imageTrans.src = "img/earthcloudmaptrans.jpg";
      },
      false
    );
    imageMap.src = "img/earthcloudmap.jpg";

    var geometry = new THREE.SphereGeometry(0.51, 32, 32);
    var material = new THREE.MeshPhongMaterial({
      map: new THREE.Texture(canvasResult),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
  }

  function addStarField(scene) {
    var geometry = new THREE.SphereGeometry(90, 32, 32);
    var material = new THREE.MeshBasicMaterial();
    const loader = new THREE.TextureLoader()
    material.map = loader.load("img/galaxy_starfield.png");
    material.side = THREE.BackSide;
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }

  function render({ renderer, globe, scene, camera, clouds }) {
    const onRenderFcts = [];
    
    onRenderFcts.push(function(delta, now) {
      globe.rotateY((1 / 32) * delta);
    });

    onRenderFcts.push(function(delta, now) {
      clouds.rotateY((1 / 16) * delta);
    });

    const mouse = { x: 0, y: 0 };
    document.addEventListener(
      "mousemove",
      function(event) {
        mouse.x = event.clientX / window.innerWidth - 0.5;
        mouse.y = event.clientY / window.innerHeight - 0.5;
      },
      false
    );
    onRenderFcts.push(function(delta, now) {
      camera.position.x += (mouse.x * 5 - camera.position.x) * (delta * 3);
      camera.position.y += (mouse.y * 5 - camera.position.y) * (delta * 3);
      camera.lookAt(scene.position);
    });

    onRenderFcts.push(function() {
      renderer.render(scene, camera);
    });

    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
      // keep looping
      requestAnimationFrame(animate);
      // measure time
      lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
      var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
      lastTimeMsec = nowMsec;
      // call each update function
      onRenderFcts.forEach(function(onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000);
      });
    });
  }
})(window);
