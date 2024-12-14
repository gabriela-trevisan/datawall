const rootStyles = getComputedStyle(document.documentElement);
var audioArray = [];
let audioCanvas = null;
let audioCanvasCtx = null;

const windowData = [
    { title: "Janela 1", content: "Conteúdo da Janela 1" },
    { title: "Janela 2", content: "Conteúdo da Janela 2" },
    { title: "Janela 3", content: "Conteúdo da Janela 3" },
    { title: "Janela 4", content: "Conteúdo da Janela 4" }
];

window.onload = function () {
    // Get the audio canvas once the page has loaded
    audioCanvas = document.getElementById('AudioCanvas');
    // Setting internal canvas resolution to user screen resolution
    // (CSS canvas size differs from internal canvas size)
    audioCanvas.height = window.innerHeight;
    audioCanvas.width = window.innerWidth;
    // Get the 2D context of the canvas to draw on it in wallpaperAudioListener
    audioCanvasCtx = audioCanvas.getContext('2d');

    // Register the audio listener provided by Wallpaper Engine.
    window.wallpaperRegisterAudioListener(wallpaperAudioListener);

    // Exemplo: Dividindo em 4x4 áreas com bordas da cor primária
    drawGrid(4, 4);

     // Create the windows dynamically based on windowData array
     createWindows(windowData);
};

window.onresize = function () {
    audioCanvas.width = window.innerWidth;
    audioCanvas.height = window.innerHeight;
    drawGrid(4, 4); // Re-desenhar a grade ao redimensionar a janela
};

function wallpaperAudioListener(audioArray) {
    // Clear the canvas and set it to black
    audioCanvasCtx.fillStyle = getCSSPropertyValue('--background-color');
    audioCanvasCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

    // Render bars along the full width of the canvas
    var barWidth = Math.round(1.0 / 128.0 * audioCanvas.width);
    var halfCount = audioArray.length / 2;

    // Use the primary color for the left channel
    audioCanvasCtx.fillStyle = getCSSPropertyValue('--primary-color');
    // Iterate over the first 64 array elements (0 - 63) for the left channel audio data
    for (var i = 0; i < halfCount; ++i) {
        // Create an audio bar with its hight depending on the audio volume level of the current frequency
        var height = audioCanvas.height * Math.min(audioArray[i], 1);
        audioCanvasCtx.fillRect(barWidth * i, audioCanvas.height - height, barWidth, height);
    }

    // Now draw the right channel in blue
    audioCanvasCtx.fillStyle = getCSSPropertyValue('--secondary-color');
    // Iterate over the last 64 array elements (64 - 127) for the right channel audio data
    for (var i = halfCount; i < audioArray.length; ++i) {
        // Create an audio bar with its hight depending on the audio volume level
        // Using audioArray[191 - i] here to inverse the right channel for aesthetics
        var height = audioCanvas.height * Math.min(audioArray[191 - i], 1);
        audioCanvasCtx.fillRect(barWidth * i, audioCanvas.height - height, barWidth, height);
    }

    // Desenhar a grade após os gráficos de áudio
    drawGrid(3, 3); // Isso garante que a grade não será sobrescrita
}

function loop() {
    if (audioArray.length > 0) {
        audioArray.forEach((beat, i) => {
            if (i <= 2) {
                debug(beat, i);
            }
        });
    }
    requestAnimationFrame(loop);
}

function getCSSPropertyValue(name) {
    return rootStyles.getPropertyValue(name).trim();
}

function drawGrid(areasX, areasY) {
    const ctx = audioCanvasCtx;
    const areaWidth = audioCanvas.width / areasX;
    const areaHeight = audioCanvas.height / areasY;

    // Definir estilo das bordas
    ctx.strokeStyle = getCSSPropertyValue('--primary-color');
    ctx.lineWidth = 2;

    for (let x = 0; x < areasX; x++) {
        for (let y = 0; y < areasY; y++) {
            ctx.strokeRect(x * areaWidth, y * areaHeight, areaWidth, areaHeight);
        }
    }
}

function createWindows(windowsData) {
    const container = document.getElementById('windows-container');
    const areasX = 2; // For example, dividing into 2x2 grid
    const areasY = 2;

    const areaWidth = audioCanvas.width / areasX;
    const areaHeight = audioCanvas.height / areasY;

    windowsData.forEach((window, index) => {
        const winElement = document.createElement('div');
        winElement.classList.add('window');
        const x = (index % areasX) * areaWidth;
        const y = Math.floor(index / areasX) * areaHeight;
        winElement.style.left = `${x}px`;
        winElement.style.top = `${y}px`;

        const header = document.createElement('div');
        header.classList.add('header');
        header.innerHTML = `
            <span>${window.title}</span>
            <button class="close-btn" onclick="closeWindow(this)">X</button>
        `;

        const content = document.createElement('div');
        content.classList.add('content');
        content.innerHTML = window.content;

        winElement.appendChild(header);
        winElement.appendChild(content);
        container.appendChild(winElement);
    });
}

function closeWindow(button) {
    const windowElement = button.closest('.window');
    windowElement.remove();
}

// Exemplo: Inicia o loop de animação
// requestAnimationFrame(loop);
