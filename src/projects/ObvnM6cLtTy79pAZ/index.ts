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
    const texts = [
        {
            title: "Boosting Employment Opportunities",
            paragraph: "BJP's skill development programs and support for startups have created countless job opportunities for Delhi's youth.",
            position: new THREE.Vector3(-0.45, 0.3, 0),
            audio: "modi_speech_opportunities.mp3"
        },
    ];

    class BulletPoint {

        text;
        paragraph;
        finalPosition;
        scene;
        plane;
        isAnimating;
        mesh;
        titleMesh;
        paragraphGroup;
        originalScale;

        constructor(text, finalPosition, plane, paragraph) {
            this.text = text;
            this.finalPosition = finalPosition;
            this.plane = plane;
            this.isAnimating = false;
            this.mesh = null;
            this.titleMesh = null;
            this.paragraphGroup = null;
            this.paragraph = paragraph;
            this.originalScale = new THREE.Vector3(0.2, 0.2, 0.2);
            this.setupMesh();
        }

        setupMesh() {
            // Create text geometry
            const loader = new THREEAddons.FontLoader();
            loader.load(PresetFunctions.getBucketUrl + 'UMJLwCKAL_mUfCSR/helvetiker_bold.typeface.json', (font) => {

                this.mesh = new THREE.Group();

                // Create title geometry
                const titleGeometry = new THREEAddons.TextGeometry(`• ${this.text}`, {
                    font: font,
                    size: 0.18,
                    height: 0.05,
                });

                const titleMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: false
                });

                this.titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
                this.mesh.add(this.titleMesh);

                const wrapText = (text, maxWidth) => {
                    const words = text.split(' ');
                    const lines = [];
                    let currentLine = [];
                    let currentWidth = 0;

                    words.forEach(word => {
                        // Create temporary geometry to measure word width
                        const tempGeometry = new THREEAddons.TextGeometry(currentLine.length ? ' ' + word : word, {
                            font: font,
                            size: 0.15,
                            height: 0.01,
                        });
                        tempGeometry.computeBoundingBox();
                        const wordWidth = tempGeometry.boundingBox.max.x - tempGeometry.boundingBox.min.x;

                        if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
                            lines.push(currentLine.join(' '));
                            currentLine = [word];
                            currentWidth = wordWidth;
                        } else {
                            currentLine.push(word);
                            currentWidth += wordWidth;
                        }

                        // Clean up temporary geometry
                        tempGeometry.dispose();
                    });

                    if (currentLine.length > 0) {
                        lines.push(currentLine.join(' '));
                    }

                    return lines;
                };

                const maxWidth = 4; // Adjust this value to change wrap width
                const lineHeight = 0.2; // Adjust this value to change spacing between lines
                const wrappedLines = wrapText(this.paragraph || "Your paragraph text here", maxWidth);

                this.paragraphGroup = new THREE.Group();

                wrappedLines.forEach((line, index) => {
                    const paragraphGeometry = new THREEAddons.TextGeometry(line, {
                        font: font,
                        size: 0.15,
                        height: 0.01,
                    });

                    const paragraphMaterial = new THREE.MeshPhongMaterial({
                        color: 0xcccccc,
                        transparent: false
                    });

                    const lineMesh = new THREE.Mesh(paragraphGeometry, paragraphMaterial);
                    lineMesh.position.y = -index * lineHeight;
                    this.paragraphGroup.add(lineMesh);
                });

                // Position paragraph below title with some spacing
                this.paragraphGroup.position.y = -0.3; // Adjust this value to change spacing
                this.mesh.add(this.paragraphGroup);

                // Create a hitbox that covers both title and paragraph
                const planeGeometry = new THREE.PlaneGeometry(1, 1);
                const planeMaterial = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                });
                const hitBox = new THREE.Mesh(planeGeometry, planeMaterial);
                hitBox.position.set(2, -0.15, 0); // Centered between title and paragraph
                hitBox.position.z += 0.01;
                hitBox.scale.set(5, 2, 1); // Increased height to cover both text elements
                this.mesh.add(hitBox);

                // Position the entire mesh
                this.mesh.position.copy(this.finalPosition);
                this.mesh.position.y -= 2; // Start 2 units below

                // Initial scale of 0
                this.mesh.scale.set(0, 0, 0);

                // Add click handler
                PresetFunctions.onRayCasterClick(hitBox, () => {
                    playPoint(this.text);
                });

                rootScene.add(this.mesh);
            });
        }

        animate(delay = 0) {
            if (!this.mesh || this.isAnimating) return;

            this.isAnimating = true;

            // Position animation
            THREEAddons.GSAP.to(this.mesh.position, {
                y: this.finalPosition.y,
                duration: 1,
                delay: delay,
                ease: "back.out(1.7)"
            });

            // Scale and opacity animation
            THREEAddons.GSAP.to(this.mesh.scale, {
                x: this.originalScale.x,
                y: this.originalScale.y,
                z: this.originalScale.z,
                duration: 1,
                delay: delay,
                ease: "back.out(1.7)"
            });

            THREEAddons.GSAP.to(this.mesh.material, {
                opacity: 1,
                duration: 1,
                delay: delay
            });
        }

        addClickAnimation() {
            if (!this.mesh) return;

            // Pulse animation on hover
            const hover = () => {
                if (!this.isAnimating) {
                    THREEAddons.GSAP.to(this.mesh.scale, {
                        x: this.originalScale.x * 1.2,
                        y: this.originalScale.y * 1.2,
                        z: this.originalScale.z * 1.2,
                        duration: 0.3,
                        ease: "power2.out",
                        yoyo: true,
                        repeat: -1
                    });
                }
            };

            // Return to normal scale on mouse leave
            const unhover = () => {
                THREEAddons.GSAP.to(this.mesh.scale, {
                    x: this.originalScale.x,
                    y: this.originalScale.y,
                    z: this.originalScale.z,
                    duration: 0.3,
                    ease: "power2.out"
                });
            };

            // Add interactivity
            this.mesh.userData.hover = hover;
            this.mesh.userData.unhover = unhover;
        }
    }

    function createBulletPoints(plane) {
        const bulletPoints = texts.map((text, index) =>
            new BulletPoint(text.title, text.position, plane, text.paragraph)
        );

        // Animate bullets with staggered delay
        setTimeout(() => {
            bulletPoints.forEach((bullet, index) => {
                bullet.animate(index * 0.3); // 0.3 second delay between each
                bullet.addClickAnimation();
            });
        }, 1000); // Wait 1 second before starting animations

        return bulletPoints;
    }

    let sectionBorderAnimation;
    function createSection() {
        const video2 = document.createElement('video');
        video2.id = 'price-section-video';
        video2.playsInline = true;
        video2.muted = true;
        video2.autoplay = true;
        video2.loop = true;
        video2.crossOrigin = 'anonymous';

        const source2 = document.createElement('source');
        source2.src = PresetFunctions.getBucketUrl + 'ObvnM6cLtTy79pAZ/win_price.mp4';
        source2.type = 'video/mp4';
        video2.appendChild(source2);

        const videoTexture2 = new THREE.VideoTexture(video2);
        videoTexture2.minFilter = THREE.LinearFilter;

        const plane2 = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            new THREE.MeshBasicMaterial({
                map: videoTexture2,
            })
        );

        plane2.position.set(0, -0.4, 0.02);
        try {
            video2.play();
        } catch (error) {
            console.error("Error playing video2:", error);
        }

        const borderOffset = 0.1; // How far the border extends beyond the plane
        const planeWidth = 0.8; // Match your existing plane width
        const planeHeight = 0.5;

        const borderGeometry = new THREE.BufferGeometry();
        const borderMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff00, // Border color
            linewidth: 2 // Note: line width only works in WebGL2
        });

        // Create vertices for the border
        const borderVertices = new Float32Array([
            // Outer rectangle
            -planeWidth/2 - borderOffset, -planeHeight/2 - borderOffset, 0.02,
            planeWidth/2 + borderOffset, -planeHeight/2 - borderOffset, 0.02,
            planeWidth/2 + borderOffset, planeHeight/2 + borderOffset, 0.02,
            -planeWidth/2 - borderOffset, planeHeight/2 + borderOffset, 0.02,
            -planeWidth/2 - borderOffset, -planeHeight/2 - borderOffset,0.020
        ]);

        borderGeometry.setAttribute('position', new THREE.BufferAttribute(borderVertices, 3));
        const border = new THREE.Line(borderGeometry, borderMaterial);
        plane2.add(border);

        // Create glowing effect using PointsMaterial
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff00,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        function initParticles() {
            for(let i = 0; i < particleCount; i++) {
                const t = i / particleCount;
                const point = getPointOnBorder(t);
                positions[i * 3] = point.x;
                positions[i * 3 + 1] = point.y;
                positions[i * 3 + 2] = point.z;
            }
        }

        function getPointOnBorder(t) {
            const perimeter = 2 * (planeWidth + planeHeight + 2 * borderOffset);
            const distance = t * perimeter;
            
            // Calculate position based on distance along perimeter
            if (distance < planeWidth + 2 * borderOffset) {
                return {
                    x: -planeWidth/2 - borderOffset + distance,
                    y: -planeHeight/2 - borderOffset,
                    z: 0
                };
            } else if (distance < planeWidth + planeHeight + 2 * borderOffset) {
                return {
                    x: planeWidth/2 + borderOffset,
                    y: -planeHeight/2 - borderOffset + (distance - (planeWidth + 2 * borderOffset)),
                    z: 0
                };
            } else if (distance < 2 * planeWidth + planeHeight + 2 * borderOffset) {
                return {
                    x: planeWidth/2 + borderOffset - (distance - (planeWidth + planeHeight + 2 * borderOffset)),
                    y: planeHeight/2 + borderOffset,
                    z: 0
                };
            } else {
                return {
                    x: -planeWidth/2 - borderOffset,
                    y: planeHeight/2 + borderOffset - (distance - (2 * planeWidth + planeHeight + 2 * borderOffset)),
                    z: 0
                };
            }
        }

        initParticles();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particlesGeometry, particleMaterial);
        plane2.add(particles);

        let time = 0;
        const speed = 0.1;
        sectionBorderAnimation = () => {
            time += speed * 0.01;
            const positions = particlesGeometry.attributes.position.array;
            
            for(let i = 0; i < particleCount; i++) {
                const t = (i / particleCount + time) % 1;
                const point = getPointOnBorder(t);
                positions[i * 3] = point.x;
                positions[i * 3 + 1] = point.y;
                positions[i * 3 + 2] = point.z;
            }
            particlesGeometry.attributes.position.needsUpdate = true;
            
            // Pulse the border opacity
            const pulseFrequency = 2;
            border.material.opacity = 0.5 + 0.5 * Math.sin(time * pulseFrequency);
        }

        rootScene.add(plane2);
    }

    function playPoint(title) {
        const point = texts.find(p => p.title === title);
        if (!point) return;

        playAudio(point);
    }

    let currentPlayingAudio;
    function playAudio(point) {
        currentPlayingAudio?.pause();
        const audio = new Audio(PresetFunctions.getBucketUrl + `ObvnM6cLtTy79pAZ/${point.audio}`);
        currentPlayingAudio = audio;
        audio.play();
        audio.onended = () => {
            console.log(`Audio for ${point.title} ended.`);
        };
    }

    const videoUrl = PresetFunctions.getBucketUrl + "ObvnM6cLtTy79pAZ/page_start_video.mp4";

    const video = document.createElement('video');
    video.id = 'content-video';
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.crossOrigin = 'anonymous';

    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.appendChild(source);

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;

    let videoPlayed = false;
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 2),
        new THREE.MeshBasicMaterial({
            map: videoTexture,
        })
    );
    rootScene.add(plane);

    video.onplay = () => {
        videoPlayed = true;
        createBulletPoints(plane);
    };

    video.onended = () => {
        createSection();
    };

    PresetFunctions.onRayCasterClick(plane, () => {
        if (!videoPlayed) {
            video.play();
        }
    });

    try {
        video.play();
    } catch (error) {
        console.error("Error playing video:", error);
    }

    let modiModel;
    THREEAddons.GLTFLoader.load(PresetFunctions.getBucketUrl + 'UMJLwCKAL_mUfCSR/narendra_damodardas_modi.glb', (gltf) => {
        modiModel = gltf.scene;
        modiModel.position.copy(new THREE.Vector3(0.8, -0.9, 0));
        modiModel.scale.set(1, 1, 1);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        rootScene.add(modiModel, ambientLight);
    });

    PresetFunctions.onAnimate(() => {
        if (sectionBorderAnimation) {
            sectionBorderAnimation();
        }
    })
}