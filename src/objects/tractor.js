import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export function createTractor(scene) {
    const loader = new GLTFLoader();

    loader.load(
        '/models/tractor/low_poly_tractor.glb',

        (gltf) => {
            const tractor = gltf.scene;

            tractor.position.set(10, 12, 0);
            tractor.scale.set(1.5, 1.5, 1.5);

            // Calculate the model's bounding box.
            // 모델의 전체 바운딩 박스를 계산합니다.
            const box = new THREE.Box3().setFromObject(tractor);

            // Automatically place the model on the ground.
            // 모델의 가장 낮은 부분을 자동으로 바닥에 맞춥니다.
            tractor.position.y -= box.min.y;

            tractor.traverse((child) => {
                console.log(child.name, child.type);

                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(tractor);
        },

        undefined,

        (error) => {
            console.error('Failed to load tractor:', error);
        }
    );
}