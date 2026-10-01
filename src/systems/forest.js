import * as THREE from 'three';
import {createTree} from '../objects/tree.js';

/* =========================================================
   FOREST SYSTEM / 숲 시스템
========================================================= */

export function createForestSystem({scene, params, groundSize = 100, reservedAreas = []}) {
    const group = new THREE.Group();
    group.name = 'Forest';
    scene.add(group);

    /* =========================================================
       MATERIALS / 재질
    ========================================================= */

    const defaultTrunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b4423,
        roughness: 1
    });
    const defaultLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d8a35,
        roughness: 1
    });

    /* =========================================================
       PLACEMENT SETTINGS / 배치 설정
    ========================================================= */

    const occupiedAreas = [];
    const TREE_RADIUS = 2.7;
    const MAX_ATTEMPTS = 300;
    let beforeRegenerate = null;

    /* =========================================================
       COLLISION CHECK / 충돌 검사
    ========================================================= */

    function overlapsAreas(x, z, areas) {
        return areas.some((area) => {
            const dx = x - area.x;
            const dz = z - area.z;
            const distance = TREE_RADIUS + area.radius;

            return dx * dx + dz * dz < distance * distance;
        });
    }

    /* =========================================================
       BEFORE REGENERATE / 재생성 전 처리
    ========================================================= */

    function setBeforeRegenerate(callback) {
        beforeRegenerate = callback;
    }

    /* =========================================================
       DISPOSE TREE / 나무 정리
    ========================================================= */

    function disposeTree(tree) {
        tree.userData.trunkMaterial?.dispose();
        tree.userData.leafMaterial?.dispose();
    }

    /* =========================================================
       CLEAR / 전체 제거
    ========================================================= */

    function clear() {
        group.children.forEach(disposeTree);
        group.clear();
        occupiedAreas.length = 0;
    }

    /* =========================================================
       REGENERATE / 다시 생성
    ========================================================= */

    function regenerate() {
        beforeRegenerate?.();
        clear();

        const limit = groundSize / 2 - TREE_RADIUS;
        let created = 0;
        let attempts = 0;

        while (created < params.treeCount && attempts < MAX_ATTEMPTS) {
            attempts++;

            const x = Math.round((Math.random() * 2 - 1) * limit);
            const z = Math.round((Math.random() * 2 - 1) * limit);

            // Avoid fixed objects and other trees.
            // 고정 오브젝트 및 다른 나무와 겹치지 않도록 합니다.
            if (
                overlapsAreas(x, z, reservedAreas) ||
                overlapsAreas(x, z, occupiedAreas)
            ) {
                continue;
            }

            const tree = createTree(x, z, defaultTrunkMaterial, defaultLeafMaterial);
            group.add(tree);
            occupiedAreas.push({x, z, radius: TREE_RADIUS, object: tree});
            created++;
        }

        if (created < params.treeCount) {
            console.warn(`Placed ${created} of ${params.treeCount} trees.`);
        }
    }

    /* =========================================================
       REMOVE TREE / 나무 제거
    ========================================================= */

    function remove(tree) {
        if (!tree || tree.parent !== group) {
            return;
        }

        const index = occupiedAreas.findIndex((area) => area.object === tree);
        if (index !== -1) {
            occupiedAreas.splice(index, 1);
        }

        group.remove(tree);
        disposeTree(tree);
    }

    /* =========================================================
       PUBLIC API / 외부 제공 기능
    ========================================================= */

    return {
        group,
        occupiedAreas,
        regenerate,
        clear,
        remove,
        setBeforeRegenerate,
        defaultTrunkMaterial,
        defaultLeafMaterial
    };
}