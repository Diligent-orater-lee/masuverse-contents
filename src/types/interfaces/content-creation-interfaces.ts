import { GUI, GUIController } from 'dat.gui';
import gsap from 'gsap';
import * as THREE from "three";
import { EffectComposer, FontLoader, RenderPass, ShaderPass, TextGeometry } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GlobalSceneTrackerTypes } from '../enums/tracker-enums';

export interface PresetFunctions {
    onRayCasterClick: (object: any, callback: any) => void,
    onAnimate: (callback: () => void) => void,
    onDestroy: (callback: () => void) => void,
    getFaceTrackerScene: (trackerId: string) => THREE.Scene,
    getBodyTrackerScene: (trackerId: string, type: GlobalSceneTrackerTypes) => TrackerSceneCustomizers,
    getBucketUrl: string
};

type TrackerSceneCustomizerProps = {
    onInit?: (scene: THREE.Scene) => void,
    onUpdate?: (scene: THREE.Scene) => void,
    onDestroy?: (scene: THREE.Scene) => void,
}

export type TrackerSceneCustomizers = {
    customize: (callBacks: TrackerSceneCustomizerProps) => void
}


export type ITrackerContent = {
    context: any,
    init: string;
}

export interface THREEAddons {
    GLTFLoader: GLTFLoader,
    GUI: typeof GUI;
    EffectComposer: typeof EffectComposer
    RenderPass: typeof RenderPass,
    ShaderPass: typeof ShaderPass,
    MeshTester: () => {
        add: (object: any, property: string, min: number, max: number, step?: number) => GUIController
    },
    FontLoader: typeof FontLoader,
    TextGeometry: typeof TextGeometry,
    GSAP: typeof gsap
}