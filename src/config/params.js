/* =========================================================
   CURRENT TIME / 현재 시간
========================================================= */

function getCurrentHour() {
    const now =
        new Date();

    return (
        now.getHours() +
        now.getMinutes() / 60 +
        now.getSeconds() / 3600
    );
}


/* =========================================================
   APPLICATION PARAMETERS / 애플리케이션 설정값
========================================================= */

export const params = {
    treeCount: 10,
    cowCount: 6,

    // Use the browser's current local time.
    // 브라우저가 실행되는 지역의 현재 시간을 사용합니다.
    hour: getCurrentHour(),

    auto: false
};