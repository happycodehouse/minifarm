/* =========================================================
   RESERVED AREA CHECK / 예약 영역 검사
========================================================= */

export function isInsideReservedArea(x, z, reservedAreas = []) {
    return reservedAreas.some((area) => {
        const dx = x - area.x;
        const dz = z - area.z;

        const distanceSquared = dx * dx + dz * dz;
        const radiusSquared = area.radius * area.radius;

        return distanceSquared < radiusSquared;
    });
}


/* =========================================================
   OBJECT DISTANCE CHECK / 오브젝트 간 거리 검사
========================================================= */

export function isTooClose(x, z, positions = [], minimumDistance) {
    const minimumDistanceSquared = minimumDistance * minimumDistance;

    return positions.some((position) => {
        const dx = x - position.x;
        const dz = z - position.z;

        return dx * dx + dz * dz < minimumDistanceSquared;
    });
}