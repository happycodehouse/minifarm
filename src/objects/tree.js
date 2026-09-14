import * as THREE from 'three';


/* =========================================================
   SHARED GEOMETRY / 공용 지오메트리
========================================================= */

// Every tree block shares the same geometry.
// 모든 나무 블록은 하나의 지오메트리를 공유합니다.
const blockGeometry =
    new THREE.BoxGeometry(1, 1, 1);


/* =========================================================
   TREE CREATION / 나무 생성
========================================================= */

export function createTree(
    x,
    z,
    defaultTrunkMaterial,
    defaultLeafMaterial
) {
    const tree =
        new THREE.Group();


    // Clone the materials so each tree can have different colors.
    // 각 나무의 색상을 개별적으로 변경할 수 있도록 재질을 복제합니다.
    const trunkMaterial =
        defaultTrunkMaterial.clone();

    const leafMaterial =
        defaultLeafMaterial.clone();


    // Store materials for tree selection and GUI editing.
    // 나무 선택 및 GUI 색상 편집을 위해 재질을 저장합니다.
    tree.userData.trunkMaterial =
        trunkMaterial;

    tree.userData.leafMaterial =
        leafMaterial;


    /* =========================================================
       BLOCK HELPER / 블록 생성 도우미
    ========================================================= */

    function addTreeBlock(
        blockX,
        blockY,
        blockZ,
        material
    ) {
        const block =
            new THREE.Mesh(
                blockGeometry,
                material
            );

        // A cube's origin is its center, so raise it by 0.5.
        // 큐브의 원점은 중심이므로 바닥에 맞게 0.5만큼 올립니다.
        block.position.set(
            blockX,
            blockY + 0.5,
            blockZ
        );

        block.castShadow = true;
        block.receiveShadow = true;

        tree.add(block);

        return block;
    }


    /* =========================================================
       TRUNK / 줄기
    ========================================================= */

    // Random trunk height between 4 and 6 blocks.
    // 줄기 높이를 4~6블록 사이에서 무작위로 결정합니다.
    const trunkHeight =
        4 +
        Math.floor(
            Math.random() * 3
        );

    for (
        let y = 0;
        y < trunkHeight;
        y++
    ) {
        addTreeBlock(
            0,
            y,
            0,
            trunkMaterial
        );
    }


    /* =========================================================
       LOWER LEAVES / 아래쪽 잎
    ========================================================= */

    // Create two 5×5 leaf layers.
    // 5×5 크기의 잎 층을 두 개 생성합니다.
    for (
        let y = trunkHeight - 2;
        y < trunkHeight;
        y++
    ) {
        for (
            let dx = -2;
            dx <= 2;
            dx++
        ) {
            for (
                let dz = -2;
                dz <= 2;
                dz++
            ) {
                // Keep the trunk position empty.
                // 줄기가 지나가는 중앙 위치는 비워둡니다.
                if (
                    dx === 0 &&
                    dz === 0
                ) {
                    continue;
                }


                // Randomly remove corner leaves.
                // 자연스러운 형태를 위해 모서리 잎을 무작위로 제거합니다.
                const isCorner =
                    Math.abs(dx) === 2 &&
                    Math.abs(dz) === 2;

                if (
                    isCorner &&
                    Math.random() < 0.7
                ) {
                    continue;
                }


                addTreeBlock(
                    dx,
                    y,
                    dz,
                    leafMaterial
                );
            }
        }
    }


    /* =========================================================
       MIDDLE LEAVES / 중간 잎
    ========================================================= */

    // Create a 3×3 leaf layer.
    // 3×3 크기의 잎 층을 생성합니다.
    for (
        let dx = -1;
        dx <= 1;
        dx++
    ) {
        for (
            let dz = -1;
            dz <= 1;
            dz++
        ) {
            addTreeBlock(
                dx,
                trunkHeight,
                dz,
                leafMaterial
            );
        }
    }


    /* =========================================================
       TREE TOP / 나무 꼭대기
    ========================================================= */

    // Create a cross-shaped top layer.
    // 십자 모양의 꼭대기 잎을 생성합니다.
    const topLeafPositions = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];

    topLeafPositions.forEach(
        ([dx, dz]) => {
            addTreeBlock(
                dx,
                trunkHeight + 1,
                dz,
                leafMaterial
            );
        }
    );


    /* =========================================================
       TREE POSITION / 나무 위치
    ========================================================= */

    tree.position.set(
        x,
        0,
        z
    );

    return tree;
}