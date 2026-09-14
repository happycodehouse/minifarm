import * as THREE from 'three';


/* =========================================================
   SUN AND MOON CREATION / 해와 달 생성
========================================================= */

export function createSunMoon(scene) {

    /* =========================================================
       SUN / 해
    ========================================================= */

    // MeshBasicMaterial is not affected by scene lighting,
    // so the sun always appears bright.
    //
    // MeshBasicMaterial은 장면 조명의 영향을 받지 않으므로
    // 해가 항상 밝게 표시됩니다.
    const sunMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffee88
        });

    const sun =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                3,
                24,
                24
            ),
            sunMaterial
        );

    scene.add(sun);


    /* =========================================================
       MOON / 달
    ========================================================= */

    const moonMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xdde4f0
        });

    const moon =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.2,
                24,
                24
            ),
            moonMaterial
        );

    scene.add(moon);


    /* =========================================================
       PUBLIC API / 외부 제공 기능
    ========================================================= */

    return {
        sun,
        moon
    };
}