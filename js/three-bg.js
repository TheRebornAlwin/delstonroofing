/**
 * DELSTON ROOFING - Three.js Background Effects
 * Aurora Borealis (Hero) + Neon Tubes (Process Section)
 */

(function() {
    'use strict';

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Skipping 3D effects.');
        return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log('Reduced motion preferred. Skipping 3D animations.');
        return;
    }

    // Check if mobile (skip heavy effects on mobile for performance)
    const isMobile = window.innerWidth < 768;

    // ============================================
    // AURORA BOREALIS EFFECT (Hero Section)
    // ============================================
    class AuroraBackground {
        constructor(container) {
            this.container = container;
            this.width = container.offsetWidth;
            this.height = container.offsetHeight;
            this.mouse = { x: 0, y: 0 };
            this.time = 0;

            this.init();
        }

        init() {
            // Scene
            this.scene = new THREE.Scene();

            // Camera
            this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
            this.camera.position.z = 1;

            // Renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            // Create aurora plane
            this.createAurora();

            // Events
            this.bindEvents();

            // Start animation
            this.animate();
        }

        createAurora() {
            // Shader material for aurora effect
            const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;

            const fragmentShader = `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform vec2 uResolution;
                varying vec2 vUv;

                // Simplex noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);

                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);

                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;

                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;

                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);

                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);

                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);

                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));

                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);

                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;

                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }

                // FBM (Fractal Brownian Motion)
                float fbm(vec3 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    float frequency = 1.0;
                    for (int i = 0; i < 4; i++) {
                        value += amplitude * snoise(p * frequency);
                        amplitude *= 0.5;
                        frequency *= 2.0;
                    }
                    return value;
                }

                void main() {
                    vec2 uv = vUv;
                    vec2 p = uv * 2.0 - 1.0;
                    p.x *= uResolution.x / uResolution.y;

                    // Slow time for calming effect
                    float t = uTime * 0.15;

                    // Create flowing aurora waves
                    float n1 = fbm(vec3(p * 1.5 + t * 0.3, t * 0.2));
                    float n2 = fbm(vec3(p * 2.0 - t * 0.2, t * 0.15 + 100.0));
                    float n3 = fbm(vec3(p * 0.8 + t * 0.1, t * 0.25 + 200.0));

                    // Aurora colors (blue theme)
                    vec3 color1 = vec3(0.145, 0.388, 0.922); // Primary blue #2563eb
                    vec3 color2 = vec3(0.231, 0.510, 0.965); // Lighter blue #3b82f6
                    vec3 color3 = vec3(0.376, 0.647, 0.980); // Even lighter #60a5fa
                    vec3 color4 = vec3(0.859, 0.918, 0.992); // Very light #dbeafe

                    // Mix colors based on noise
                    vec3 aurora = mix(color1, color2, n1 * 0.5 + 0.5);
                    aurora = mix(aurora, color3, n2 * 0.5 + 0.5);
                    aurora = mix(aurora, color4, n3 * 0.3);

                    // Vertical gradient for aurora band effect
                    float band = smoothstep(0.0, 0.5, uv.y) * smoothstep(1.0, 0.6, uv.y);
                    band *= (n1 + n2) * 0.5 + 0.5;

                    // Final color with transparency
                    float alpha = band * 0.4;
                    alpha *= smoothstep(0.0, 0.3, uv.y);

                    gl_FragColor = vec4(aurora, alpha);
                }
            `;

            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uResolution: { value: new THREE.Vector2(this.width, this.height) }
                },
                transparent: true,
                depthWrite: false
            });

            this.aurora = new THREE.Mesh(geometry, material);
            this.scene.add(this.aurora);
        }

        bindEvents() {
            // Resize handler
            window.addEventListener('resize', () => {
                this.width = this.container.offsetWidth;
                this.height = this.container.offsetHeight;

                this.camera.aspect = this.width / this.height;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize(this.width, this.height);
                this.aurora.material.uniforms.uResolution.value.set(this.width, this.height);
            });

            // Mouse move (subtle interaction)
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            });
        }

        animate() {
            if (!this.container.isConnected) return;

            this.time += 0.01;
            this.aurora.material.uniforms.uTime.value = this.time;
            this.aurora.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(() => this.animate());
        }

        destroy() {
            this.renderer.dispose();
            this.scene.clear();
        }
    }

    // ============================================
    // NEON TUBES EFFECT (Process Section)
    // ============================================
    class NeonTubes {
        constructor(container) {
            this.container = container;
            this.width = container.offsetWidth;
            this.height = container.offsetHeight;
            this.mouse = { x: 0.5, y: 0.5 };
            this.points = [];
            this.tubes = [];

            this.init();
        }

        init() {
            // Scene
            this.scene = new THREE.Scene();

            // Camera
            this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
            this.camera.position.z = 5;

            // Renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);

            // Create tubes
            this.createTubes();

            // Events
            this.bindEvents();

            // Animate
            this.animate();
        }

        createTubes() {
            const numTubes = 5;
            const tubeColors = [
                0x2563eb, // Primary blue
                0x3b82f6, // Lighter blue
                0x60a5fa, // Even lighter
                0x93c5fd, // Light blue
                0xf97316  // Accent orange
            ];

            for (let i = 0; i < numTubes; i++) {
                // Create random curve
                const points = [];
                const numPoints = 20;

                for (let j = 0; j < numPoints; j++) {
                    const x = (j / numPoints) * 10 - 5 + Math.sin(j * 0.5 + i) * 2;
                    const y = Math.sin(j * 0.3 + i * 2) * 3;
                    const z = Math.cos(j * 0.2 + i) * 2 - 5;
                    points.push(new THREE.Vector3(x, y, z));
                }

                const curve = new THREE.CatmullRomCurve3(points);
                const geometry = new THREE.TubeGeometry(curve, 100, 0.05 + Math.random() * 0.05, 8, false);

                const material = new THREE.MeshBasicMaterial({
                    color: tubeColors[i % tubeColors.length],
                    transparent: true,
                    opacity: 0.6
                });

                const tube = new THREE.Mesh(geometry, material);
                tube.userData = {
                    originalPoints: points.map(p => p.clone()),
                    speed: 0.5 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2
                };

                this.tubes.push(tube);
                this.scene.add(tube);
            }

            // Add glow effect using sprites
            this.addGlow();
        }

        addGlow() {
            // Create a simple glow sprite texture
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.5)');
            gradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.2)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);

            // Add glow sprites at random positions
            for (let i = 0; i < 20; i++) {
                const material = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.3 + Math.random() * 0.3
                });
                const sprite = new THREE.Sprite(material);
                sprite.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 4 - 3
                );
                sprite.scale.set(1 + Math.random(), 1 + Math.random(), 1);
                this.scene.add(sprite);
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                this.width = this.container.offsetWidth;
                this.height = this.container.offsetHeight;

                this.camera.aspect = this.width / this.height;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize(this.width, this.height);
            });

            // Mouse interaction
            this.container.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / this.width;
                this.mouse.y = (e.clientY - rect.top) / this.height;
            });

            // Click to randomize colors
            this.container.addEventListener('click', () => {
                this.randomizeColors();
            });
        }

        randomizeColors() {
            const colors = [
                0x2563eb, 0x3b82f6, 0x60a5fa, 0x93c5fd,
                0xf97316, 0xfb923c, 0x22c55e, 0x8b5cf6
            ];

            this.tubes.forEach(tube => {
                const newColor = colors[Math.floor(Math.random() * colors.length)];
                tube.material.color.setHex(newColor);
            });
        }

        animate() {
            if (!this.container.isConnected) return;

            const time = performance.now() * 0.001;

            // Animate tubes
            this.tubes.forEach((tube, i) => {
                const { speed, phase } = tube.userData;

                // Gentle rotation based on mouse
                tube.rotation.x = Math.sin(time * speed + phase) * 0.1 + (this.mouse.y - 0.5) * 0.2;
                tube.rotation.y = Math.cos(time * speed + phase) * 0.1 + (this.mouse.x - 0.5) * 0.2;

                // Subtle position animation
                tube.position.x = Math.sin(time * speed * 0.5 + phase) * 0.5;
                tube.position.y = Math.cos(time * speed * 0.5 + phase) * 0.3;
            });

            // Camera slight movement
            this.camera.position.x = (this.mouse.x - 0.5) * 0.5;
            this.camera.position.y = (this.mouse.y - 0.5) * 0.3;
            this.camera.lookAt(0, 0, -3);

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(() => this.animate());
        }

        destroy() {
            this.renderer.dispose();
            this.scene.clear();
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Initialize Aurora Background (Hero)
        const heroCanvas = document.getElementById('hero-canvas');
        if (heroCanvas && !isMobile) {
            try {
                new AuroraBackground(heroCanvas);
                console.log('Aurora background initialized');
            } catch (e) {
                console.warn('Aurora background failed:', e);
            }
        }

        // Initialize Neon Tubes (Process Section)
        const neonCanvas = document.getElementById('neon-canvas');
        if (neonCanvas && !isMobile) {
            // Use Intersection Observer to only initialize when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        try {
                            new NeonTubes(neonCanvas);
                            console.log('Neon tubes initialized');
                        } catch (e) {
                            console.warn('Neon tubes failed:', e);
                        }
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(neonCanvas);
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
