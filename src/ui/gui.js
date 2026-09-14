import * as THREE from 'three';
import GUI from 'lil-gui';

export function createGUI({
                              scene,
                              camera,
                              renderer,
                              controls,
                              params,
                              grid,
                              forest,
                              farm,
                              dayNight,
                              lightHelper,
                              groundLight
                          }) {
    const gui = new GUI();
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    let pointerDownPosition = null;
    let selectedObject = null;
    let selectedFolder = null;
    let selectionOutline = null;

    function clearSelection() {
        if (selectionOutline) {
            scene.remove(selectionOutline);
            selectionOutline.geometry.dispose();
            selectionOutline.material.dispose();
            selectionOutline = null;
        }
        selectedFolder?.destroy();
        selectedFolder = null;
        selectedObject = null;
    }

    function createOutline(object) {
        selectionOutline = new THREE.BoxHelper(object, 0xffdd00);
        scene.add(selectionOutline);
    }

    function selectTree(tree) {
        if (selectedObject === tree) return;
        clearSelection();
        selectedObject = tree;
        createOutline(tree);

        selectedFolder = gui.addFolder('Selected Tree');
        selectedFolder.addColor(tree.userData.leafMaterial, 'color').name('Leaf Color');
        selectedFolder.addColor(tree.userData.trunkMaterial, 'color').name('Trunk Color');
        selectedFolder.add({
            remove: () => {
                const target = selectedObject;
                clearSelection();
                forest.remove(target);
            },
        }, 'remove').name('Delete Tree');
        selectedFolder.add({deselect: clearSelection}, 'deselect').name('Deselect');
        selectedFolder.open();
    }

    function selectCow(cow) {
        if (selectedObject === cow) return;
        clearSelection();
        selectedObject = cow;
        createOutline(cow);

        selectedFolder = gui.addFolder('Selected Cow');
        selectedFolder.addColor(cow.userData.baseMaterial, 'color').name('Body Color');
        selectedFolder.addColor(cow.userData.spotMaterial, 'color').name('Spot Color');
        selectedFolder.add({
            remove: () => {
                const target = selectedObject;
                clearSelection();
                farm.remove(target);
            },
        }, 'remove').name('Delete Cow');
        selectedFolder.add({deselect: clearSelection}, 'deselect').name('Deselect');
        selectedFolder.open();
    }

    forest.setBeforeRegenerate(clearSelection);

    function regenerateWorldObjects() {
        clearSelection();
        forest.regenerate();
        farm.regenerate();
    }

    /* ---------- Trees ---------- */
    const treeFolder = gui.addFolder('Trees');
    treeFolder.add(params, 'treeCount', 0, 15, 1).name('Count').onFinishChange(regenerateWorldObjects);
    treeFolder.addColor(forest.defaultLeafMaterial, 'color').name('Default Leaf Color');
    treeFolder.addColor(forest.defaultTrunkMaterial, 'color').name('Default Trunk Color');
    treeFolder.add({regenerate: regenerateWorldObjects}, 'regenerate').name('Regenerate');
    treeFolder.add({
        hint: () => {
        }
    }, 'hint').name('💡 Click a tree to edit').disable();

    /* ---------- Cows ---------- */
    const cowFolder = gui.addFolder('Cows');
    cowFolder.add(params, 'cowCount', 0, 15, 1).name('Count').onFinishChange(() => {
        clearSelection();
        farm.regenerate();
    });
    cowFolder.add({
        regenerate: () => {
            clearSelection();
            farm.regenerate();
        },
    }, 'regenerate').name('Regenerate');
    cowFolder.add({
        hint: () => {
        }
    }, 'hint').name('💡 Click a cow to edit').disable();

    /* ---------- Time ---------- */
    const timeFolder = gui.addFolder('Time');

    const hourController = timeFolder
        .add(params, 'hour', 0, 24, 0.1)
        .name('Hour')
        .onChange(dayNight.update);

    const autoController = timeFolder
        .add(params, 'auto')
        .name('Auto Play');

    function applyCurrentTime() {
        const now = new Date();
        const currentHour =
            now.getHours() +
            now.getMinutes() / 60 +
            now.getSeconds() / 3600;
        params.hour = Math.round(currentHour * 10) / 10;

        // Stop simulated time playback.
        // 가상 시간 자동 재생을 중지합니다.
        params.auto = false;

        dayNight.update();

        // Synchronize both GUI controls.
        // 시간과 자동 재생 GUI를 현재 값과 동기화합니다.
        hourController.updateDisplay();
        autoController.updateDisplay();
    }

    timeFolder.add({useCurrentTime: applyCurrentTime}, 'useCurrentTime').name('Use Current Time');
    timeFolder.open();

    /* ---------- Lighting ---------- */
    const lightingFolder =
        gui.addFolder('Lighting');

    lightingFolder
        .add(
            lightHelper,
            'visible'
        )
        .name('Sun/Moon Light Guide');

    lightingFolder
        .add(
            groundLight.state,
            'enabled'
        )
        .name('Ground Light')
        .onChange(
            groundLight.setEnabled
        );

    /* ---------- View ---------- */
    const viewFolder = gui.addFolder('View');
    viewFolder.add(grid, 'visible').name('Grid');
    viewFolder.add(controls, 'autoRotate').name('Auto Rotate');
    viewFolder.add(controls, 'enablePan').name('Enable Pan');

    /* ---------- Pointer selection (click vs. drag) ---------- */
    function handlePointerDown(event) {
        pointerDownPosition = {x: event.clientX, y: event.clientY};
    }

    function handlePointerUp(event) {
        if (!pointerDownPosition) return;

        const moved = Math.hypot(
            event.clientX - pointerDownPosition.x,
            event.clientY - pointerDownPosition.y
        );
        pointerDownPosition = null;
        if (moved > 5) return;

        const rect = renderer.domElement.getBoundingClientRect();
        pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);

        const roots = [...forest.group.children, ...farm.group.children];
        const intersections = raycaster.intersectObjects(roots, true);
        if (intersections.length === 0) {
            clearSelection();
            return;
        }

        let object = intersections[0].object;
        while (object.parent && object.parent !== forest.group && object.parent !== farm.group) {
            object = object.parent;
        }

        if (object.parent === forest.group) selectTree(object);
        else if (object.parent === farm.group) selectCow(object);
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    function destroy() {
        clearSelection();
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('pointerup', handlePointerUp);
        gui.destroy();
    }

    return {
        instance: gui,
        updateHourDisplay: () => hourController.updateDisplay(),
        clearSelection,
        destroy,
    };
}