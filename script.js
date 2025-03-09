const video = document.getElementById("video");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");

let faceDetected = false;
let faceTimer = null;

// 🚀 Запуск камеры
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        console.log("✅ The camera is running!");
    } catch (err) {
        console.error("❌ Error accessing camera:", err);
        alert("Ошибка: Access to camera denied!");
    }
}

document.addEventListener("DOMContentLoaded", startVideo);

// 🔍 Функция для анализа кадра (ищем лицо в центре)
function detectFace() {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (!videoWidth || !videoHeight) return; // Ждём, пока видео загрузится

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Получаем область в центре (где овал)
    const centerX = videoWidth / 2;
    const centerY = videoHeight / 2;
    const faceRegionSize = Math.min(videoWidth, videoHeight) * 0.5; // 50% экрана

    const faceData = ctx.getImageData(
        centerX - faceRegionSize / 2, 
        centerY - faceRegionSize / 2, 
        faceRegionSize, 
        faceRegionSize
    );

    // 🔎 Анализируем наличие "лица" по яркости и контрасту
    let sumBrightness = 0;
    let pixels = faceData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        let brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3; // Среднее по RGB
        sumBrightness += brightness;
    }

    let avgBrightness = sumBrightness / (pixels.length / 4);

    // 📌 Определяем, есть ли лицо (достаточная контрастность)
    if (avgBrightness > 50 && avgBrightness < 200) { 
        if (!faceDetected) {
            faceDetected = true;
            statusText.innerText = "Face detected! Keep it in frame for 5 seconds.";

            faceTimer = setTimeout(() => {
                statusText.innerText = "✅ Success!";
                setTimeout(() => window.close(), 2000);
            }, 5000);
        }
    } else {
        faceDetected = false;
        statusText.innerText = "Face not found!";
        clearTimeout(faceTimer);
    }
}

// 🕵‍♂ Постоянный анализ видео каждые 100 мс
vid
