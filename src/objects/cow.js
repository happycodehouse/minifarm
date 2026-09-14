import * as THREE from 'three';

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

function addBox(parent, width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(blockGeometry, material);
    mesh.scale.set(width, height, depth);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

// Creates one cow. Body and spot materials are cloned so each cow can be edited.
// 소마다 몸통과 얼룩 재질을 복제하여 개별 색상 변경이 가능하게 합니다.
export function createCow(materials) {
    const { white, brown, spot, nose, horn, hoof, eye } = materials;
    const cow = new THREE.Group();

    const baseMaterial = (Math.random() < 0.35 ? brown : white).clone();
    const spotMaterial = spot.clone();
    cow.userData.baseMaterial = baseMaterial;
    cow.userData.spotMaterial = spotMaterial;

    const SPOT_OFFSET = 0.025;
    const SPOT_THICKNESS = 0.035;
    const bodyW = 2.2;
    const bodyH = 1.3;
    const bodyD = 1.1;
    const legH = 0.9;
    const bodyY = legH + bodyH / 2;

    // Body / 몸통
    addBox(cow, bodyW, bodyH, bodyD, 0, bodyY, 0, baseMaterial);

    // Side spots / 옆면 얼룩
    const sideSpotCount = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < sideSpotCount; i++) {
        const width = 0.4 + Math.random() * 0.6;
        const height = 0.35 + Math.random() * 0.55;
        const x = (Math.random() - 0.5) * (bodyW - width * 0.6);
        const y = bodyY + (Math.random() - 0.5) * (bodyH - height * 0.5) * 0.9;
        const side = Math.random() < 0.5 ? 1 : -1;
        const z = side * (bodyD / 2 + SPOT_OFFSET + SPOT_THICKNESS / 2);
        addBox(cow, width, height, SPOT_THICKNESS, x, y, z, spotMaterial);
    }

    // Top spots / 등 얼룩
    const topSpotCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < topSpotCount; i++) {
        const width = 0.5 + Math.random() * 0.5;
        const depth = 0.4 + Math.random() * 0.5;
        const x = (Math.random() - 0.5) * (bodyW - width);
        const z = (Math.random() - 0.5) * (bodyD - depth);
        const y = bodyY + bodyH / 2 + SPOT_OFFSET + SPOT_THICKNESS / 2;
        addBox(cow, width, SPOT_THICKNESS, depth, x, y, z, spotMaterial);
    }

    // Front and rear spots / 앞뒤 얼룩
    addBox(cow, SPOT_THICKNESS, bodyH * 0.85, bodyD * 0.9,
        bodyW / 2 + SPOT_OFFSET + SPOT_THICKNESS / 2, bodyY, 0, spotMaterial);
    if (Math.random() < 0.6) {
        addBox(cow, SPOT_THICKNESS, bodyH * 0.75, bodyD * 0.85,
            -bodyW / 2 - SPOT_OFFSET - SPOT_THICKNESS / 2, bodyY, 0, spotMaterial);
    }

    // Legs and hooves / 다리와 발굽
    const legW = 0.4;
    const legX = bodyW / 2 - legW / 2 - 0.05;
    const legZ = bodyD / 2 - legW / 2 - 0.05;
    [[legX, legZ], [legX, -legZ], [-legX, legZ], [-legX, -legZ]].forEach(([x, z]) => {
        addBox(cow, legW, legH, legW, x, legH / 2, z, baseMaterial);
        addBox(cow, legW * 1.05, 0.15, legW * 1.05, x, 0.08, z, hoof);
    });

    // Head / 머리
    const headW = 0.9;
    const headH = 0.85;
    const headD = 0.85;
    const head = new THREE.Group();
    head.position.set(bodyW / 2 + headD / 2 - 0.1, bodyY + bodyH / 2 - 0.1, 0);
    cow.add(head);
    addBox(head, headD, headH, headW, 0, 0, 0, baseMaterial);

    // Muzzle, nostrils and eyes / 주둥이, 콧구멍, 눈
    addBox(head, 0.35, 0.4, headW * 0.9, headD / 2 + 0.15, -headH / 2 + 0.2, 0, nose);
    addBox(head, 0.36, 0.08, 0.12, headD / 2 + 0.16, -headH / 2 + 0.12, 0.18, eye);
    addBox(head, 0.36, 0.08, 0.12, headD / 2 + 0.16, -headH / 2 + 0.12, -0.18, eye);
    addBox(head, 0.08, 0.12, 0.08, headD / 2 - 0.08, headH / 2 - 0.25, headW / 2 + 0.02, eye);
    addBox(head, 0.08, 0.12, 0.08, headD / 2 - 0.08, headH / 2 - 0.25, -headW / 2 - 0.02, eye);

    // Ears / 귀
    addBox(head, 0.12, 0.3, 0.4, -0.05, headH / 2 - 0.1, headW / 2 + 0.15, baseMaterial);
    addBox(head, 0.12, 0.3, 0.4, -0.05, headH / 2 - 0.1, -headW / 2 - 0.15, baseMaterial);

    // Optional head spot and horns / 머리 얼룩과 뿔
    if (Math.random() < 0.5) {
        addBox(head, 0.4, 0.35, SPOT_THICKNESS, 0, headH / 2 - 0.3,
            headW / 2 + SPOT_OFFSET + SPOT_THICKNESS / 2, spotMaterial);
    }
    if (Math.random() < 0.5) {
        addBox(head, 0.1, 0.25, 0.1, -0.15, headH / 2 + 0.1, headW / 2 - 0.1, horn);
        addBox(head, 0.1, 0.25, 0.1, -0.15, headH / 2 + 0.1, -headW / 2 + 0.1, horn);
    }

    // Tail / 꼬리
    const tail = new THREE.Group();
    tail.position.set(-bodyW / 2 - 0.05, bodyY + bodyH / 2 - 0.15, 0);
    tail.rotation.z = 0.25;
    cow.add(tail);
    addBox(tail, 0.12, 0.6, 0.12, 0, -0.3, 0, baseMaterial);
    addBox(tail, 0.2, 0.15, 0.2, 0, -0.62, 0, spotMaterial);

    cow.scale.setScalar(0.9);
    return cow;
}
