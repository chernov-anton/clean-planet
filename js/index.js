(function(window) {
  var { camera, scene, renderer } = init();
  var globe = renderGlobe(scene);
  setUpCamera(scene);
  // Schedule the first frame:
  requestAnimationFrame(update);
  addKeyboardListener();
  addMouseListener();

  function init() {
    var camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    camera.position.set(0, 0, 500);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000);
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    window.document.body.appendChild(renderer.domElement);

    return { camera, scene, renderer };
  }

  function renderGlobe(scene) {
    const RADIUS = 200;
    const SEGMENTS = 50;
    const RINGS = 50;

    const globe = new THREE.Group();
    scene.add(globe);

    var loader = new THREE.TextureLoader();

    loader.load("img/land_ocean_ice_cloud_2048.jpg", function(texture) {
      // Create the sphere
      var sphere = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);

      // Map the texture to the material.
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        overdraw: 0.5
      });

      // Create a new mesh with sphere geometry.
      var mesh = new THREE.Mesh(sphere, material);

      // Add mesh to globe
      globe.add(mesh);

      globe.position.z = -300;
    });

    // TODO shpuld wait for callback
    return globe;
  }

  function setUpCamera(scene) {
    const pointLight = new THREE.PointLight(0xffffff);

    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 400;

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
