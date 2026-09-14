import * as THREE from 'three';
import { createTree } from '../objects/tree.js';

export function createForestSystem({ scene, params, groundSize = 100 }) {
    const group = new THREE.Group();
    group.name = 'Forest';
    scene.add(group);

    const defaultTrunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 1 });
    const defaultLeafMaterial = new THREE.MeshStandardMaterial({ color: 0x2d8a35, roughness: 1 });
    const occupiedAreas = [];
    const TREE_RADIUS = 2.7;
    const MAX_ATTEMPTS = 300;
    let beforeRegenerate = null;

    function overlaps(x, z) {
        return occupiedAreas.some((area) => {
            const dx = x - area.x;
            const dz = z - area.z;
            const distance = TREE_RADIUS + area.radius;
            return dx * dx + dz * dz < distance * distance;
        });
    }

    function setBeforeRegenerate(callback) {
        beforeRegenerate = callback;
    }

    function disposeTree(tree) {
        tree.userData.trunkMaterial?.dispose();
        tree.userData.leafMaterial?.dispose();
    }

    function clear() {
        group.children.forEach(disposeTree);
        group.clear();
        occupiedAreas.length = 0;
    }

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
            if (overlaps(x, z)) continue;

            const tree = createTree(x, z, defaultTrunkMaterial, defaultLeafMaterial);
            group.add(tree);
            occupiedAreas.push({ x, z, radius: TREE_RADIUS, object: tree });
            created++;
        }

        if (created < params.treeCount) {
            console.warn(`Placed ${created} of ${params.treeCount} trees.`);
        }
    }

    function remove(tree) {
        if (!tree || tree.parent !== group) return;
        const index = occupiedAreas.findIndex((area) => area.object === tree);
        if (index !== -1) occupiedAreas.splice(index, 1);
        group.remove(tree);
        disposeTree(tree);
    }

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
