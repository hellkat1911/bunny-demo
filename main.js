/* jshint esversion:6 */

if (!Detector.webgl) { Detector.addGetWebGLMessage(); }

// globals

let scene, camera, renderer;
let globalLight, shadowLight, backLight;
let container, button, controls, stats, delta, clock;
let bunny;
let gui = new dat.GUI();

// materials

let blackMat = new THREE.MeshPhongMaterial({
  color: 0x100707,
  flatShading: true
});

let brownMat = new THREE.MeshPhongMaterial({
  color: 0x85633a,
  shininess: 0,
  flatShading: true
});

let lightYellowMat = new THREE.MeshPhongMaterial({
  color: 0xe4c56b,
  flatShading: true
});

let whiteMat = new THREE.MeshPhongMaterial({
  color: 0xa49789,
  flatShading: true
});

// params

let parameters = {
  speed: 6,

  pawFRAmplitudeY: 4,
  pawFRAmplitudeZ: 8,
  pawFRCycleOffset: 0.2,
  pawFRAnkleRotationAmplitude: Math.PI / 2,

  pawFLAmplitudeY: 4,
  pawFLAmplitudeZ: 8,
  pawFLCycleOffset: -0.2,
  pawFLAnkleRotationAmplitude: Math.PI / 2,

  pawBRAmplitudeY: 4,
  pawBRAmplitudeZ: 5,
  pawBRCycleOffset: -0.1 + Math.PI,
  pawBRAnkleRotationAmplitude: Math.PI / 2,
  
  pawBLAmplitudeY: 4,
  pawBLAmplitudeZ: 5,
  pawBLCycleOffset: 0.1 - Math.PI,
  pawBLAnkleRotationAmplitude: Math.PI / 2,
  
  bodyYAmplitude: 4,
  bodyCycleOffset: -Math.PI / 2,
  bodyRotationAmplitude: Math.PI * 0.12,
  
  torsoYAmplitude: 2,
  torsoCycleOffset: -Math.PI / 2,
  torsoRotationAmplitude: Math.PI * 0.12,
  
  tailRotationAmplitude: Math.PI / 3,
  tailCycleOffset: Math.PI / 2,
  
  headYAmplitude: 3,
  headZAmplitude: 4,
  headCycleOffset: -Math.PI / 2,
  headRotationAmplitude: Math.PI / 8,
  
  mouthRotationAmplitude:0.6,
  mouthCycleOffset: Math.PI,
  
  earRightRotationAmplitude: 0.8,
  earRightCycleOffset: -Math.PI / 2 + 0.2,
  
  earLeftRotationAmplitude: 0.6,
  earLeftCycleOffset: -Math.PI / 2,
  
  eyeMinScale: 0.1,
  eyeMaxScale: 1,
  eyeCycleOffset: -Math.PI / 4
};

// init gui

