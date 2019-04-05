(function(window) {
  var { camera, scene, renderer } = init();
  var { globe, onRenderFcts} = renderGlobe(scene);
  setUpCamera(scene);
  // Schedule the first frame:
  requestAnimationFrame(update);
  // addKeyboardListener();
  addMouseListener();

  function init() {
    var camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    camera.position.set(0, 0, 2);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000);
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    window.document.body.appendChild(renderer.domElement);

    return { camera, scene, renderer };
  }

  function renderGlobe(scene) {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshPhongMaterial();
    var globe = new THREE.Mesh(geometry, material);
    material.map = THREE.ImageUtils.loadTexture("img/earthmap1k.jpg");
    material.bumpMap = THREE.ImageUtils.loadTexture("img/earthbump1k.jpg");
    material.bumpScale = 0.05;
    material.specularMap = THREE.ImageUtils.loadTexture("img/earthspec1k.jpg");
    material.specular = new THREE.Color("grey");

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
      opacity: 0.8,
      transparent: true,
      depthWrite: false
    });
    var cloudMesh = new THREE.Mesh(geometry, material);
    globe.add(cloudMesh);

    scene.add(globe);

    var onRenderFcts = []

    onRenderFcts.push(function(delta, now) {
      globe.rotation.y += (1 / 32) * delta;
    });

    onRenderFcts.push(function(delta, now) {
      cloudMesh.rotation.y += (1 / 16) * delta;
    });
    return {globe, onRenderFcts};
  }

  function setUpCamera(scene) {
    const pointLight = new THREE.PointLight(0xffffff);

    pointLight.position.x = 10;
    pointLight.position.y = 10;
    pointLight.position.z = 10;

    scene.add(pointLight);
  }

  function update() {
    //Render:
    renderer.render(scene, camera);

    // Schedule the next frame:
    requestAnimationFrame(update);
  }

  function animationBuilder(direction) {
    return function animateRotate() {
      switch (direction) {
        case "up":
          globe.rotation.x -= 0.2;
          break;
        case "down":
          globe.rotation.x += 0.2;
          break;
        case "left":
          globe.rotation.y -= 0.2;
          break;
        case "right":
          globe.rotation.y += 0.2;
          break;
        default:
          break;
      }
    };
  }

  var animateDirection = {
    up: animationBuilder("up"),
    down: animationBuilder("down"),
    left: animationBuilder("left"),
    right: animationBuilder("right")
  };

  function checkKey(e) {
    e = e || window.event;
    e.preventDefault();

    //based on keycode, trigger appropriate animation:
    if (e.keyCode == "38") {
      animateDirection.up();
    } else if (e.keyCode == "40") {
      animateDirection.down();
    } else if (e.keyCode == "37") {
      animateDirection.left();
    } else if (e.keyCode == "39") {
      animateDirection.right();
    }
  }

  function addKeyboardListener() {
    window.document.addEventListener("keydown", checkKey);
  }

  function addMouseListener() {
    var lastMove = [window.innerWidth / 2, window.innerHeight / 2];

    function rotateOnMouseMove(e) {
      e = e || window.event;

      //calculate difference between current and last mouse position
      const moveX = e.clientX - lastMove[0];
      const moveY = e.clientY - lastMove[1];
      //rotate the globe based on distance of mouse moves (x and y)
      globe.rotation.y += moveX * 0.005;
      globe.rotation.x += moveY * 0.005;

      //store new position in lastMove
      lastMove[0] = e.clientX;
      lastMove[1] = e.clientY;
    }

    document.addEventListener("mousemove", rotateOnMouseMove);
  }
})(window);

