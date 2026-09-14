import * as THREE from 'three';
import { createCow } from '../objects/cow.js';

export function createFarmSystem({ scene, params, forest, groundSize = 100 }) {
    const group = new THREE.Group();
    group.name = 'Farm';
    scene.add(group);

    const materials = {
        white: new THREE.MeshStandardMaterial({ color: 0xf5f2e9, roughness: 0.9 }),
        brown: new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.9 }),
        spot: new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.9 }),
        nose: new THREE.MeshStandardMaterial({ color: 0xd98ea0, roughness: 0.9 }),
        horn: new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 }),
        hoof: new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.9 }),
        eye: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 })
    };

    const cows = [];
    const occupiedAreas = [];
    const COW_RADIUS = 1.8;
    const OBJECT_MARGIN = 0.5;
    const MAX_ATTEMPTS = 500;

    function overlaps(x, z, areas) {
        return areas.some((area) => {
            const dx = x - area.x;
            const dz = z - area.z;
            const distance = COW_RADIUS + area.radius + OBJECT_MARGIN;
            return dx * dx + dz * dz < distance * distance;
        });
    }

    function disposeCow(cow) {
        cow.userData.baseMaterial?.dispose();
        cow.userData.spotMaterial?.dispose();
    }

    function clear() {
        group.children.forEach(disposeCow);
        group.clear();
        cows.length = 0;
        occupiedAreas.length = 0;
    }

    function regenerate() {
        clear();
        const limit = groundSize / 2 - COW_RADIUS;
        let created = 0;
        let attempts = 0;

        while (created < params.cowCount && attempts < MAX_ATTEMPTS) {
            attempts++;
            const x = (Math.random() * 2 - 1) * limit;
            const z = (Math.random() * 2 - 1) * limit;
            if (overlaps(x, z, forest.occupiedAreas) || overlaps(x, z, occupiedAreas)) continue;

            const cow = createCow(materials);
            cow.position.set(x, 0, z);
            cow.rotation.y = Math.random() * Math.PI * 2;
            group.add(cow);
            cows.push(cow);
            occupiedAreas.push({ x, z, radius: COW_RADIUS, object: cow });
            created++;
        }

        if (created < params.cowCount) {
            console.warn(`Placed ${created} of ${params.cowCount} cows.`);
        }
    }

    function remove(cow) {
        if (!cow || cow.parent !== group) return;
        group.remove(cow);
        const cowIndex = cows.indexOf(cow);
        if (cowIndex !== -1) cows.splice(cowIndex, 1);
        const areaIndex = occupiedAreas.findIndex((area) => area.object === cow);
        if (areaIndex !== -1) occupiedAreas.splice(areaIndex, 1);
        disposeCow(cow);
    }

    // Move a cow only when its destination is free.
    // 목적지가 비어 있을 때만 소를 이동합니다.
    function move(cow, x, z) {
        if (!cow || cow.parent !== group) {
            return false;
        }

        if (!Number.isFinite(x) || !Number.isFinite(z)) {
            return false;
        }

        // Keep the cow inside the ground.
        // 소가 바닥 밖으로 나가지 않도록 제한합니다.
        const limit = groundSize / 2 - COW_RADIUS;

        if (Math.abs(x) > limit || Math.abs(z) > limit) {
            return false;
        }

        // Exclude the selected cow from collision checks.
        // 이동할 소 자신은 충돌 검사에서 제외합니다.
        const otherCowAreas = occupiedAreas.filter(
            (area) => area.object !== cow
        );

        if (
            overlaps(x, z, forest.occupiedAreas) ||
            overlaps(x, z, otherCowAreas)
        ) {
            return false;
        }

        cow.position.set(x, 0, z);

        // Update the stored collision position too.
        // 충돌 검사에 사용하는 좌표도 함께 갱신합니다.
        const area = occupiedAreas.find(
            (area) => area.object === cow
        );

        if (area) {
            area.x = x;
            area.z = z;
        }

        return true;
    }

    return { group, cows, occupiedAreas, materials, regenerate, clear, remove, move };
}
