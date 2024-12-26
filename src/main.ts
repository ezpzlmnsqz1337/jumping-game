import * as BABYLON from '@babylonjs/core';
// import earcut from 'earcut';
import './style.css'
import HavokPhysics from "@babylonjs/havok";

const canvas = <BABYLON.Nullable<HTMLCanvasElement>>document.getElementById('render-canvas');

const engine = new BABYLON.Engine(canvas);

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  const boxMaterial = new BABYLON.StandardMaterial('boxMaterial');
  scene.createDefaultCamera(true, false, true);
  const box = BABYLON.MeshBuilder.CreateBox('player', {
    width: 0.2,
    height: 0.2,
    depth: 0.2
  });
  box.material = boxMaterial;
  box.position.y = 1;
  boxMaterial.diffuseColor = new BABYLON.Color3(0,1,0); 

  const ground = BABYLON.MeshBuilder.CreateGround('ground', {
    height: 20,
    width: 20
  });

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
  
  // const light = new BABYLON.HemisphericLight('hemisphericLight', new BABYLON.Vector3(-5,5,0), scene);
  const light = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(-2,-3,0), scene);
  const lightGizmo = new BABYLON.LightGizmo(utilLayer);
  lightGizmo.light = light

  const shadowGenerator = new BABYLON.ShadowGenerator(1024,  light);
  shadowGenerator.addShadowCaster(box);
  ground.receiveShadows = true;
  shadowGenerator.useBlurCloseExponentialShadowMap = true;
  shadowGenerator.useKernelBlur = true;
  shadowGenerator.blurKernel = 64;

  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 10;
  scene.fogEnd = 16;
  
 // pass the engine to the plugin
 const havokInstance = await HavokPhysics();
 const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);
 const gravityVector = new BABYLON.Vector3(0, -9.8, 0);
 // enable physics in the scene with a gravity
 scene.enablePhysics(gravityVector, physicsPlugin);

 // Create a box shape and the associated body. Size will be determined automatically.
 const boxAggregate = new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);

 // Create a static box shape.
 const groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

  // const fontData = await (await fetch('fonts/Montserrat_Regular.json')).json();
  // const text = BABYLON.MeshBuilder.CreateText('', 'My Text', fontData, { size: 2 }, scene, earcut);

  return scene;
}

const scene = await createScene();

engine.runRenderLoop(() => {
  if(scene) {
    scene.render();
  }
});

window.addEventListener('resize', () => {
  engine.resize();
});