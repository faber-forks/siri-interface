// Handle browser prefixes
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

// Setup test data
var fills = [
    'rgba(255, 255, 255, 1)',
    'rgba(254, 119, 132, 1)',
    'rgba(60, 128, 219, 1)',
    'rgba(127, 254, 146, 1)'
];

// Declare function vars
var init, drawWaves, getMicrophoneInput, processAudio;

// Declare canvas related vars
var canvas, canvasContext;

// Declare audio related vars
var audioContext, audioProcessor;

// Draw the waves
drawWaves = function() {
    var calculateX, calculateY, draw, generateRandomData;

    generateRandomData = function() {
        return [
            [1, 5, 10, 5, 1],
            [0, 0, Math.floor(Math.random() * 101), 0, Math.floor(Math.random() * 101), 0, Math.floor(Math.random() * 101), 0, Math.floor(Math.random() * 101), 0, 0],
            [0, 0, Math.floor(Math.random() * 101), 0, Math.floor(Math.random() * 101), 0, Math.floor(Math.random() * 101), 0, 0],
            [0, 0, Math.floor(Math.random() * 101), 0, Math.floor(Math.random() * 101), 0, 0]
        ];
    };

    calculateX = function(i, length) {
        return ((canvas.width / length) * (i + 0.5))
    };

    calculateY = function(data, reverse) {
        if (!reverse) {
            return (canvas.height / 2) - ((canvas.height / 2) / (100 / (data * (audioProcessor.volume * 3))));
        } else {
            return (canvas.height / 2) + ((canvas.height / 2) / (100 / (data * (audioProcessor.volume * 3))));
        }
    };

    draw = function(data, reverse) {
        var i = 0;
        for (; i < data.length; i++) {
            var x = calculateX(i, data.length),
                y = calculateY(data[i], reverse);

            if (i < (data.length - 1)) {
                var x2 = (calculateX(i, data.length) + calculateX(i + 1, data.length)) / 2,
                    y2 = (calculateY(data[i], reverse) + calculateY(data[i + 1], reverse)) / 2;

                canvasContext.quadraticCurveTo(x, y, x2, y2);
            }
        }

        canvasContext.lineTo(canvas.width, (canvas.height / 2));
        canvasContext.lineTo(0, (canvas.height / 2));
    };

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    var i = 0;
    var data = generateRandomData();
    for (; i < data.length; i++) {
        canvasContext.fillStyle = fills[i];
        canvasContext.beginPath();

        draw(data[i]);
        draw(data[i], true);

        canvasContext.fill();
    }

    window.setTimeout(drawWaves, 100);
    // window.requestAnimationFrame(drawWaves);
};

// Request access to the micropone
getMicrophoneInput = function() {
    navigator.getUserMedia({
        audio: true
    }, function(stream) {
        processAudio(stream);
        drawWaves();
    }, function(e) {
        console.error('Oops, something went wrong while accessing your microphone: %s', e);
    });
};

// Process the audio we get from the microphone
processAudio = function(stream) {
    var processVolume = function(e) {
        var buffer = e.inputBuffer.getChannelData(0),
            bufferLength = buffer.length,
            total = 0,
            volume = 0,
            i = 0,
            rms;

        for (; i < bufferLength; i++) {
            var currentSample = buffer[i];
                total += currentSample * currentSample;
        }

        rms = Math.sqrt(total / bufferLength);

        this.volume = volume = Math.max(rms, volume);
    };

    audioContext = new window.AudioContext();
    audioSource = audioContext.createMediaStreamSource(stream);
    audioProcessor = audioContext.createScriptProcessor(256);

    audioSource.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    audioProcessor.onaudioprocess = processVolume;
};

// Initialise
init = !function() {
    // Basic setup of the canvas
    canvas = document.querySelector('.wave');
    canvasContext = canvas.getContext('2d');
    canvasContext.globalCompositeOperation = 'overlay';

    getMicrophoneInput();
}();
