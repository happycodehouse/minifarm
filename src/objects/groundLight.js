import * as THREE from 'three';


/* =========================================================
   GROUND LIGHT / 매립형 바닥 조명
========================================================= */

export function createGroundLight(scene, x = 8, z = 8) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);


    /* =========================================================
       LIGHT BEAM SETTINGS / 빛기둥 설정
    ========================================================= */

    const beamHeight = 4;
    const beamTopRadius = 3.5;
    const beamBottomRadius = 0.35;

    // Match the real spotlight angle with the visible beam.
    // 실제 스포트라이트 각도를 빛기둥 모양과 맞춥니다.
    const lightAngle = Math.atan(beamTopRadius / beamHeight);


    /* =========================================================
       FIXTURE BODY / 조명 본체
    ========================================================= */

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        metalness: 0.8,
        roughness: 0.35
    });

    const bodyGeometry = new THREE.CylinderGeometry(0.55, 0.65, 0.25, 24);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Partially bury the fixture in the ground.
    // 조명 본체 일부가 바닥에 묻히도록 배치합니다.
    body.position.y = 0.08;
    body.castShadow = true;
    body.receiveShadow = true;

    group.add(body);


    /* =========================================================
       LIGHT LENS / 조명 렌즈
    ========================================================= */

    const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        emissive: 0xffcc55,
        emissiveIntensity: 0,
        metalness: 0.1,
        roughness: 0.2
    });

    const lensGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24);
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);

    lens.position.y = 0.225;

    group.add(lens);


    /* =========================================================
       SPOTLIGHT / 실제 조명
    ========================================================= */

    const light = new THREE.SpotLight(
        0xffdd88,
        120,
        30,
        lightAngle,
        0.65,
        1.2
    );

    light.position.set(0, 0.28, 0);
    light.castShadow = true;

    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 30;


    // Aim the light upward.
    // 조명이 위쪽을 향하도록 타깃을 설정합니다.
    const target = new THREE.Object3D();
    target.position.set(0, beamHeight, 0);

    group.add(target);

    light.target = target;

    group.add(light);


    /* =========================================================
       SOFT VISIBLE BEAM / 부드러운 빛기둥
    ========================================================= */

    const beamGeometry = new THREE.CylinderGeometry(
        beamTopRadius,
        beamBottomRadius,
        beamHeight,
        32,
        12,
        true
    );

    // A custom shader makes the beam fade toward the top
    // and softens the visible outer edge.
    //
    // 커스텀 셰이더를 사용하여 위로 갈수록 투명하게 만들고
    // 빛기둥 외곽의 딱딱한 경계를 부드럽게 처리합니다.
    const beamMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,

        uniforms: {
            beamColor: {
                value: new THREE.Color(0xffd98a)
            },

            beamOpacity: {
                value: 0.045
            }
        },

        vertexShader: `
            varying float vHeight;
            varying vec3 vWorldNormal;
            varying vec3 vViewDirection;

            void main() {
                vHeight = uv.y;

                vec4 worldPosition =
                    modelMatrix *
                    vec4(position, 1.0);

                vWorldNormal =
                    normalize(
                        mat3(modelMatrix) *
                        normal
                    );

                vViewDirection =
                    normalize(
                        cameraPosition -
                        worldPosition.xyz
                    );

                gl_Position =
                    projectionMatrix *
                    viewMatrix *
                    worldPosition;
            }
        `,

        fragmentShader: `
            uniform vec3 beamColor;
            uniform float beamOpacity;

            varying float vHeight;
            varying vec3 vWorldNormal;
            varying vec3 vViewDirection;

            void main() {
                // Fade the beam toward the top.
                // 위로 갈수록 빛기둥이 흐려집니다.
                float heightFade =
                    1.0 -
                    smoothstep(
                        0.05,
                        1.0,
                        vHeight
                    );

                // Fade the hard silhouette at the outer edge.
                // 외곽의 딱딱한 경계를 흐리게 만듭니다.
                float viewAmount =
                    abs(
                        dot(
                            normalize(vWorldNormal),
                            normalize(vViewDirection)
                        )
                    );

                float edgeFade =
                    smoothstep(
                        0.0,
                        0.65,
                        viewAmount
                    );

                float alpha =
                    beamOpacity *
                    heightFade *
                    edgeFade;

                // Discard nearly invisible pixels.
                // 거의 보이지 않는 픽셀은 그리지 않습니다.
                if (alpha < 0.001) {
                    discard;
                }

                gl_FragColor = vec4(beamColor, alpha);
            }
        `
    });


    const beam = new THREE.Mesh(beamGeometry, beamMaterial);

    beam.position.y = 0.25 + beamHeight / 2;
    beam.visible = false;
    beam.renderOrder = 1;

    group.add(beam);


    /* =========================================================
       ADD TO SCENE / 장면에 추가
    ========================================================= */

    scene.add(group);


    /* =========================================================
       ON/OFF STATE / 켜기·끄기 상태
    ========================================================= */

    const state = {
        enabled: false
    };


    function setEnabled(enabled) {
        state.enabled = enabled;

        light.visible = enabled;
        beam.visible = enabled;

        lensMaterial.emissiveIntensity = enabled ? 3 : 0;
        lensMaterial.color.set(enabled ? 0xfff2bb : 0x555555);
    }


    // Start with the light turned off.
    // 처음에는 조명이 꺼진 상태로 시작합니다.
    setEnabled(false);


    /* =========================================================
       PUBLIC API / 외부 제공 기능
    ========================================================= */

    return {
        group,
        body,
        lens,
        light,
        beam,
        state,
        setEnabled
    };
}