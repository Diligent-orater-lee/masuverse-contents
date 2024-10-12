import * as THREE from "three";
import { THREEAddons as Addons, PresetFunctions as PSFunctions } from '../../types/interfaces/content-creation-interfaces';

const rootScene: THREE.Scene = null as any;
const Camera: THREE.PerspectiveCamera = null as any;
const PresetFunctions: PSFunctions = null as any;
const Renderer: THREE.WebGLRenderer = null as any;
const THREEAddons: Addons = null as any;

const context = {

}

function init() {
    const faceTrackerScene = PresetFunctions.getFaceTrackerScene('8BTZnCetIsCZ5CVy');
    if (faceTrackerScene) {
        let headScene;
        let katanaScene;
        THREEAddons.GLTFLoader.load('https://masuversecontentsbucket.s3.us-west-2.amazonaws.com/8BTZnCetIsCZ5CVy/wolverine_mask.glb', (gltf) => {
            headScene = gltf.scene;
            headScene.position.copy(new THREE.Vector3(0, -0.2, 0.1));
            headScene.scale.set(4.5, 4.5, 5);

            const ambientLight = new THREE.AmbientLight(0xffffff, 2);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 2);

            const gui = new THREEAddons.GUI();
            const katanaFolder = gui.addFolder('Katanas');
            katanaFolder.add(headScene.position, 'x', -10, 10).name('Katana X');
            katanaFolder.add(headScene.position, 'y', -10, 10).name('Katana Y');
            katanaFolder.add(headScene.position, 'z', -10, 10).name('Katana Z');
            katanaFolder.add(headScene.rotation, 'x', -Math.PI, Math.PI).name('Katana Rotation X');
            katanaFolder.add(headScene.rotation, 'y', -Math.PI, Math.PI).name('Katana Rotation Y');
            katanaFolder.add(headScene.rotation, 'z', -Math.PI, Math.PI).name('Katana Rotation Z');
            katanaFolder.add(headScene.scale, 'x', -1, 10).name('Katana Scale X');
            katanaFolder.add(headScene.scale, 'y', -1, 10).name('Katana Scale Y');
            katanaFolder.add(headScene.scale, 'z', -1, 10).name('Katana Scale Z');
            
            faceTrackerScene.add(ambientLight, directionalLight);
            faceTrackerScene.add(headScene);
        });

        THREEAddons.GLTFLoader.load('https://masuversecontentsbucket.s3.us-west-2.amazonaws.com/8BTZnCetIsCZ5CVy/deadpools_katanas.glb', (gltf) => {
            katanaScene = gltf.scene;
            katanaScene.position.copy(new THREE.Vector3(0, 0, -10));
            katanaScene.rotation.set(0, -Math.PI / 2, 0);
            katanaScene.scale.set(0.04, 0.04, 0.04);
            
            const ambientLight = new THREE.AmbientLight(0xffffff, 2);
            ambientLight.position.set(0, 0, -8);
            ambientLight.rotateY(-Math.PI / 2);

            // Create the invisible mask
            const maskGeometry = new THREE.PlaneGeometry(2.8, 2.8);
            const maskMaterial = new THREE.MeshBasicMaterial({
                colorWrite: false,      // Prevents the material from writing to the color buffer
                depthWrite: true,       // Ensures writing to depth buffer
                side: THREE.DoubleSide
            });
            const mask = new THREE.Mesh(maskGeometry, maskMaterial);
            mask.position.z = -3;
            mask.renderOrder = -1;
            rootScene.add(mask);
            
            rootScene.add(katanaScene, ambientLight);
        });


    }
}