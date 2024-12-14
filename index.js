const rootStyles = getComputedStyle(document.documentElement);
var audioArray = [];
let audioCanvas = null;
let audioCanvasCtx = null;

const windowData = [
    { title: "AUDIO", content: "Conteúdo da Janela 1" },
    { title: "JANELA 382", content: "Conteúdo da Janela 2" },
    { title: "Janela", content: "Conteúdo da Janela 3" },
    { title: "Janela 382", content: "Conteúdo da Janela 4" },
    { title: "JANELA", content: "Conteúdo da Janela 1" },
    { title: "JANELA", content: "Conteúdo da Janela 1" },
    { title: "JANELA", content: "Conteúdo da Janela 1" },
    { title: "JANELA", content: "Conteúdo da Janela 1" },
    { title: "JANELA", content: "Conteúdo da Janela 1" },
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
    drawGrid(5, 5);

     // Create the windows dynamically based on windowData array
     createWindows(windowData, 3, 3);
};

// window.onresize = function () {
//     audioCanvas.width = window.innerWidth;
//     audioCanvas.height = window.innerHeight;
//     drawGrid(4, 4); // Re-desenhar a grade ao redimensionar a janela
//     createWindows(windowData, 3, 3); // Recriar as janelas ao redimensionar a janela
// };

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
    drawGrid(5, 5); // Isso garante que a grade não será sobrescrita
    // createGridFlexbox(4, 4);
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
    ctx.strokeStyle = getCSSPropertyValue('--text-color');
    ctx.lineWidth = 2;

    for (let x = 0; x < areasX; x++) {
        for (let y = 0; y < areasY; y++) {
            ctx.strokeRect(x * areaWidth, y * areaHeight, areaWidth, areaHeight);
        }
    }
}

function createGridFlexbox(areasX, areasY) {
    const container = document.getElementById('grid-container');
    container.style.setProperty('--cols', areasX);
    container.style.setProperty('--rows', areasY);
    container.innerHTML = ''; // Limpa as áreas anteriores

    for (let i = 0; i < areasX * areasY; i++) {
        const area = document.createElement('div');
        area.classList.add('grid-area');
        area.dataset.index = i; // Índice da área
        container.appendChild(area);
    }
}

function createWindows(windowsData, areasX, areasY) {
    const container = document.getElementById('windows-container');

    const areaWidth = audioCanvas.width / areasX;
    const areaHeight = audioCanvas.height / areasY;
    const spacing = parseInt(getCSSPropertyValue('--window-spacing'));

    windowsData.forEach((window, index) => {
        const winElement = document.createElement('div');
        winElement.classList.add('window');
        const x = (index % areasX) * (areaWidth + spacing);
        const y = Math.floor(index / areasX) * (areaHeight + spacing);
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