function initGUI() {
  
  gui.width = 250;
  gui.add(parameters, 'speed').min(0).max(20).step(1).name('Cycle speed');
  
  var fr = gui.addFolder('Front Right Paw');
  fr.add(parameters, 'pawFRCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  fr.add(parameters, 'pawFRAmplitudeY').min(0).max(12).step(0.1).name('Leg Amp Y');
  fr.add(parameters, 'pawFRAmplitudeZ').min(0).max(12).step(0.1).name('Leg Amp Z');
  fr.add(parameters, 'pawFRAnkleRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Ankle Amp');
  
  var fl = gui.addFolder('Front Left Paw');
  fl.add(parameters, 'pawFLCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  fl.add(parameters, 'pawFLAmplitudeY').min(0).max(12).step(0.1).name('Leg Amp Y');
  fl.add(parameters, 'pawFLAmplitudeZ').min(0).max(12).step(0.1).name('Leg Amp Z');
  fl.add(parameters, 'pawFLAnkleRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Ankle Amp');
  
  var br = gui.addFolder('Back Right Paw');
  br.add(parameters, 'pawBRCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  br.add(parameters, 'pawBRAmplitudeY').min(0).max(12).step(0.1).name('Leg Amp Y');
  br.add(parameters, 'pawBRAmplitudeZ').min(0).max(12).step(0.1).name('Leg Amp Z');
  br.add(parameters, 'pawBRAnkleRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Ankle Amp');
  
  var bl = gui.addFolder('Back Left Paw');
  bl.add(parameters, 'pawBLCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  bl.add(parameters, 'pawBLAmplitudeY').min(0).max(12).step(0.1).name('Leg Amp Y');
  bl.add(parameters, 'pawBLAmplitudeZ').min(0).max(12).step(0.1).name('Leg Amp Z');
  bl.add(parameters, 'pawBLAnkleRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Ankle Amp');
  
  var bdy = gui.addFolder('Body');
  bdy.add(parameters, 'bodyCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  bdy.add(parameters, 'bodyYAmplitude').min(0).max(5).step(0.1).name('Y Amp');
  bdy.add(parameters, 'bodyRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var trso = gui.addFolder('Torso');
  trso.add(parameters, 'torsoCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  trso.add(parameters, 'torsoYAmplitude').min(0).max(5).step(0.1).name('Y Amp');
  trso.add(parameters, 'torsoRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var tail = gui.addFolder('Tail');
  tail.add(parameters, 'tailCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  tail.add(parameters, 'tailRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var mouth = gui.addFolder('Mouth');
  mouth.add(parameters, 'mouthCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  mouth.add(parameters, 'mouthRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var head = gui.addFolder('Head');
  head.add(parameters, 'headCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  head.add(parameters, 'headYAmplitude').min(0).max(5).step(0.1).name('Y Amp');
  head.add(parameters, 'headZAmplitude').min(0).max(5).step(0.1).name('Z Amp');
  head.add(parameters, 'headRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var earRight = gui.addFolder('Ear Right');
  earRight.add(parameters, 'earRightCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  earRight.add(parameters, 'earRightRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var earLeft = gui.addFolder('Ear Left');
  earLeft.add(parameters, 'earLeftCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  earLeft.add(parameters, 'earLeftRotationAmplitude').min(0).max(Math.PI).step(0.01).name('Rotation Amp');
  
  var eyes = gui.addFolder('Eyes');
  eyes.add(parameters, 'eyeCycleOffset').min(-Math.PI).max(Math.PI).step(0.1).name('Cycle Offset');
  eyes.add(parameters, 'eyeMinScale').min(0).max(1).step(0.01).name('Scale Min');
  eyes.add(parameters, 'eyeMaxScale').min(0).max(1).step(0.01).name('Scale Max');
  
  gui.remember(parameters);
}

function resetAnimation() {
  for(var i = 0; i < gui.__controllers.length; i++) {
    gui.__controllers[i].setValue(0);
  }
}

// init scene

function initScene() {
  container = document.getElementById('container');
  button = document.getElementById('button');

  scene = new THREE.Scene();
  window.scene = scene;
  scene.fog = new THREE.Fog(0xd6eae6, 150, 300);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 0, 100);

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  stats = new Stats();
  container.appendChild(stats.dom);

  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;

  clock = new THREE.Clock();

  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();

  button.addEventListener('click', function() {
    bunny.running = !bunny.running;
  }, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createLights() {
  globalLight = new THREE.AmbientLight(0xffffff, 1);

  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
  shadowLight.position.set(-8, 8, 8);
  shadowLight.castShadow = true;

  let d = 40;

  shadowLight.shadow.camera.left = -d;
  shadowLight.shadow.camera.right = d;
  shadowLight.shadow.camera.top = d;
  shadowLight.shadow.camera.bottom = -d;

  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;

  let helper = new THREE.DirectionalLightHelper(shadowLight, 10, 0x000000);

  scene.add(globalLight);
  scene.add(shadowLight);
  scene.add(helper);
}

let Bunny = function() {
  this.running = true;
  this.runningCycle = 0;

  this.mesh = new THREE.Group();
  this.body = new THREE.Group();
  this.mesh.add(this.body);

  let torsoGeo = new THREE.CubeGeometry(7, 7, 10, 1);
  this.torso = new THREE.Mesh(torsoGeo, brownMat);
  this.torso.position.y = 7;
  this.torso.position.z = 0;
  this.torso.rotation.x = -Math.PI / 8;
  this.torso.castShadow = true;
  this.body.add(this.torso);

  let pantsGeo = new THREE.CubeGeometry(9, 9, 5, 1);
  this.pants = new THREE.Mesh(pantsGeo, whiteMat);
  this.pants.position.y = 0;
  this.pants.position.z = -3;
  this.pants.castShadow = true;
  this.torso.add(this.pants);

  let tailGeom = new THREE.CubeGeometry(3, 3, 3, 1);
  tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -2));
  this.tail = new THREE.Mesh(tailGeom, lightYellowMat);
  this.tail.position.z = -4;
  this.tail.position.y = 5;
  this.tail.castShadow = true;
  this.torso.add(this.tail);
  
  let headGeom = new THREE.CubeGeometry(10, 10, 13, 1);
  headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 7.5));
  this.head = new THREE.Mesh(headGeom, brownMat);
  this.head.position.z = 2;
  this.head.position.y = 11;
  this.head.castShadow = true;
  this.body.add(this.head);
  
  let cheekGeom = new THREE.CubeGeometry(1, 4, 4, 1);
  this.cheekR = new THREE.Mesh(cheekGeom, lightYellowMat);
  this.cheekR.position.x = -5;
  this.cheekR.position.z = 7;
  this.cheekR.position.y = -2.5;
  this.cheekR.castShadow = true;
  this.head.add(this.cheekR);
  
  this.cheekL = this.cheekR.clone();
  this.cheekL.position.x = - this.cheekR.position.x;
  this.head.add(this.cheekL);
  
  let noseGeom = new THREE.CubeGeometry(6, 6, 3, 1);
  this.nose = new THREE.Mesh(noseGeom, lightYellowMat);
  this.nose.position.z = 13.5;
  this.nose.position.y = 2.6;
  this.nose.castShadow = true;
  this.head.add(this.nose);
  
  let mouthGeom = new THREE.CubeGeometry(4, 2, 4, 1);
  mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
  mouthGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 12));
  this.mouth = new THREE.Mesh(mouthGeom, brownMat);
  this.mouth.position.z = 8;
  this.mouth.position.y = -4;
  this.mouth.castShadow = true;
  this.head.add(this.mouth);
  
  let pawFGeom = new THREE.CubeGeometry(3, 4, 3, 1);
  this.pawFR = new THREE.Mesh(pawFGeom, lightYellowMat);
  this.pawFR.position.x = -2.5;
  this.pawFR.position.z = 6;
  this.pawFR.position.y = 1.5;
  this.pawFR.castShadow = true;
  this.body.add(this.pawFR);
  
  this.pawFL = this.pawFR.clone();
  this.pawFL.position.x = -this.pawFR.position.x;
  this.pawFL.castShadow = true;
  this.body.add(this.pawFL);
  
  let pawBGeom = new THREE.CubeGeometry(3, 3, 6, 1);
  this.pawBL = new THREE.Mesh(pawBGeom, lightYellowMat);
  this.pawBL.position.y = 1.5;
  this.pawBL.position.z = 0;
  this.pawBL.position.x = 5;
  this.pawBL.castShadow = true;
  this.body.add(this.pawBL);
  
  this.pawBR = this.pawBL.clone();
  this.pawBR.position.x = - this.pawBL.position.x;
  this.pawBR.castShadow = true;
  this.body.add(this.pawBR);
  
  let earGeom = new THREE.CubeGeometry(7, 18, 2, 1);
  earGeom.vertices[6].x += 2;
  earGeom.vertices[6].z += 0.5;
  
  earGeom.vertices[7].x += 2;
  earGeom.vertices[7].z -= 0.5;
  
  earGeom.vertices[2].x -= 2;
  earGeom.vertices[2].z -= 0.5;
  
  earGeom.vertices[3].x -= 2;
  earGeom.vertices[3].z += 0.5;
  earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 9, 0));
  
  this.earL = new THREE.Mesh(earGeom, brownMat);
  this.earL.position.x = 2;
  this.earL.position.z = 2.5;
  this.earL.position.y = 5;
  this.earL.rotation.z = -Math.PI / 12;
  this.earL.castShadow = true;
  this.head.add(this.earL);
  
  this.earR = this.earL.clone();
  this.earR.position.x = -this.earL.position.x;
  this.earR.rotation.z = -this.earL.rotation.z;
  this.earR.castShadow = true;
  this.head.add(this.earR);
  
  let eyeGeom = new THREE.CubeGeometry(2, 4, 4);
  
  this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
  this.eyeL.position.x = 5;
  this.eyeL.position.z = 5.5;
  this.eyeL.position.y = 2.9;
  this.eyeL.castShadow = true;
  this.head.add(this.eyeL);
  
  let irisGeom = new THREE.CubeGeometry(0.6, 2, 2);
  
  this.iris = new THREE.Mesh(irisGeom, blackMat);
  this.iris.position.x = 1.2;
  this.iris.position.y = 1;
  this.iris.position.z = 1;
  this.eyeL.add(this.iris);
  this.eyeR = this.eyeL.clone();
  this.eyeR.children[0].position.x = -this.iris.position.x;
  this.eyeR.position.x = -this.eyeL.position.x;
  this.head.add(this.eyeR);

  this.body.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
};

Bunny.prototype.run = function() {
  let p = parameters;
  let s = p.speed;
  this.runningCycle += delta * s;
  let t = this.runningCycle;

  // body animation

  // this.body.position.y = 6 + Math.sin(TIME_ELAPSED + -Math.PI / 2) * 4;

  /*
    Formula breakdown -->

    - INT + Math.sin(time) displaces Y values upward
    - Math.sin(TIME_ELAPSED) yields continuous normalized Y values
    - Math.sin(TIME_ELAPSED + -Math.PI / 2) ....>
          -Math.PI sets motion in a forward direction, / 2 halves
           the frequency of the wave
    - * INT at the end quadruples the amplitude

    Math.sin(x) = Math.cos(Math.PI / 2 - x)

    Sin lags behind Cos by a quarter of a period (Pi/2 or 90 deg)

  */


  this.body.position.y = 6 + Math.sin(t + p.bodyCycleOffset) * p.bodyYAmplitude;
  this.body.rotation.x = 0.2 + Math.sin(t + p.bodyCycleOffset) * p.bodyRotationAmplitude;

  // torso animation

  this.torso.position.y = 7 + Math.sin(t + p.torsoCycleOffset) * p.torsoYAmplitude;
  this.torso.rotation.x = Math.sin(t + p.torsoCycleOffset) * p.torsoRotationAmplitude;

  // mouth animation

  this.mouth.rotation.x = Math.PI / 16 + Math.cos(t) * p.mouthRotationAmplitude;

  // head animation

  this.head.position.y = 8 + Math.cos(t + p.headCycleOffset) * p.headYAmplitude;
  this.head.position.z = 2 + Math.sin(t + p.headCycleOffset) * p.headZAmplitude;
  this.head.rotation.x = -0.2 + Math.sin(t + p.headCycleOffset + Math.PI * 1.5) * p.headRotationAmplitude;

  // ears animation

  this.earL.rotation.x = Math.cos(t + p.earLeftCycleOffset) + p.earLeftRotationAmplitude;
  this.earR.rotation.x = Math.cos(t + p.earRightCycleOffset) * p.earRightRotationAmplitude;

  // eyes animation

  this.eyeR.scale.y = this.eyeL.scale.y = p.eyeMinScale + Math.abs(Math.cos(t * 0.5 + p.eyeCycleOffset)) * (p.eyeMaxScale - p.eyeMinScale);

  // paws animation

  this.pawFR.position.y = 1.5 + Math.sin(t + p.pawFRCycleOffset) * p.pawFRAmplitudeY;
  this.pawFR.position.z = 6 - Math.cos(t + p.pawFRCycleOffset) * p.pawFRAmplitudeZ;
  this.pawFR.rotation.x = Math.cos(t + p.pawFRCycleOffset) * p.pawFRAnkleRotationAmplitude;

  this.pawFL.position.y = 1.5 + Math.sin(t + p.pawFLCycleOffset ) * p.pawFLAmplitudeY;
  this.pawFL.position.z = 6 - Math.cos(t + p.pawFLCycleOffset ) * p.pawFLAmplitudeZ;
  this.pawFL.rotation.x = Math.cos( t + p.pawFLCycleOffset ) * p.pawFLAnkleRotationAmplitude;

  this.pawBR.position.y = 1.5 + Math.sin( t + p.pawBRCycleOffset) * p.pawBRAmplitudeY;
  this.pawBR.position.z = -Math.cos( t + p.pawBRCycleOffset) * p.pawBRAmplitudeZ;
  this.pawBR.rotation.x = Math.cos(t + p.pawBRCycleOffset + Math.PI * 0.25) * p.pawBRAnkleRotationAmplitude;

  this.pawBL.position.y = 1.5 + Math.sin(t + p.pawBLCycleOffset) * p.pawBLAmplitudeY;
  this.pawBL.position.z = - Math.cos(t + p.pawBLCycleOffset) * p.pawBLAmplitudeZ; 
  this.pawBL.rotation.x = Math.cos(t + p.pawBLCycleOffset + Math.PI * 0.25 ) * p.pawBLAnkleRotationAmplitude;
  
};

function createBunny() {
  bunny = new Bunny();
  bunny.mesh.position.y = -15;
  bunny.mesh.rotation.y = Math.PI / 2;
  scene.add(bunny.mesh);
}

function animate(){
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  if (bunny.running) {
    bunny.run();
  }

  render();
  stats.update();  
 
}

function render(){
  renderer.render(scene, camera);
}

window.addEventListener('load', init, false);

function init() {

  initScene();
  createLights();
  createBunny();
  initGUI();
  animate();
  
}
