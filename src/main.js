import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import {params} from './config/params.js';

import {createSunMoon} from './objects/sunMoon.js';
import {createGroundLight} from './objects/groundLight.js';
import {createTractor} from './objects/tractor.js';

import {createForestSystem} from './systems/forest.js';
import {createFarmSystem} from './systems/farm.js';
import {createDayNightSystem} from './systems/dayNight.js';

import {createGUI} from './ui/gui.js';


/* =========================================================
   CONSTANTS / 상수
========================================================= */

const GROUND_SIZE = 70;
const SUN_DISTANCE = 45;


/* =========================================================
   FIXED OBJECT POSITIONS / 고정 오브젝트 위치
========================================================= */

const GROUND_LIGHT_POSITION = {
    x: 8,
    z: 8
};

const TRACTOR_POSITION = {
    x: 0,
    z: 0
};


/*
 * Areas where randomly generated objects cannot appear.
 * 랜덤 생성 오브젝트가 배치될 수 없는 영역입니다.
 */
const reservedAreas = [
    {
        x: GROUND_LIGHT_POSITION.x,
        z: GROUND_LIGHT_POSITION.z,
        radius: 2
    },
    {
        x: TRACTOR_POSITION.x,
        z: TRACTOR_POSITION.z,
        radius: 4
    }
];


/* =========================================================
   LOADING SCREEN / 로딩 화면
========================================================= */

const loadingScreen = document.querySelector('#loading-screen');
const loadingProgress = document.querySelector('#loading-progress');
const loadingText = document.querySelector('#loading-text');

function setLoadingProgress(progress, message) {
    if (loadingProgress) {
        loadingProgress.style.width = `${progress}%`;
    }

    if (loadingText) {
        loadingText.textContent = message;
    }
}


// Allow the browser to display the changed progress bar.
// 변경된 로딩바가 브라우저에 표시될 때까지 기다립니다.
function waitForNextFrame() {
    return new Promise((resolve) => {
        requestAnimationFrame(resolve);
    });
}


function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}


setLoadingProgress(10, 'Preparing renderer...');


/* =========================================================
   SCENE / 장면
========================================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);


/* =========================================================
   CAMERA / 카메라
========================================================= */

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 8, 24);


/* =========================================================
   RENDERER / 렌더러
========================================================= */

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);


/* =========================================================
   ORBIT CONTROLS / 카메라 조작
========================================================= */

const controls = new OrbitControls(camera, renderer.domElement);

controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};

controls.screenSpacePanning = false;
controls.enablePan = true;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.target.set(0, 5, 0);

controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 5;
controls.maxDistance = 100;

controls.update();


/* =========================================================
   GROUND / 바닥
========================================================= */

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({color: 0x4caf50})
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);


/* =========================================================
   GRID / 그리드
========================================================= */

const grid = new THREE.GridHelper(
    GROUND_SIZE,
    GROUND_SIZE,
    0x333333,
    0x666666
);

grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.35;

scene.add(grid);


/* =========================================================
   GROUND LIGHT / 바닥 조명
========================================================= */

const groundLight = createGroundLight(
    scene,
    GROUND_LIGHT_POSITION.x,
    GROUND_LIGHT_POSITION.z
);


/* =========================================================
   DIRECTIONAL LIGHT / 방향광
========================================================= */

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

const lightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    5,
    0xffff00
);

lightHelper.visible = false;

scene.add(lightHelper);


/* =========================================================
   HEMISPHERE LIGHT / 반구광
========================================================= */

const hemisphereLight = new THREE.HemisphereLight(
    0x87ceeb,
    0x4caf50,
    0.6
);

scene.add(hemisphereLight);


/* =========================================================
   SUN AND MOON / 해와 달
========================================================= */

const celestial = createSunMoon(scene);


/* =========================================================
   TRACTOR / 트랙터
========================================================= */

createTractor(
    scene,
    TRACTOR_POSITION.x,
    TRACTOR_POSITION.z
);


/* =========================================================
   FOREST / 숲
========================================================= */

const forest = createForestSystem({
    scene,
    params,
    groundSize: GROUND_SIZE,
    reservedAreas
});


/* =========================================================
   FARM / 목장
========================================================= */

const farm = createFarmSystem({
    scene,
    params,
    forest,
    groundSize: GROUND_SIZE,
    reservedAreas
});


/* =========================================================
   DAY AND NIGHT / 낮과 밤
========================================================= */

const dayNight = createDayNightSystem({
    scene,
    params,
    celestial,
    directionalLight,
    hemisphereLight,
    grid,
    sunDistance: SUN_DISTANCE
});


/* =========================================================
   GUI / GUI 설정
========================================================= */

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
    lightHelper,
    groundLight
});


/* =========================================================
   INITIALIZATION / 초기화
========================================================= */

async function initializeScene() {
    setLoadingProgress(30, 'Growing trees...');
    await waitForNextFrame();

    forest.regenerate();


    setLoadingProgress(60, 'Generating cows...');
    await waitForNextFrame();

    farm.regenerate();


    setLoadingProgress(80, 'Adjusting lighting...');
    await waitForNextFrame();

    dayNight.update();


    setLoadingProgress(90, 'Rendering scene...');
    await waitForNextFrame();

    renderer.compile(scene, camera);
    renderer.render(scene, camera);


    setLoadingProgress(100, 'Complete');

    await wait(300);

    document.body.classList.add('scene-ready');
    loadingScreen?.classList.add('hidden');

    animate();
}


/* =========================================================
   ANIMATION LOOP / 애니메이션 루프
========================================================= */

function animate() {
    requestAnimationFrame(animate);

    if (dayNight.updateAuto()) {
        gui.updateHourDisplay();
    }

    controls.update();

    if (lightHelper.visible) {
        lightHelper.update();
    }

    renderer.render(scene, camera);
}


/* =========================================================
   WINDOW RESIZE / 화면 크기 변경
========================================================= */

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', handleResize);


/* =========================================================
   START APPLICATION / 애플리케이션 시작
========================================================= */

initializeScene();