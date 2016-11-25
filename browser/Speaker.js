(function(global, document) {
    Speaker.frameSize = 960;
    Speaker.sampleRate = 48000;
    Speaker.maxFrameSize = Speaker.sampleRate / 5; //* 2;
    Speaker.maxFrames = Speaker.maxFrameSize / Speaker.frameSize;

    global.Speaker = Speaker;

    function Speaker(user, audioCtx) {
        var element = new SpeakerElement(user);

        this.id = element.id;
        this.canvas = element.canvas;
        this.canvasCtx = this.canvas.getContext('2d');
        this.frames = 0;

        this.buffer = audioCtx.createBuffer(1, Speaker.maxFrameSize, Speaker.sampleRate);
        this.channel = this.buffer.getChannelData(0); //9600 Float32

        this.analyser = audioCtx.createAnalyser();
        //this.analyser.connect(audioCtx.destination);
        this.analyser.fftSize = 128;
        this.analyserLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.analyserLength);

        console.log(this.analyserLength);

        requestAnimationFrame(animateCanvas.bind(this));

        function animateCanvas() {
            this.analyser.getByteFrequencyData(this.dataArray);
            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            var barWidth = (this.canvas.width / this.analyserLength);
            var barHeight, x = 0, i = 0;

            for (i; i < this.analyserLength; i++) {
                barHeight = this.dataArray[i] >> 1;
                
                this.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ', 50, 50)';
                this.canvasCtx.fillRect(x, this.canvas.height - barHeight / 1.5, barWidth, barHeight);
                
                x += barWidth + 1;
            }
            requestAnimationFrame(animateCanvas.bind(this));
        }

        console.log('New user created: %s (%s)', user.username, user.id);
    }
})(window, document);