import * as THREE from 'three';


/* =========================================================
   DAY AND NIGHT SYSTEM / 낮과 밤 시스템
========================================================= */

export function createDayNightSystem({
                                         scene,
                                         params,
                                         celestial,
                                         directionalLight,
                                         hemisphereLight,
                                         grid,
                                         sunDistance = 35
                                     }) {
    const {
        sun,
        moon
    } = celestial;


    /* =========================================================
       COLORS / 색상
    ========================================================= */

// Sky colors / 하늘 색상
    const skyDay =
        new THREE.Color(0x87cefa);

    const skySunset =
        new THREE.Color(0xff9eb5);

    const skyNight =
        new THREE.Color(0x182b50);


// Light and sun colors / 조명과 태양 색상
    const sunDay =
        new THREE.Color(0xfff8ee);

    const sunSunset =
        new THREE.Color(0xffb08c);

    const sunBright =
        new THREE.Color(0xffedaa);


    // Reuse one Color instance to avoid creating a new object
    // whenever the time is updated.
    //
    // 시간이 갱신될 때마다 새 객체를 만들지 않도록
    // 하나의 Color 인스턴스를 재사용합니다.
    const currentSky =
        new THREE.Color();


    /* =========================================================
       UPDATE TIME OF DAY / 시간대 갱신
    ========================================================= */

    function update() {

        // 06:00 = sunrise
        // 12:00 = noon
        // 18:00 = sunset
        //
        // 06:00 = 일출
        // 12:00 = 정오
        // 18:00 = 일몰
        const angle =
            (
                (params.hour - 6) /
                24
            ) *
            Math.PI *
            2;


        const sunX =
            Math.cos(angle) *
            sunDistance;

        const sunY =
            Math.sin(angle) *
            sunDistance;

        const sunZ =
            sunDistance * 0.3;


        /* =====================================================
           CELESTIAL POSITIONS / 천체 위치
        ===================================================== */

        sun.position.set(
            sunX,
            sunY,
            sunZ
        );

        // Place the moon opposite the sun.
        // 달은 해의 정반대 위치에 배치합니다.
        moon.position.set(
            -sunX,
            -sunY,
            -sunZ
        );


        // Convert sun height into a value between 0 and 1.
        // 태양 높이를 0~1 범위의 값으로 변환합니다.
        const height =
            Math.max(
                0,
                Math.sin(angle)
            );


        /* =====================================================
           SKY / 하늘
        ===================================================== */

        if (height < 0.25) {
            // Night → sunset
            // 밤 → 노을
            currentSky
                .copy(skyNight)
                .lerp(
                    skySunset,
                    height / 0.25
                );
        } else {
            // Sunset → daytime
            // 노을 → 낮
            currentSky
                .copy(skySunset)
                .lerp(
                    skyDay,
                    (height - 0.25) / 0.75
                );
        }

        scene.background.copy(
            currentSky
        );


        /* =====================================================
           DAYLIGHT / 낮 조명
        ===================================================== */

        if (sunY > 0) {
            // Move the directional light to the sun.
            // 방향광을 해의 위치로 이동합니다.
            directionalLight.position.set(
                sunX,
                sunY,
                sunZ
            );


            // Use warm light around sunrise and sunset,
            // and white light around noon.
            //
            // 일출과 일몰에는 따뜻한 빛을 사용하고
            // 정오에는 흰색에 가까운 빛을 사용합니다.
            directionalLight.color
                .copy(sunSunset)
                .lerp(
                    sunDay,
                    Math.min(
                        1,
                        height / 0.35
                    )
                );

            directionalLight.intensity =
                0.2 +
                height * 1.1;


            sun.material.color
                .copy(sunSunset)
                .lerp(
                    sunBright,
                    Math.min(
                        1,
                        height / 0.35
                    )
                );


            hemisphereLight.color.set(
                0x87ceeb
            );

            hemisphereLight.groundColor.set(
                0x4caf50
            );

            hemisphereLight.intensity =
                0.4 +
                height * 0.5;
        }


        /* =====================================================
           MOONLIGHT / 밤 조명
        ===================================================== */

        else {
            // Reuse the directional light as moonlight.
            // 방향광을 달빛으로 재사용합니다.
            directionalLight.position.set(
                -sunX,
                -sunY,
                -sunZ
            );

            directionalLight.color.set(
                0xaabbee
            );

            // Maintain minimum brightness so objects remain visible.
            // 사물이 보이도록 최소 밝기를 유지합니다.
            directionalLight.intensity = 0.5;


            hemisphereLight.color.set(
                0x1a2340
            );

            hemisphereLight.groundColor.set(
                0x0d1a12
            );

            hemisphereLight.intensity = 0.45;
        }


        /* =====================================================
           VISIBILITY / 표시 여부
        ===================================================== */

        // Hide celestial objects below the horizon.
        // 지평선 아래로 내려간 천체는 숨깁니다.
        sun.visible =
            sunY > -5;

        moon.visible =
            -sunY > -5;


        /* =====================================================
           GRID / 그리드
        ===================================================== */

        // Make the grid darker at night.
        // 밤에는 그리드를 더 흐리게 표시합니다.
        grid.material.opacity =
            0.1 +
            height * 0.35;
    }


    /* =========================================================
       AUTO PLAY / 시간 자동 재생
    ========================================================= */

    function updateAuto(
        hourIncrement = 0.02
    ) {
        if (!params.auto) {
            return false;
        }

        params.hour =
            (
                params.hour +
                hourIncrement
            ) %
            24;

        update();

        return true;
    }


    /* =========================================================
       PUBLIC API / 외부 제공 기능
    ========================================================= */

    return {
        update,
        updateAuto
    };
}