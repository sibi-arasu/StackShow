import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initSkills3D() {
    const container = document.getElementById('skills-3d-container');
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x0e0e0e); // Match bg or keep transparent

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x00aaff, 3, 50);
    blueLight.position.set(-5, -5, 5); // Arc reactor glow feel
    scene.add(blueLight);

    // --- IRON MAN HAND (Procedural Construction) ---
    const handGroup = new THREE.Group();
    scene.add(handGroup);

    const redMaterial = new THREE.MeshStandardMaterial({
        color: 0x7a0000,
        metalness: 0.6,
        roughness: 0.3
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
    });
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Palm
    const palmGeo = new THREE.BoxGeometry(2.2, 2.5, 0.8);
    const palm = new THREE.Mesh(palmGeo, redMaterial);
    handGroup.add(palm);

    // Repulsor (Arc Reactor in palm)
    const repulsorGeo = new THREE.CircleGeometry(0.6, 32);
    const repulsor = new THREE.Mesh(repulsorGeo, glowMaterial);
    repulsor.position.z = 0.41;
    palm.add(repulsor);

    const repulsorLight = new THREE.PointLight(0x00ffff, 2, 10);
    repulsorLight.position.z = 1;
    palm.add(repulsorLight);

    // Fingers
    const createFinger = (xPos: number, yPos: number, scale: number) => {
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(xPos, yPos, 0);

        // Basal phalanx (Gold)
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), goldMaterial);
        p1.position.y = 0.4;
        fingerGroup.add(p1);

        // Middle phalanx (Red) - distinct joint
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.45), redMaterial);
        p2.position.y = 1.25;
        fingerGroup.add(p2);

        // Distal phalanx (Gold)
        const p3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), goldMaterial);
        p3.position.y = 2.0;
        fingerGroup.add(p3);

        return fingerGroup;
    };

    // Add Fingers
    const pinky = createFinger(0.9, 1.2, 0.8);
    pinky.scale.setScalar(0.85);
    handGroup.add(pinky);

    const ring = createFinger(0.3, 1.3, 0.9);
    ring.scale.setScalar(0.95);
    handGroup.add(ring);

    const middle = createFinger(-0.3, 1.3, 1.0);
    middle.scale.setScalar(1.0);
    handGroup.add(middle);

    const index = createFinger(-0.9, 1.2, 0.9);
    index.scale.setScalar(0.95);
    handGroup.add(index);

    // Thumb
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(-1.2, 0, 0.2); // Side of palm
    thumbGroup.rotation.z = -Math.PI / 4;
    thumbGroup.rotation.x = 0.5;

    const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), goldMaterial);
    t1.position.y = 0.45;
    thumbGroup.add(t1);

    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), redMaterial);
    t2.position.y = 1.4;
    thumbGroup.add(t2);

    handGroup.add(thumbGroup);

    // Initial Rotation
    handGroup.rotation.x = 0.5;
    handGroup.rotation.y = -0.5;


    // --- FLOATING TECH ICONS ---
    const skills = [
        { name: "VS Code", color: "#007acc" },
        { name: "TS", color: "#3178c6" },
        { name: "Angular", color: "#dd0031" },
        { name: ".NET", color: "#512bd4" },
        { name: "C#", color: "#9b4f96" },
        { name: "SQL", color: "#00bcff" },
        { name: "Git", color: "#f05032" },
        { name: "HTML", color: "#e34f26" },
        { name: "CSS", color: "#1572b6" },
    ];

    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    const createTextTexture = (text: string, color: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = 'rgba(0,0,0,0)'; // Transparent
        ctx.fillRect(0, 0, 256, 256);

        // Glow background circle
        ctx.beginPath();
        ctx.arc(128, 128, 110, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.stroke();

        // Text
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 128);

        return new THREE.CanvasTexture(canvas);
    };

    skills.forEach((skill, i) => {
        const texture = createTextTexture(skill.name, skill.color);
        if (texture) {
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(1.5, 1.5, 1);

            // Spherical distribution
            const phi = Math.acos(-1 + (2 * i) / skills.length);
            const theta = Math.sqrt(skills.length * Math.PI) * phi;

            const r = 4.5;
            sprite.position.x = r * Math.cos(theta) * Math.sin(phi);
            sprite.position.y = r * Math.sin(theta) * Math.sin(phi);
            sprite.position.z = r * Math.cos(phi);

            floatingGroup.add(sprite);
        }
    });


    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        controls.update();

        // Rotate Hand slightly
        handGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
        handGroup.rotation.x = 0.5 + Math.cos(Date.now() * 0.001) * 0.1;

        // Rotate Orbitting Skills
        floatingGroup.rotation.y += 0.005;
        floatingGroup.rotation.z += 0.002;

        // Make sprites look at camera always (default behavior, but good to know)

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
