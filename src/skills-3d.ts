import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export function initSkills3D() {
    const container = document.getElementById('skills-3d-container');
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 5, 22); // Pulled back for elbow visibility

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.SpotLight(0xffaa00, 800);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const blueRim = new THREE.SpotLight(0x0088ff, 400);
    blueRim.position.set(-10, 5, -5);
    scene.add(blueRim);

    const bottomFill = new THREE.PointLight(0xff0000, 50);
    bottomFill.position.set(0, -10, 5);
    scene.add(bottomFill);

    // --- MATERIALS ---
    const redMaterial = new THREE.MeshStandardMaterial({
        color: 0x880000,
        metalness: 0.8,
        roughness: 0.25,
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 1.0,
        roughness: 0.15,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x88ffff });

    // --- GEOMETRY: ARM & HAND ---
    const armGroup = new THREE.Group();
    scene.add(armGroup);

    // Rotate to present the palm
    armGroup.rotation.x = Math.PI / 6;
    armGroup.rotation.y = -Math.PI / 8;

    // 1. Forearm (Gauntlet)
    const forearmGroup = new THREE.Group();
    armGroup.add(forearmGroup);

    // Main Forearm Plate (Red)
    const forearmGeo = new THREE.CylinderGeometry(1.6, 2.0, 7, 8);
    const forearm = new THREE.Mesh(forearmGeo, redMaterial);
    forearm.position.y = -4.5; // Extends down from wrist
    forearm.castShadow = true;
    forearmGroup.add(forearm);

    // Gold Trim/Plates on Forearm
    const trimGeo = new THREE.CylinderGeometry(1.7, 2.1, 1, 8);
    const trim1 = new THREE.Mesh(trimGeo, goldMaterial);
    trim1.position.y = -2;
    trim1.castShadow = true;
    forearmGroup.add(trim1);

    const trim2 = new THREE.CylinderGeometry(1.65, 1.8, 4, 8, 1, true, 0, Math.PI); // Half shell
    const trimPlate = new THREE.Mesh(trim2, goldMaterial);
    trimPlate.position.y = -5;
    trimPlate.rotation.y = Math.PI / 2;
    trimPlate.castShadow = true;
    forearmGroup.add(trimPlate);

    // Wrist Joint
    const wristGeo = new THREE.SphereGeometry(1.4);
    const wrist = new THREE.Mesh(wristGeo, goldMaterial);
    wrist.position.y = -0.8;
    armGroup.add(wrist);

    // 2. Palm
    const palmGeo = new THREE.BoxGeometry(2.6, 3.0, 0.8);
    const palm = new THREE.Mesh(palmGeo, redMaterial);
    palm.position.y = 1.5;
    palm.castShadow = true;
    armGroup.add(palm);

    // Arc Reactor inside Palm
    const arcReactor = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32), glowMaterial);
    arcReactor.rotation.x = Math.PI / 2;
    arcReactor.position.set(0, 1.5, 0.45);
    armGroup.add(arcReactor);

    const arcLight = new THREE.PointLight(0x00ffff, 4, 8);
    arcLight.position.set(0, 1.5, 1.0);
    armGroup.add(arcLight);

    // 3. Fingers Rigging
    const createPhalanx = (r: number, l: number, mat: THREE.Material) => {
        const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 8), mat);
        mesh.position.y = l / 2 + r * 0.2;
        mesh.castShadow = true;
        return mesh;
    };

    const createFinger = (x: number, y: number, s: number) => {
        const root = new THREE.Group();
        root.position.set(x, y, 0);
        root.scale.setScalar(s);
        palm.add(root); // Attach to palm

        // Proximal
        const prox = new THREE.Group();
        root.add(prox);
        prox.add(new THREE.Mesh(new THREE.SphereGeometry(0.52), goldMaterial)); // Knuckle
        prox.add(createPhalanx(0.42, 1.1, redMaterial));

        // Middle
        const mid = new THREE.Group();
        mid.position.y = 1.4;
        prox.add(mid);
        mid.add(new THREE.Mesh(new THREE.SphereGeometry(0.42), goldMaterial));
        mid.add(createPhalanx(0.38, 0.85, goldMaterial));

        // Distal
        const dist = new THREE.Group();
        dist.position.y = 1.1;
        mid.add(dist);
        dist.add(new THREE.Mesh(new THREE.SphereGeometry(0.38), redMaterial));
        dist.add(createPhalanx(0.35, 0.7, redMaterial));

        return { root, prox, mid, dist };
    };

    const fingers = {
        index: createFinger(-1.0, 1.6, 1),
        middle: createFinger(0.0, 1.7, 1.05),
        ring: createFinger(1.0, 1.6, 1),
        pinky: createFinger(1.9, 1.4, 0.85)
    };

    // Thumb
    const thumbRoot = new THREE.Group();
    thumbRoot.position.set(-1.4, -0.8, 0.4);
    thumbRoot.rotation.z = -0.8;
    thumbRoot.rotation.y = -0.6;
    palm.add(thumbRoot);

    const thumbProx = new THREE.Group();
    thumbRoot.add(thumbProx);
    thumbProx.add(new THREE.Mesh(new THREE.SphereGeometry(0.6), goldMaterial));
    thumbProx.add(createPhalanx(0.5, 1.1, redMaterial));

    const thumbDist = new THREE.Group();
    thumbDist.position.y = 1.4;
    thumbProx.add(thumbDist);
    thumbDist.add(new THREE.Mesh(new THREE.SphereGeometry(0.45), goldMaterial));
    thumbDist.add(createPhalanx(0.42, 0.9, goldMaterial));

    const thumbRig = { root: thumbRoot, prox: thumbProx, dist: thumbDist };


    // --- HOLOGRAM ICONS ---
    const iconUrls = [
        { name: "Angular", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
        { name: "VS Code", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
        { name: "C#", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
        { name: ".NET", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg" },
        { name: "TS", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
        { name: "Git", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
        { name: "HTML", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }
    ];

    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    const particles: THREE.Mesh[] = [];

    const textureLoader = new THREE.TextureLoader();

    iconUrls.forEach((icon, i) => {
        textureLoader.load(icon.url, (tex) => {
            // Hologram material
            const mat = new THREE.MeshBasicMaterial({
                map: tex,
                transparent: true,
                opacity: 0.8,
                color: 0x00ffff, // Cyan tint for hologram effect
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), mat);

            // Position spherically
            const phi = Math.acos(-1 + (2 * i) / iconUrls.length);
            const theta = Math.sqrt(iconUrls.length * Math.PI) * phi;
            const r = 6.0;

            plane.position.x = r * Math.cos(theta) * Math.sin(phi);
            plane.position.y = r * Math.sin(theta) * Math.sin(phi) + 2.5; // Offset up
            plane.position.z = r * Math.cos(phi);

            plane.lookAt(0, 2, 0); // Look at hand center
            (plane as any).originalPos = plane.position.clone();

            particlesGroup.add(plane);
            particles.push(plane);
        });
    });


    // --- BLAST VFX ---
    const blastGroup = new THREE.Group();
    // Better to attach to palm so it moves with it
    palm.add(blastGroup);
    blastGroup.position.z = 0.5; // Slightly above palm center
    blastGroup.rotation.x = -Math.PI / 2; // Point outward from palm

    // Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(0.5, 0.8, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    blastGroup.add(shockwave);

    // Core Beam Glow
    const beamGeo = new THREE.CylinderGeometry(0.2, 0.8, 20, 16, 1, true);
    beamGeo.translate(0, 10, 0); // Pivot at base
    const beamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = -Math.PI / 2; // Point out
    blastGroup.add(beam);


    // --- ANIMATION TIMELINE ---
    const tl = gsap.timeline({ paused: true });

    // Phase 1: CHARGE UP (0% - 45%)
    // Hand rotates to aim at user, fingers splay back
    tl.to(armGroup.rotation, { x: 0, y: 0, z: 0, duration: 2, ease: "power2.out" }, "charge")
        .to(armGroup.position, { y: 0, z: 15, duration: 2 }, "charge") // Move closer/center
        .to(palm.rotation, { x: -Math.PI / 4, y: 0, duration: 2 }, "charge"); // Cock wrist back

    // Fingers tension
    const curlBack = -0.5;
    tl.to(thumbRig.prox.rotation, { x: curlBack, duration: 2 }, "charge")
        .to(fingers.index.prox.rotation, { x: curlBack, duration: 2 }, "charge")
        .to(fingers.middle.prox.rotation, { x: curlBack, duration: 2 }, "charge")
        .to(fingers.ring.prox.rotation, { x: curlBack, duration: 2 }, "charge")
        .to(fingers.pinky.prox.rotation, { x: curlBack, duration: 2 }, "charge");

    // Glow intensity up
    const reactorState = { intensity: 1, scale: 1 };
    tl.to(reactorState, {
        intensity: 5,
        scale: 1.5,
        duration: 2,
        ease: "power1.in",
        onUpdate: () => {
            arcLight.intensity = reactorState.intensity;
            arcReactor.scale.setScalar(reactorState.scale);
        }
    }, "charge");


    // Phase 2: FIRE (45% - 50%) -> The Scatter Trigger
    tl.add("fire");

    // Recoil
    tl.to(palm.position, { z: -2, duration: 0.1, yoyo: true, repeat: 1, ease: "power4.out" }, "fire");

    // Blast Visuals
    tl.to([shockwave.material, beam.material], { opacity: 1, duration: 0.05 }, "fire")
        .to(shockwave.scale, { x: 15, y: 15, duration: 0.5, ease: "power2.out" }, "fire")
        .to(beam.scale, { x: 5, z: 5, duration: 0.3, ease: "power2.out" }, "fire")
        .to(beam.material, { opacity: 0, duration: 0.3, delay: 0.1 }, "fire+=0.1")
        .to(shockwave.material, { opacity: 0, duration: 0.3, delay: 0.2 }, "fire+=0.2");

    // Flash/Whiteout
    const flashData = { val: 0 };
    tl.to(flashData, {
        val: 1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onUpdate: () => {
            const hex = new THREE.Color(0xffffff).multiplyScalar(flashData.val);
            renderer.setClearColor(hex, flashData.val * 0.8);
        }
    }, "fire");


    // Phase 3: RELAX (After Fire)
    tl.to(armGroup.rotation, { x: Math.PI / 6, duration: 1 }, "relax");


    // --- SCROLL HANDLER ---
    const updateScroll = () => {
        const rect = container.getBoundingClientRect();
        const winH = window.innerHeight;

        // Timeline range: Start entering -> Fully visible (Fire) -> Leaving
        const start = winH;
        const end = -rect.height;

        const rawProgress = (start - rect.top) / (start - end);
        const progress = Math.max(0, Math.min(1, rawProgress));

        // Sync timeline
        gsap.to(tl, {
            progress: progress,
            duration: 0.2,
            ease: "power1.out"
        });

        // Trigger SCATTER at "Fire" point (approx 0.45 in timeline)
        if (progress > 0.45) {
            // Normalized scatter time relative to blast
            const scatterT = (progress - 0.45) / 0.2; // Fast scatter
            const clampedT = Math.min(1, Math.max(0, scatterT));

            particlesGroup.children.forEach((child: any) => {
                if (!child.userData.velocity) {
                    // Blast Direction: Outward from palm center + Random spread
                    // Since palm faces user roughly, this pushes particles towards cam

                    // Radial outward from center
                    const dir = child.position.clone().normalize();
                    dir.z += 2.0; // Bias towards camera
                    dir.normalize();

                    child.userData.velocity = dir;
                    child.userData.spin = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.5);
                }

                if (child.originalPos) {
                    // FAST explosion curve
                    const dist = 60 * (1 - Math.pow(1 - clampedT, 2)); // EaseOutQuad

                    child.position.copy(child.originalPos).add(
                        child.userData.velocity.clone().multiplyScalar(dist)
                    );

                    // Spin
                    child.rotation.x += child.userData.spin.x;
                    child.rotation.y += child.userData.spin.y;

                    // Scale/Fade
                    if (clampedT > 0.1) {
                        const fade = 1 - clampedT;
                        child.scale.setScalar(1 + clampedT * 2); // Grow huge
                        if (child.material) child.material.opacity = fade;
                    }
                }
            });
        } else {
            // Reset
            particlesGroup.children.forEach((child: any) => {
                if (child.originalPos) {
                    child.position.lerp(child.originalPos, 0.2);
                    child.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
                    if (child.material) child.material.opacity = 0.8;
                    child.userData.velocity = null;
                }
            });
        }
    };

    window.addEventListener('scroll', updateScroll);

    // --- LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        controls.update();

        // Idle float (re-added for liveliness)
        if (tl.progress() < 0.2) {
            armGroup.position.y = Math.sin(time) * 0.1;
        }

        // Jitter particles during charge up
        if (tl.progress() > 0.2 && tl.progress() < 0.45) {
            particlesGroup.children.forEach((p: any) => {
                p.position.x += (Math.random() - 0.5) * 0.05;
                p.position.y += (Math.random() - 0.5) * 0.05;
            });
        }

        // Hologram flicker & facing
        particlesGroup.children.forEach((p: any) => {
            p.lookAt(camera.position);
            // Flicker
            if (p.material && p.material.opacity > 0.1) {
                p.material.opacity = p.material.opacity + (Math.random() - 0.5) * 0.1;
                // Clamp
                if (p.material.opacity > 1) p.material.opacity = 1;
                if (p.material.opacity < 0) p.material.opacity = 0;
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
