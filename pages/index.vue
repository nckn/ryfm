<template lang="pug">
  .outer-container
    .button-container
      .seq-button.button.hihat
        p hihat
      .seq-button.button.snare
        p snare
      .seq-button.button.kick
        p kick
    .synth-container
    .main-content-container
    .controlpanel.one
      .control-section.soundtweak
        p Kick
        input.synth-slider(name='kick', type='range', min='30', max='500', step='1', value='50')
        // <p class="synth-output">60 bpm</p>
      .control-section.soundtweak
        p Snare
        input.synth-slider(name='snare', type='range', min='100', max='4096', step='1', value='4096')
        // <p class="synth-output">60 bpm</p>
      .control-section.soundtweak
        p Hihat
        input.synth-slider(name='hihat', type='range', min='20', max='200', step='1', value='40')
        // <p class="synth-output">60 bpm</p>
      .control-section.soundtweak
        p Filter
        input.synth-slider(name='filter', type='range', min='20', max='5000', step='1', value='2500')
        // <p class="synth-output">60 bpm</p>
    .controlpanel.two
      .control-section.tempo
        p Tempo
        input.tempo-slider(type='range', min='0', max='1000', step='1', value='60')
        p.tempo-output 60 bpm
      .control-section.play-toggle
        .play-button
          .play-icon.stop
      .control-section.reverb
        p Reverb
        input.reverb-slider(type='range', value='0', step='1', min='0', max='100')
        p.reverb-output 0 % wet
      .control-section.delay
        p Delay
        .effect-icon.delay-icon
        input.delay-slider(type='range', min='0', max='4.9', step='0.001', value='0')
        output.delay-output
        .effect-icon.delay-feedback
        input.feedback-slider(type='range', min='0', max='0.9', step='0.01', value='0')
        output.feedback-output
  // end of outer-container
</template>

<script>
export default {
  name: 'Ryfm',
  data () {
    return {
      isTouch: null,
      request: null
    }
  },
  mounted() {
    var self = this
    self.isTouch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    // console.log(self.isTouch)
    self.setupAudioContext()
  },
  methods: {
    performAnimation: function() {
      var self = this
      self.request = requestAnimationFrame(self.performAnimation)
      // console.log(typeof self.request)
      //animate something
    },
    setupAudioContext: function() {
      var self = this
      self.audioContext = new AudioContext()
      self.mixGain = self.audioContext.createGain()
      self.filterGain = self.audioContext.createGain()
      self.mixButton = document.querySelector('#mixButton')
      self.trackFilter = self.audioContext.createBiquadFilter()
      self.convolver = self.audioContext.createConvolver()
      self.dry = self.audioContext.createGain()
      self.wet = self.audioContext.createGain()
      self.delay = self.audioContext.createDelay()
      self.feedbackGain = self.audioContext.createGain()
      console.log(self)
      self.listenForKeys()
      // requestAnimationFrame(self.performAnimation)
      // cancelAnimationFrame(request) //stop the animation
    },
    playSound: function (key) {
      var self = this
      var kickValue = {
        one: 0.25,
        two: 50,
      }
      console.log('check')
      if (key == '65') {
        this.oscs = new Array(2);
        this.gains = new Array(2);
        for (var i = 0; i < this.oscs.length; i++) {
          this.oscs[i] = self.audioContext.createOscillator();
          this.oscs[i].type = i == 0 ? "triangle" : "sine";
          this.gains[i] = self.audioContext.createGain();
          this.gains[i].gain.setValueAtTime(1, self.audioContext.currentTime);
          this.gains[i].gain.exponentialRampToValueAtTime(0.001, self.audioContext.currentTime + kickValue.one);
          this.oscs[i].frequency.setValueAtTime((i == 0 ? 120 : kickValue.two), self.audioContext.currentTime);
          this.oscs[i].frequency.exponentialRampToValueAtTime(0.001, self.audioContext.currentTime + kickValue.one);  
          this.oscs[i].connect(this.gains[i]);
          this.gains[i].connect(self.mixGain);
          this.gains[i].connect(self.audioContext.destination);
          this.oscs[i].start(self.audioContext.currentTime);
          this.oscs[i].stop(self.audioContext.currentTime + 0.5);
        }
        self.mixGain.gain.value = 1;
      }
    },
    listenForKeys: function() {
      // Keystrokes
      var self = this
      document.addEventListener("keydown", function(event) {
        if (event.which == '65') {
          self.playSound(event.which)
        }
        // if (event.which == '83')
        //   snare();
        // if (event.which == '72')
        //   hihat();
      })
    }
  }
}
</script>