import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 


let camera, controls, scene, renderer;
let dirLight1;
let door, eyeL, eyeR;
const mouse = { x: 0, y: 0 };

init();

function init() {
    // Scene
    scene = new THREE.Scene();
    const canvas = document.getElementById("experience-canvas");
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
    }

    // Renderer
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Toon Material
    const threeTone = textureLoader.load('./threeTone.jpg');
    threeTone.minFilter = THREE.NearestFilter;
    threeTone.magFilter = THREE.NearestFilter;
    
    const normalMap = textureLoader.load('./noise_Normals_c.png');
    normalMap.colorSpace = THREE.LinearSRGBColorSpace;

    const door_mat = new THREE.MeshToonMaterial({
        color: 0x7C67E6,
        gradientMap: threeTone,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(1, 1), 
    });

    // Eye Material
    const eye_color = textureLoader.load('./Eyes_mat_baseColor.jpg');
    const eye_normals = textureLoader.load('./Eyes_mat_normal.png');
    eye_normals.colorSpace = THREE.LinearSRGBColorSpace;
    
    const eye_mat = new THREE.MeshBasicMaterial({
        map: eye_color,
        
    });

    // Load GLTF Model
    const loader = new GLTFLoader();
    loader.load('./Door02.gltf', (gltf) => {
        door = gltf.scene;

        // Apply materials
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                // Default material for all meshes
                child.material = door_mat;
                
                // Override for eyes using AND operator
                if (child.name === 'EyeLeft' || child.name === 'EyeRight') {
                    child.material = eye_mat;
                    
                    // Store eye references for animation
                    if (child.name === 'EyeLeft') eyeL = child;
                    if (child.name === 'EyeRight') eyeR = child;
                }
            }
        });

        scene.add(door);
        door.position.y = -2;
    });

    // Camera
    camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 1000);
    camera.position.set(0, -0.7,3);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    //controls.minDistance = 4.5;
	//controls.maxDistance = 5;
	
    controls.enablePan = false;
    
    controls.enableZoom = false;
    
    //controls.maxPolarAngle = Math.PI/4;
    //controls.maxAzimuthAngle = Math.PI/3;
    

    // Lights
    dirLight1 = new THREE.DirectionalLight(0xe6eee0, 15);
    dirLight1.position.set(1, 2, 0.1);
    scene.add(dirLight1); 

 
  
   


    // Event Listeners
    window.addEventListener("resize", handleResize);
    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Start animation
    renderer.setAnimationLoop(animate);

    function handleResize() {
        sizes.width = window.innerWidth;    
        sizes.height = window.innerHeight;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix(); 

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

function animate() {
    controls.update();

    // Animate eyes to follow mouse (only if eyes are loaded)
    if (eyeL && eyeR) {

         /*If you want even more control, you can adjust these values:
        Smaller values (like 0.3) = eyes move less, more subtle
        Larger values (like 0.8) = eyes move more dramatically
        targetZ closer to camera position (like 1 or 1.5) = eyes look more directly at you */

        const vector = new THREE.Vector3(mouse.x * 2, mouse.y * 2, 1.8);
        eyeL.lookAt(vector);
        eyeR.lookAt(vector);

        
        dirLight1.rotation.y += 5;
       
    
    }

    renderer.render(scene, camera);
}









