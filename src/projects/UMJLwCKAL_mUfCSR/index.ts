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
            title: "Strengthening Delhi's Infrastructure",
            paragraph: "BJP has been instrumental in modernizing Delhi's roads, highways, and public transportation systems. Projects like the Eastern Peripheral Expressway have decongested traffic and reduced pollution.",
            position: new THREE.Vector3(-0.45, 0.3, 0),
            audio: "modi_speech_infrastructure.mp3"
        },
        {
            title: "Ensuring Women's Safety",
            paragraph: "BJP implemented programs like “Himmat Plus,” providing women with safety apps and helplines, enhancing their security and confidence in the city.",
            position: new THREE.Vector3(-0.45, 0, 0),
            audio: "modi_speech_women_safety.mp3"
        },
        {
            title: "Empowering the Youth",
            paragraph: "Through educational reforms and initiatives like the Digital India campaign, BJP has empowered the youth with knowledge and technological skills.",
            position: new THREE.Vector3(-0.45, -0.3, 0),
            audio: "modi_speech_youth.mp3"
        },
        {
            title: "Revolutionizing Public Housing",
            paragraph: "Under the Pradhan Mantri Awas Yojana, BJP has provided affordable housing for thousands of Delhi residents, ensuring shelter for all.",
            position: new THREE.Vector3(-0.45, -0.6, 0),
            audio: "modi_speech_housing.mp3"
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

    const videoUrl = PresetFunctions.getBucketUrl + "UMJLwCKAL_mUfCSR/page_start_video.mp4";

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
    
    PresetFunctions.onRayCasterClick(plane, () => {
        if (!videoPlayed) {
            video.play();
        }
    });


    let modiModel;
    THREEAddons.GLTFLoader.load(PresetFunctions.getBucketUrl + 'UMJLwCKAL_mUfCSR/narendra_damodardas_modi.glb', (gltf) => {
        modiModel = gltf.scene;
        modiModel.position.copy(new THREE.Vector3(0.8, -0.9, 0));
        modiModel.scale.set(1, 1, 1);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        rootScene.add(modiModel, ambientLight);
    });

    try {
        video.play();
    } catch (error) {
        console.error("Error playing video:", error);
    }

    function playPoint(title) {
        const point = texts.find(p => p.title === title);
        if (!point) return;

        playAudio(point);
    }

    let currentPlayingAudio;
    function playAudio(point) {
        currentPlayingAudio?.pause();
        const audio = new Audio(PresetFunctions.getBucketUrl + `UMJLwCKAL_mUfCSR/${point.audio}`);
        currentPlayingAudio = audio;
        audio.play();
        audio.onended = () => {
            console.log(`Audio for ${point.title} ended.`);
        };
    }
}