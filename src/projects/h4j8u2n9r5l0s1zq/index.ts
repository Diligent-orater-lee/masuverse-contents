import * as THREE from "three";
import { GLTFLoader as gltfLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PresetFunctions as PSFunctions } from '../../types/interfaces/content-creation-interfaces';

const rootScene: THREE.Scene = null as any;
const Camera: THREE.PerspectiveCamera = null as any;
const PresetFunctions: PSFunctions = null as any;
const GLTFLoader: gltfLoader = null as any;

const context = {

}

function init() {

    const _VS = `
    uniform float pointMultiplier;

    attribute float size;
    attribute float angle;
    attribute vec4 aColor;

    varying vec4 vColor;
    varying vec2 vAngle;

    void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * pointMultiplier / gl_Position.w;

    vAngle = vec2(cos(angle), sin(angle));
    vColor = aColor;
    }`;

    const _FS = `
    uniform sampler2D diffuseTexture;

    varying vec4 vColor;
    varying vec2 vAngle;

    void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
    }`;
    const loader = new THREE.TextureLoader();

    function getSprite({ hasFog, color, opacity, path, pos, size }) {
        const spriteMat = new THREE.SpriteMaterial({
            color,
            fog: hasFog,
            map: loader.load(path),
            transparent: true,
            opacity,
        });
        spriteMat.color.offsetHSL(0, 0, Math.random() * 0.2 - 0.1);
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(pos.x, -pos.y, pos.z);
        size += Math.random() - 0.5;
        sprite.scale.set(size, size, size);
        sprite.material.rotation = 0;
        return sprite;
    }

    function getLayer({
        hasFog = true,
        hue = 0.0,
        numSprites = 10,
        opacity = 1,
        path = "https://masuversecontentsbucket.s3.us-west-2.amazonaws.com/h4j8u2n9r5l0s1zq/rad-grad.png",
        radius = 1,
        sat = 0.5,
        size = 1,
        z = 0,
    }) {
        const layerGroup = new THREE.Group();
        for (let i = 0; i < numSprites; i += 1) {
            let angle = (i / numSprites) * Math.PI * 2;
            const pos = new THREE.Vector3(
                Math.cos(angle) * Math.random() * radius,
                Math.sin(angle) * Math.random() * radius,
                z + Math.random()
            );
            const length = new THREE.Vector3(pos.x, pos.y, 0).length();
            // const hue = 0.0; // (0.9 - (radius - length) / radius) * 1;

            let color = new THREE.Color().setHSL(hue, 1, sat);
            const sprite = getSprite({ hasFog, color, opacity, path, pos, size });
            layerGroup.add(sprite);
        }
        return layerGroup;
    }

    function getParticleSystem(params) {
        const { camera, emitter, parent, rate, texture } = params;
        const uniforms = { diffuseTexture: { value: new THREE.TextureLoader().load(texture) }, pointMultiplier: { value: window.innerHeight / (2.0 * Math.tan(30.0 * Math.PI / 180.0)) } };
        const _material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        let _particles = [];

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
        geometry.setAttribute('aColor', new THREE.Float32BufferAttribute([], 4));
        geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

        const _points = new THREE.Points(geometry, _material);

        parent.add(_points);

        const alphaSpline = getLinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        alphaSpline.addPoint(0.0, 0.0);
        alphaSpline.addPoint(0.6, 1.0);
        alphaSpline.addPoint(1.0, 0.0);

        const colorSpline = getLinearSpline((t, a, b) => {
            const c = a.clone();
            return c.lerp(b, t);
        });
        colorSpline.addPoint(0.0, new THREE.Color(0xFFFFFF));
        colorSpline.addPoint(1.0, new THREE.Color(0xff8080));

        const sizeSpline = getLinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        sizeSpline.addPoint(0.0, 0.0);
        sizeSpline.addPoint(1.0, 1.0);
        // max point size = 512; => console.log(ctx.getParameter(ctx.ALIASED_POINT_SIZE_RANGE));
        const radius = 0.5;
        const maxLife = 1.5;
        const maxSize = 7;
        let gdfsghk = 0.0;

        function _AddParticles(timeElapsed) {
            gdfsghk += timeElapsed;
            const n = Math.floor(gdfsghk * rate);
            gdfsghk -= n / rate;
            for (let i = 0; i < n; i += 1) {
                const life = (Math.random() * 0.75 + 0.25) * maxLife;
                _particles.push({
                    position: new THREE.Vector3(
                        (Math.random() * 2 - 1) * radius,
                        (Math.random() * 2 - 1) * radius,
                        (Math.random() * 2 - 1) * radius).add(emitter.position),
                    size: (Math.random() * 0.5 + 0.5) * maxSize,
                    colour: new THREE.Color(),
                    alpha: 1.0,
                    life: life,
                    maxLife: life,
                    rotation: Math.random() * 2.0 * Math.PI,
                    rotationRate: Math.random() * 0.01 - 0.005,
                    velocity: new THREE.Vector3(0, 1.5, 0),
                });
            }
        }

        function _UpdateGeometry() {
            const positions = [];
            const sizes = [];
            const colours = [];
            const angles = [];

            for (let p of _particles) {
                positions.push(p.position.x, p.position.y, p.position.z);
                colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
                sizes.push(p.currentSize);
                angles.push(p.rotation);
            }

            geometry.setAttribute(
                'position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute(
                'size', new THREE.Float32BufferAttribute(sizes, 1));
            geometry.setAttribute(
                'aColor', new THREE.Float32BufferAttribute(colours, 4));
            geometry.setAttribute(
                'angle', new THREE.Float32BufferAttribute(angles, 1));

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;
            geometry.attributes.aColor.needsUpdate = true;
            geometry.attributes.angle.needsUpdate = true;
        }
        _UpdateGeometry();

        function _UpdateParticles(timeElapsed) {
            for (let p of _particles) {
                p.life -= timeElapsed;
            }

            _particles = _particles.filter(p => {
                return p.life > 0.0;
            });

            for (let p of _particles) {
                const t = 1.0 - p.life / p.maxLife;
                p.rotation += p.rotationRate;
                p.alpha = alphaSpline.getValueAt(t);
                p.currentSize = p.size * sizeSpline.getValueAt(t);
                p.colour.copy(colorSpline.getValueAt(t));

                p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

                const drag = p.velocity.clone();
                drag.multiplyScalar(timeElapsed * 0.1);
                drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
                drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
                drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
                p.velocity.sub(drag);
            }

            _particles.sort((a, b) => {
                const d1 = camera.position.distanceTo(a.position);
                const d2 = camera.position.distanceTo(b.position);

                if (d1 > d2) {
                    return -1;
                }
                if (d1 < d2) {
                    return 1;
                }
                return 0;
            });
        }

        function update(timeElapsed) {
            _AddParticles(timeElapsed);
            _UpdateParticles(timeElapsed);
            _UpdateGeometry();
        }
        return { update };
    }

    let fireEffect;
    let footballScene;
    GLTFLoader.load('https://masuversecontentsbucket.s3.us-west-2.amazonaws.com/h4j8u2n9r5l0s1zq/sci-fi_football.glb', (gltf) => {
        footballScene = gltf.scene;
        footballScene.position = new THREE.Vector3(0, 2, 0);
        footballScene.scale.set(4, 4, 4);
        rootScene.add(footballScene);

        fireEffect = getParticleSystem({
            camera: Camera,
            emitter: footballScene,
            parent: rootScene,
            rate: 50.0,
            texture: 'https://masuversecontentsbucket.s3.us-west-2.amazonaws.com/h4j8u2n9r5l0s1zq/fire.png',
        });
    });

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    rootScene.add(hemiLight);

    const gradientBackground = getLayer({
        hue: 0.6,
        numSprites: 8,
        opacity: 0.2,
        radius: 10,
        size: 24,
        z: 1,
    });
    // rootScene.add(gradientBackground);

    // Create the invisible mask
    const maskGeometry = new THREE.PlaneGeometry(4, 4);
    const maskMaterial = new THREE.MeshBasicMaterial({
        colorWrite: false,      // Prevents the material from writing to the color buffer
        depthWrite: true,       // Ensures writing to depth buffer
        side: THREE.DoubleSide
    });
    const mask = new THREE.Mesh(maskGeometry, maskMaterial);
    mask.position.z = 0;
    mask.renderOrder = -1;
    rootScene.add(mask);

    function getLinearSpline(lerp) {

        const points = [];
        const _lerp = lerp;

        function addPoint(t, d) {
            points.push([t, d]);
        }

        function getValueAt(t) {
            let p1 = 0;

            for (let i = 0; i < points.length; i++) {
                if (points[i][0] >= t) {
                    break;
                }
                p1 = i;
            }

            const p2 = Math.min(points.length - 1, p1 + 1);

            if (p1 == p2) {
                return points[p1][1];
            }

            return _lerp(
                (t - points[p1][0]) / (
                    points[p2][0] - points[p1][0]),
                points[p1][1], points[p2][1]);
        }
        return { addPoint, getValueAt };
    }

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Animation parameters
    const a = 3; // axis1
    const b = 4; // axis2
    let time = 0;
    const period = 5; // Time to complete one orbit (in seconds)

    // Orbit inclination angles (in radians)
    const inclinationX = Math.PI * 0.2; // Tilt around X axis (affecting Y component)
    const inclinationZ = Math.PI * 0.1; // Tilt around Z axis

    function animate() {
        if (footballScene) {
            footballScene.rotation.x += 0.01;
            footballScene.rotation.y += 0.02;

            // Update time
            time += 0.016; // Approximately 60 FPS

            // Calculate position on ellipse with easing
            const t = (time % period) / period;
            const easedT = easeInOutCubic(t);
            const angle = easedT * Math.PI * 2;

            // Calculate base position on ellipse
            const baseX = a * Math.cos(angle);
            const baseY = 0; // We'll add Y component through rotation
            const baseZ = b * Math.sin(angle);

            // Apply rotations to create 3D orbit
            // First rotate around X axis (affecting Y and Z)
            const rotatedY1 = baseY * Math.cos(inclinationX) - baseZ * Math.sin(inclinationX);
            const rotatedZ1 = baseY * Math.sin(inclinationX) + baseZ * Math.cos(inclinationX);

            // Then rotate around Z axis (affecting X and Y)
            const finalX = baseX * Math.cos(inclinationZ) - rotatedY1 * Math.sin(inclinationZ);
            const finalY = baseX * Math.sin(inclinationZ) + rotatedY1 * Math.cos(inclinationZ);
            const finalZ = rotatedZ1;

            // Apply the calculated position
            footballScene.position.set(finalX, finalY, finalZ);
        }
        fireEffect?.update(0.016);
    }

    PresetFunctions.onAnimate(animate);
}