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
      div.cell-row(v-for="(drum, index) in drums")
        Cell(v-for="(cell, index) in sequenceCells[index]" :class_name="'sixteen-buttons'" v-bind:id="index" :key="index")
    .controlpanel.one
      //- Slider(:slider_name="'Kick'")
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
      .control-section.play-toggle(@click="togglePlay")
        .play-button
          .play-icon.stop(ref="play_icon")
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

import Cell from '../components/gui/Cell'
import Slider from '../components/gui/Slider'

export default {
  name: 'Ryfm',
  components: {
    Cell,
    Slider
  },
  data () {
  return {
    isTouch: null,
    request: null,
    bufferValue: 4096,
    isPlaying: false,
    currentTime: 0,
    previousTime: 0,
    inc: 0,
    sequences: [],
    drums: [
      {name: 'hihat'},
      {name: 'snare'},
      {name: 'kick'}
    ],
    sequenceCells: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  }
  },
  mounted() {
    var self = this
    self.isTouch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    // console.log(self.isTouch)
    self.playIcon = self.$refs.play_icon
    self.setupAudioContext()
  },
  created() {
    this.setupButtons('sixteen-buttons', 16)
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
    self.mixGain.connect(self.audioContext.destination);
    console.log(self)
    self.listenForKeys()
    // requestAnimationFrame(self.performAnimation)
    // cancelAnimationFrame(request) //stop the animation
  },
  togglePlay: function(e) {    
    var self = this
    var target = e.target || e.scrElement
    if (self.playIcon.classList.contains('play')) {
      self.playIcon.classList.remove('play');
      self.playIcon.classList.add('stop');
      self.isPlaying = false;
      self.currentTime = 0;
      self.previousTime = 0;
    } else {
      self.playIcon.classList.remove('stop');
      self.playIcon.classList.add('play');
      self.isPlaying = true;
      // self.playSequence();
    }
  },
  playSequence: function() {
    var self = this
    if (isPlaying)
    // requestAnimFrame(playSequence);
    requestAnimationFrame(self.performAnimation)
    if ((currentTime - previousTime) > interval) {
    // console.log(currentTime + " - " + previousTime + " > " + interval);
    previousTime = currentTime;
    if (sequences[seqIndex][0][inc] == 1) { hihat(); }
    if (sequences[seqIndex][1][inc] == 1) { snare(); }
    if (sequences[seqIndex][2][inc] == 1) { kick(); }
    inc++;
    if (inc > incMax)
      inc = 0; 
    for (var i = 1; i < setup.buttons.length+1; i++) {
      if (i == inc || i == inc+16 || i == inc+32) {
      setup.buttons[i-1].classList.add('playing-now');
      }
      else {
      setup.buttons[i-1].classList.remove('playing-now');
      }
    }
    }
    currentTime++;
  },
  setupButtons: function(seqClass, steps) {
    var self = this
    var index = 0;
    this.steps = steps;
    for (var y = 1; y <= 3; y++) {
      for (var x = 1; x <= this.steps; x++) {
        var btnObj = new Object();
        btnObj.name = x + ', ' + y;
        var localCallback = function(e) {
        var target = e.target || e.srcElement;
        var input = target.id;
        if (input >= 0 && input <= 15) { // 0 - 7
          sequences[ seqIndex ][ 0 ][ input ] = (sequences[ seqIndex ][ 0 ][ input ] == 0) ? 1 : 0;
        }
        if (input >= 16 && input < 31) { // 8 - 16
          sequences[ seqIndex ][ 1 ][ input-16 ] = (sequences[ seqIndex ][ 1 ][ input-16 ] == 0) ? 1 : 0; // input-8
        }
        if (input >= 32 && input < 48) { // 16 - 24
          sequences[ seqIndex ][ 2 ][ input-32 ] = (sequences[ seqIndex ][ 2 ][ input-32 ] == 0) ? 1 : 0; // input-16
        }
        // var newElement = document.createElement("div");
        // newElement.className = "fill";
        // target.appendChild(newElement);
        if (target.classList.contains('assigned'))
          target.classList.remove("assigned");
        else
          target.classList.add("assigned");
        }
        // var btn = self.document.createElement('div');
        // // btn.innerHTML = buttonNames[i];
        // btn.className = 'seq-button ' + seqClass + '';
        // btn.id = index;
        // this.parent.appendChild(btn);
        // this.buttons.push(btn);
        // btn.addEventListener(gesture, localCallback);
        index++;
      }
    }
  },
  playSound: function (key) {
    var self = this
    var kickValue = {
      one: 0.25,
      two: 50,
    }
    // console.log(key)
    if (key == '65') {
      // console.log('kick')
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
    } else if (key == '83') {
      // console.log('snare')
      // Make osc
      var osc3 = self.audioContext.createOscillator();
      var gainOsc3 = self.audioContext.createGain();
      // Set filter value
      self.filterGain.gain.setValueAtTime(1, self.audioContext.currentTime);
      self.filterGain.gain.exponentialRampToValueAtTime(0.01, self.audioContext.currentTime + 0.2);
      // Assign osc type
      osc3.type = "triangle";
      osc3.frequency.value = 100;
      gainOsc3.gain.value = 0;
      gainOsc3.gain.setValueAtTime(0, self.audioContext.currentTime);
      gainOsc3.gain.exponentialRampToValueAtTime(0.01, self.audioContext.currentTime + 0.1);
      osc3.connect(gainOsc3);
      gainOsc3.connect(self.mixGain);
      self.mixGain.gain.value = 1;
      osc3.start(self.audioContext.currentTime);
      osc3.stop(self.audioContext.currentTime + 0.2);
      var node = self.audioContext.createBufferSource();
      var buffer = self.audioContext.createBuffer(1, 4096, self.audioContext.sampleRate);
      var data = buffer.getChannelData(0);
      var filter = self.audioContext.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(100, self.audioContext.currentTime);
      filter.frequency.linearRampToValueAtTime(1000, self.audioContext.currentTime + 0.2);
      for (var i = 0; i < self.bufferValue; i++) {
        data[i] = Math.random();
      }
      node.buffer = buffer;
      node.loop = true;
      node.connect(filter);
      filter.connect(self.filterGain);
      self.filterGain.connect(self.mixGain);
      node.start(self.audioContext.currentTime);
      node.stop(self.audioContext.currentTime + 0.2);
    } else if (key == '72') {
      // Make osc
      var fundamental = 40;
      var gainOsc4 = self.audioContext.createGain();
      var ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
      // Filter
      var bandpass = self.audioContext.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 10000;
      //
      var highpass = self.audioContext.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 7000;
      ratios.forEach(function(ratio) {
        var osc4 = self.audioContext.createOscillator();
        osc4.type = "square";
        osc4.frequency.value = fundamental * ratio;
        osc4.connect(bandpass);
        osc4.start(self.audioContext.currentTime);
        osc4.stop(self.audioContext.currentTime + 0.05);
      });
      gainOsc4.gain.setValueAtTime(1, self.audioContext.currentTime);
      gainOsc4.gain.exponentialRampToValueAtTime(0.01, self.audioContext.currentTime + 0.05);
      bandpass.connect(highpass);
      highpass.connect(gainOsc4);
      gainOsc4.connect(self.mixGain);
      self.mixGain.gain.value = 1;
    }
  },
  listenForKeys: function() {
    // Keystrokes
    var self = this
    document.addEventListener("keydown", function(event) {
    // if (event.which == '65') {
    self.playSound(event.which)
    // }
    // if (event.which == '83')
    //   snare();
    // if (event.which == '72')
    //   hihat();
    })
  }
  }
}
</script>