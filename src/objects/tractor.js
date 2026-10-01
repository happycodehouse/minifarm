import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';


/* =========================================================
   TRACTOR / 트랙터
========================================================= */

export function createTractor(scene, x = 0, z = 0) {
    const loader = new GLTFLoader();

    loader.load(
        './models/tractor/tractor.glb',

        (gltf) => {
            const tractor = gltf.scene;

            tractor.position.set(x, 0, z);
            tractor.scale.set(1.5, 1.5, 1.5);


            /* =================================================
               GROUND ALIGNMENT / 바닥 정렬
            ================================================= */

            const box = new THREE.Box3().setFromObject(tractor);

            tractor.position.y -= box.min.y;


            /* =================================================
               SHADOWS / 그림자
            ================================================= */

            tractor.traverse((child) => {
                if (!child.isMesh) {
                    return;
                }

                child.castShadow = true;
                child.receiveShadow = true;
            });


            /* =================================================
               TRACTOR PARTS / 트랙터 파트
            ================================================= */

            const parts = {
                rearLeftWheel: tractor.getObjectByName('RLW'),
                rearRightWheel: tractor.getObjectByName('RRW'),
                frontLeftWheel: tractor.getObjectByName('Cylinder'),
                frontRightWheel: tractor.getObjectByName('Cylinder.003'),
                frontWheelHolder: tractor.getObjectByName('FrontWheelHolde')
            };

            console.log('===== TRACTOR =====');
            console.log(tractor);

            console.log('===== TRACTOR PARTS =====');
            console.log(parts);

            // List model parts / 모델 파트 목록 확인
            const rows = [];

            tractor.traverse((child) => {
                rows.push({
                    name: child.name || '(unnamed)',
                    type: child.type,
                    parent: child.parent?.name || '(unnamed)',
                });
            });

            console.table(rows);

            scene.add(tractor);
        },

        undefined,

        (error) => {
            console.error('Failed to load tractor:', error);
        }
    );
}