import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { params } from './config/params.js';
import { createSunMoon } from './objects/sunMoon.js';
import { createForestSystem } from './systems/forest.js';
import { createFarmSystem } from './systems/farm.js';
import { createDayNightSystem } from './systems/dayNight.js';
import { createGUI } from './ui/gui.js';

const GROUND_SIZE = 100;
const SUN_DISTANCE = 35;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 8, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 5, 0);
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 5;
controls.maxDistance = 100;
controls.update();

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x4caf50 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE, 0x333333, 0x666666);
grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.35;
scene.add(grid);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;
const shadowRange = GROUND_SIZE / 2 + 5;
directionalLight.shadow.camera.left = -shadowRange;
directionalLight.shadow.camera.right = shadowRange;
directionalLight.shadow.camera.top = shadowRange;
directionalLight.shadow.camera.bottom = -shadowRange;
directionalLight.shadow.bias = -0.0005;
scene.add(directionalLight);

/* =========================================================
   LIGHT HELPER / 조명 가이드
========================================================= */

// Visualizes the direction of sunlight or moonlight.
// 해 또는 달빛이 향하는 방향을 시각적으로 표시합니다.
const lightHelper =
    new THREE.DirectionalLightHelper(
        directionalLight,
        5,
        0xffff00
    );

lightHelper.visible = false;

scene.add(
    lightHelper
);

const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x4caf50, 0.6);
scene.add(hemisphereLight);

const celestial = createSunMoon(scene);
const forest = createForestSystem({ scene, params, groundSize: GROUND_SIZE });
const farm = createFarmSystem({ scene, params, forest, groundSize: GROUND_SIZE });
const dayNight = createDayNightSystem({
    scene,
    params,
    celestial,
    directionalLight,
    hemisphereLight,
    grid,
    sunDistance: SUN_DISTANCE
});
const gui = createGUI({
    scene,
    camera,
    renderer,
    controls,
    params,
    grid,
    forest,
    farm,
    dayNight,
    lightHelper
});

// Trees must be generated before cows for collision checks.
// 충돌 검사를 위해 나무를 젖소보다 먼저 생성합니다.
forest.regenerate();
farm.regenerate();
dayNight.update();

function animate() {
    requestAnimationFrame(
        animate
    );

    if (dayNight.updateAuto()) {
        gui.updateHourDisplay();
    }

    controls.update();

    // Synchronize the helper with the current light.
    // 현재 조명 위치와 가이드 위치를 동기화합니다.
    if (lightHelper.visible) {
        lightHelper.update();
    }

    renderer.render(
        scene,
        camera
    );
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
