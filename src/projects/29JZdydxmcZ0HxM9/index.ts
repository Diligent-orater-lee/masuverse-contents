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
    const faceTrackerScene = PresetFunctions.getFaceTrackerScene('29JZdydxmcZ0HxM9');
    if (faceTrackerScene) {
        let headScene;
        THREEAddons.GLTFLoader.load('https://masuversecontentsbucket.s3.us-west-2.amazonaws.com/29JZdydxmcZ0HxM9/kakashi_head.glb', (gltf) => {
            headScene = gltf.scene;
            headScene.position.copy(new THREE.Vector3(0, 0.5, 0.1));
            headScene.scale.set(8, 8, 8);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            
            faceTrackerScene.add(ambientLight);
            faceTrackerScene.add(headScene);
        });
    }
}