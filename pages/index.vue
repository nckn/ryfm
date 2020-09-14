<template lang="pug">
  .main-container
    .middle-container
      .sidebar
        .sidebar-container.syn
          .synth-settings
            Slider(:slider_name="'Osc 1'" :min="0" :max="3" :value="1" :step="1" :class_name="'switch'")
            Slider(:slider_name="'Osc 2'" :min="0" :max="3" :value="1" :step="1" :class_name="'switch'")
            Slider(:slider_name="'Detune'" :min="0" :max="8" :value="2" :step="1" :class_name="''")
        .sidebar-container.seq
          //- a-popover(title='Title', trigger='focus')
          //-   template(slot='content')
          //-     Slider(:slider_name="'Kick'" :min="30" :max="500" :value="50" :step="1" :class_name="'sm'")
          //-   a-button.sound-settings(type='primary' shape="circle" icon="setting")
          .seq-button.button.icon.hihat(@click="triggerSound" name="hihat")
          .seq-button.button.icon.snare(@click="triggerSound" name="snare")
          .seq-button.button.icon.kick(@click="triggerSound" name="kick")
            //- a-popover(title='Title', trigger='focus')
            //-   template(slot='content')
            //-     Slider(:slider_name="'Kick'" :min="30" :max="500" :value="50" :step="1" :class_name="'sm'")
            //-   a-button.sound-settings(type='primary' shape="circle" icon="setting")
      .instrument-wrapper
        .synth-wrapper 
          .synth-container(ref="synth_cont" @mousedown="spinNewAudioSource" @touchstart="spinNewAudioSource" @mousemove="youAreMoving" @touchmove="youAreMoving" @mouseup="youShouldStop" @touchend="youShouldStop")
          .ball(v-bind:class="{ visible: isDown }")
        .sequencer
          div.cell-row(v-for="(drum, index) in drums")
            Cell(v-for="(cell, index) in sequenceCells[index]" :class_name="'sixteen-buttons'" v-bind:id="index" :key="index" :isgreen="cell")
    .footer(ref="footer")
      .trigger-footer.button.icon.settings(@click="toggleControls")      
      .control-row.one
        .control-section.play-toggle(@click="togglePlay")
          .play-button
            .play-icon.stop(ref="play_icon")
        Slider(:slider_name="'Tempo'" :min="30" :max="240" :value="valSlider" :step="1")
        Slider(:slider_name="'Reverb'" :min="0" :max="100" :value="0" :step="1")
        .control-section.delay
          Slider(:slider_name="'Delay'" :min="0" :max="4.9" :value="0" :step="0.001")
          Slider(:slider_name="'Delay2'" :min="0" :max="0.9" :value="0" :step="0.01")
          //- p Delay
          //- .effect-icon.delay-icon
          //- input.delay-slider(type='range', min='0', max='4.9', step='0.001', value='0')
          //- output.delay-output
          //- .effect-icon.delay-feedback
          //- input.feedback-slider(type='range', min='0', max='0.9', step='0.01', value='0')
          //- output.feedback-output
      .control-row.two
        Slider(:slider_name="'Kick'" :min="30" :max="500" :value="50" :step="1")
        Slider(:slider_name="'Snare'" :min="100" :max="4096" :value="4096" :step="1")
        Slider(:slider_name="'Hihat'" :min="20" :max="200" :value="40" :step="1")
        Slider(:slider_name="'Filter'" :min="20" :max="5000" :value="2500" :step="1")
    // end of main-container
</template>

<script>

function checkIfTouch(e) {
  var thisX, thisY
  if (e.touches != undefined) {
    thisX = e.touches[0].pageX
    thisY = e.touches[0].pageY
  }
  else {
    thisX = e.clientX
    thisY = e.clientY
  }
  return { x: thisX, y: thisY }
}

class Vector {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }
}

var AudioSource = function(e) {
  this.source = [];
  this.sourceGain = [];
  var evt = checkIfTouch(e);
  this.event = evt;
  return this;
}

AudioSource.prototype.isMoving = function(e) {
  var evt = checkIfTouch(e);
  this.vector.x = evt.x;
  this.vector.y = evt.y;
  this.source[0].frequency.value = this.vector.x / 10;
  this.source[1].frequency.value = (this.vector.x / 10) - 4;
  // interactiveReg.removeEventListener("mousemove", this.isMoving);
}

AudioSource.prototype.hasStopped = function() {
  var fadeValue = 2000;
  this.sourceGain[0].gain.setTargetAtTime(0, audioContext.currentTime, 1.15);
  this.sourceGain[1].gain.setTargetAtTime(0, audioContext.currentTime, 1.15);
  // this.sourceGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.03);
  // this.source.stop(0);
  activeAudioSource = false;
}

import Cell from '../components/gui/Cell'
import Slider from '../components/gui/Slider'

import gsap from 'gsap';

import globalFunctions from '@/mixins/globalFunctions.js'

export default {
  name: 'Ryfm',
  mixins: [globalFunctions],
  components: {
    Cell,
    Slider
  },
  data () {
    return {
      visibleSettings: false,
      isTouch: null,
      request: null,
      bufferValue: 4096,
      isPlaying: false,
      currentTime: 0,
      previousTime: 0,
      inc: 0,
      incMax: 15,
      valSlider: 60,
      interval: 60 / 4,
      sequences: [],
      drums: [
        {name: 'hihat'},
        {name: 'snare'},
        {name: 'kick'}
      ],
      sequenceCells: [
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
      ],
      kickValue: {
        one: 0.25,
        two: 50,
      },
      fundamental: 40,
      interactiveReg: null,
      activeAudioSource: false,
      snd: [],
      oscTypes: ['sine', 'square', 'sawtooth', 'triangle'],
      osc: ['sine', 'square'],
      // range of tones
      scale: {min: 40, max: 200},
      detune: 4,
      scales: {
        c2: [
          65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81
        ]
      },
      isDown: false,
    }
  },
  mounted() {
    var self = this
    self.isTouch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    // console.log(self.isTouch)
    self.playIcon = self.$refs.play_icon
    self.footer = self.$refs.footer

    self.mapRangeOfSynth();

    // console.log(globalFunctions)

    // Setup audio nodes
    self.setupAudioContext()

    self.setupMouseFollow()
  },
  created() {
    this.setupButtons('sixteen-buttons', 16)
  },
  methods: {
    setupMouseFollow() {
      var self = this
      gsap.set(".ball", {xPercent: -50, yPercent: -50});

      var ball = document.querySelector(".ball");
      var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      var mouse = { x: pos.x, y: pos.y };
      var speed = 0.1;

      var xSet = gsap.quickSetter(ball, "x", "px");
      var ySet = gsap.quickSetter(ball, "y", "px");

      window.addEventListener('mousemove', e => {
        var evt = checkIfTouch(e);
        mouse.x = evt.x;
        mouse.y = evt.y;
      });
      
      window.addEventListener('touchmove', e => {
        var evt = checkIfTouch(e);
        mouse.x = evt.x;
        mouse.y = evt.y;
      });

      gsap.ticker.add(() => {
        var dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio()); 
        
        pos.x += (mouse.x - pos.x) * dt;
        pos.y += (mouse.y - pos.y) * dt;
        xSet(pos.x);
        ySet(pos.y);
      });
    },
    mapRangeOfSynth() {
      var self = this
      self.synthCont = self.$refs.synth_cont
      self.synthDim = self.synthCont.getBoundingClientRect();
      self.range = {
        minX: self.synthDim.x,
        maxX: self.synthDim.x + self.synthDim.width,
        minY: self.synthDim.y,
        maxX: self.synthDim.y + self.synthDim.height,
      }
      console.log('bounding client rect')
      console.log(self.synthDim)
    },
    mapTheXValue(value) {
      var self = this
      var val = self.map(value, self.range.minX, self.range.maxX, self.scale.min, self.scale.max)
      return val
    },
    toggleControls () {
      var self = this
      self.footer.classList.toggle('expanded')
    },
    hide () {
      // console.log(111)
      this.visibleSettings = false
    },
    spinNewAudioSource: function(e) {
      var self = this
      var audioSrc;

      // Set touch to on
      self.isDown = true

      // console.log(e.clientX)
      var evt = checkIfTouch(e);
      // return;
      // console.log('spinNewAudioSource')
      if (!self.activeAudioSource) {
        audioSrc = new AudioSource(evt);
        // console.log(audioSrc)
        self.initTouchSynth(audioSrc, evt)
        // this.source[0] = audioContext.createOscillator();
        // this.audioSrc[1] = audioContext.createOscillator();
        // this.sourceGain[0] = audioContext.createGain();
        // this.sourceGain[1] = audioContext.createGain();
      }
      self.activeAudioSource = true;
    },
    youAreMoving: function(e) {
      var self = this
      var evt = checkIfTouch(e);
      if (self.activeAudioSource) {
        // var x = e.pageX;
        // self.snd.vector.y = e.pageY;
        // console.log(evt.x)
        self.setVoices(evt);
      }
    },
    youShouldStop: function(e) {
      var self = this
      var fadeValue = 2000;
      self.snd.sourceGain[0].gain.setTargetAtTime(0, self.audioContext.currentTime, 1.15);
      self.snd.sourceGain[1].gain.setTargetAtTime(0, self.audioContext.currentTime, 1.15);
      self.activeAudioSource = false;
      // Set touch to on
      self.isDown = false
    },
    initTouchSynth: function(sound, evt) {
      var self = this
      self.snd = sound
      self.snd.source[0] = self.audioContext.createOscillator();
      self.snd.source[1] = self.audioContext.createOscillator();
      self.snd.sourceGain[0] = self.audioContext.createGain();
      self.snd.sourceGain[1] = self.audioContext.createGain();
      self.snd.source[0].type = self.osc[0];
      self.snd.source[1].type = self.osc[1];
      console.log(self.osc[0])
      // if (!self.snd.source[0].start) {
      //   self.snd.source[0].start = self.snd.source[0].noteOn;
      // }
      // self.snd.source[0].noteOn;
      self.snd.source[0].connect(self.snd.sourceGain[0]);
      self.snd.source[1].connect(self.snd.sourceGain[1]);
      self.snd.sourceGain[0].connect(self.trackFilter);
      self.snd.sourceGain[1].connect(self.trackFilter);
      self.snd.sourceGain[0].gain.value = 1;
      self.snd.sourceGain[1].gain.value = 0.25;
      //
      self.snd.source[0].start(0);
      self.snd.source[1].start(0);
      // console.log("in ever?");
      // console.log(self.snd.source[0], ', ', self.snd.vector.x)
      // var evt = checkIfTouch(event);
      self.snd.vector = new Vector(self.snd.event.x, self.snd.event.y);
      
      // console.log(self.snd.source[0], ', ', self.snd.vector.x)
      self.setVoices(evt);
      // console.log(self.snd)
      // interactiveReg.addEventListener("mousemove", this.isMoving.bind(this));
      // interactiveReg.addEventListener("touchmove", this.isMoving.bind(this));
      // interactiveReg.addEventListener("touchend", this.hasStopped.bind(this));
    },
    confineToScale(tone) {
      var self = this
      var step = 50
      // TODO: Make steps that answer to a scale
      // https://pages.mtu.edu/~suits/notefreqs.html
      // c2: 65.41 – d2: 73.42 – e2: 82.41, f2: 87.31 – g2: 98.00 – a2: 110.00 – b2: 123.47 – c3: 130.81
      // tone = Math.round(tone / step) * step
      // console.log('tone')
      // console.log(tone)
      // for (var i = 0; i < self.scales.length; i++) {
      //   var s = self.scales[i]
      //   if (tone < s)
      // }
      const closest = self.scales.c2.reduce((a, b) => {
        let aDiff = Math.abs(a - tone);
        let bDiff = Math.abs(b - tone);
        if (aDiff == bDiff) {
          // Choose largest vs smallest (> vs <)
          return a > b ? a : b;
        } else {
          return bDiff < aDiff ? b : a;
        }
      });
      console.log(closest)
      return closest
    },
    setVoices(evt) {
      var self = this
      var tone = self.mapTheXValue(evt.x)
      
      // tone = self.confineToScale(tone)
      
      self.snd.source[0].frequency.value = tone ? tone : 80;
      self.snd.source[1].frequency.value = tone ? (tone) - self.detune : 80;
    },
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
      // Connect all nodes
      self.mixGain.connect(self.delay);
      self.delay.connect(self.feedbackGain);
      self.feedbackGain.connect(self.delay);
      self.delay.connect(self.convolver);
      self.delay.connect(self.dry);
      self.convolver.connect(self.wet);
      self.dry.connect(self.trackFilter);
      self.wet.connect(self.trackFilter);
      self.trackFilter.connect(self.audioContext.destination);
      // Set values
      self.wet.gain.value = 0;
      self.mixGain.gain.value = 0;
      self.filterGain.gain.value = 0;
      self.trackFilter.type = 'highpass';  
      self.trackFilter.frequency.value = 0; // filter value
      self.feedbackGain.gain.value = 0;
      // console.log(self)
      self.listenForKeys()
      self.loadImpulse()
      // requestAnimationFrame(self.performAnimation)
      // cancelAnimationFrame(request) //stop the animation
    },
    loadImpulse: function() {
      var self = this
      var loadImpulse = function ( fileName ) {
      // var url = "snd/GraffitiHallway.wav";
      var url = "./snd/HaleHolisticYogaStudio.wav";
      var request = new XMLHttpRequest();
      request.open( "GET", url, true );
      request.responseType = "arraybuffer";
      request.onload = function () {
        self.audioContext.decodeAudioData( request.response, function ( buffer ) {
        self.convolver.buffer = buffer;
        }, function ( e ) { console.log( e ); } );
      };
      request.onerror = function ( e ) {
        // console.log( e );
      };
      request.send();
      };
      loadImpulse(0);
      // mix(0);
    },
    togglePlay: function() {    
      var self = this
      // var target = e.target || e.scrElement
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
        self.playSequence();
      }
    },
    playSequence: function() {
      var self = this
      // console.log(self.inc)
      var rows = document.getElementsByClassName('cell-row')
      var btns = document.getElementsByClassName('sixteen-buttons')
      if (self.isPlaying) {
        requestAnimationFrame(self.playSequence);
      }
      console.log(self.interval)
      // requestAnimationFrame(self.performAnimation)
      // console.log(btns[self.inc].getAttribute('active'))
      // console.log(rows.length)
      // console.log(btns.length)
      if ((self.currentTime - self.previousTime) > self.interval) {
        // console.log(currentTime + " - " + previousTime + " > " + interval);
        self.previousTime = self.currentTime;
        if (rows[0].children[self.inc].getAttribute('active')) {
          // hihat
          if (rows[0].children[self.inc].classList.contains('dbl')) {
            self.playSound('85');
          }
          self.playSound('72');
        }
        if (rows[1].children[self.inc].getAttribute('active')) {
          // snare
          self.playSound('83');
        }
        if (rows[2].children[self.inc].getAttribute('active')) { 
          // kick
          self.playSound('65');
        }
        self.inc++;
        if (self.inc > self.incMax) {
          self.inc = 0;
        }
        for (var i = 0; i < rows[0].children.length; i++) {
          if (i == (self.inc - 1)) {
            rows[0].children[i].classList.add('playing-now');
          } else {
            rows[0].children[i].classList.remove('playing-now');
          }
        }
      }
      self.currentTime++;
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
          this.gains[i].gain.exponentialRampToValueAtTime(0.001, self.audioContext.currentTime + self.kickValue.one);
          this.oscs[i].frequency.setValueAtTime((i == 0 ? 120 : self.kickValue.two), self.audioContext.currentTime);
          this.oscs[i].frequency.exponentialRampToValueAtTime(0.001, self.audioContext.currentTime + self.kickValue.one);  
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
        // Hihat
        // Make osc
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
          osc4.frequency.value = self.fundamental * ratio;
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
      } else if (key == '85') {
        // Open Hihat
        // Make osc
        var gainOsc4 = self.audioContext.createGain();
        var ratios = [2, 3, 4.16, 5.43, 6.79, 8.21, 11];
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
          osc4.frequency.value = self.fundamental * ratio;
          osc4.connect(bandpass);
          osc4.start(self.audioContext.currentTime);
          osc4.stop(self.audioContext.currentTime + 0.2);
        });
        gainOsc4.gain.setValueAtTime(1, self.audioContext.currentTime);
        gainOsc4.gain.exponentialRampToValueAtTime(0.1, self.audioContext.currentTime + 0.5);
        bandpass.connect(highpass);
        highpass.connect(gainOsc4);
        gainOsc4.connect(self.mixGain);
        self.mixGain.gain.value = 1;
      } else if (key == '32') {
        self.togglePlay()
      }
    },
    listenForKeys: function() {
      // Keystrokes
      var self = this
      document.addEventListener("keydown", function(event) {
        // if (event.which == '65') {
        self.playSound(event.which)
        // console.log(event.which)
        // }
        // if (event.which == '83')
        //   snare();
        // if (event.which == '72')
        //   hihat();
        // event.which == '85' open hihat, 'U'
      })
    },
    tweakSounds: function(target) {
      var self = this
      // var target = e.target || e.srcElement
      // console.log(target.name + ': ' + target.value)
      if (target.name == 'hihat') {
        // console.log("hihat" + target.value);
        fundamental = target.value;
      }
      else if (target.name == 'Snare') {
        // console.log("snare" + target.value);
        self.bufferValue = target.value;
      }
      else if (target.name == 'Kick'){
        // console.log(typeof parseInt(target.value));
        // kickValue.one = parseFloat(target.value);
        self.kickValue.two = parseInt(target.value);
      }
      else if (target.name == 'Filter'){
        // console.log( target );
        self.trackFilter.frequency.value = target.value;
      }
    },
    triggerSound: function(e) {
      var self = this
      var target = e.target || e.srcElement
      var name = target.getAttribute('name')
      // console.log(this.className);
      // console.log(target.getAttribute('name'))
      if (name == 'hihat') {
        self.playSound('72')
      } else if (name == 'snare') {
        self.playSound('83')
      } else if (name == 'kick') {
        self.playSound('65')
      }
    },
    changeParam: function(target) {
      var self = this
      // console.log(target + ': ' + val)
      if (target.name == 'Tempo') {
        self.changeSpeed(target.value, target.max)
      }
      if (target.name == 'Reverb') {
        var reverb = target.value / 100.0;
        self.dry.gain.value = ( 1.0 - reverb );
        self.wet.gain.value = reverb;
        // document.querySelector('.reverb-output').innerHTML = "" + this.value + " % wet";
      }
      if (target.name == 'Delay' || target.name == 'Delay2') {
        self.changeDelay(target)
      }
      if (target.name == 'Osc 1') {
        self.osc[0] = self.oscTypes[target.value]
        console.log('Osc 1: ' + self.oscTypes[target.value])
      }
      if (target.name == 'Osc 2') {
        self.osc[1] = self.oscTypes[target.value]
        console.log('Osc 2: ' + target.value)
      }
      if (target.name == 'Detune') {
        // self.osc[1] = self.oscTypes[target.value]
        console.log('Detune: ' + target.value)
        self.detune = target.value
      }
    },
    changeDelay: function(target) {
      var self = this
      // var reverb = this.value / 100.0;
      // dry.gain.value = ( 1.0 - reverb );
      // wet.gain.value = reverb;  
      // document.querySelector('.reverb-output').innerHTML = "" + this.value + " % wet";
      // console.log(this);
      if (target.name == 'Delay') {
          self.delay.delayTime.value = target.value;
          // d.querySelector('.delay-output').innerHTML = newSetup.getDataValue(this.value, 10, "ms"); 
      } else if (target.name == 'Delay2') {
          self.feedbackGain.gain.value = target.value;
          // d.querySelector('.feedback-output').innerHTML = newSetup.getDataValue(this.value, 100, "%");
      }
    },
    changeSpeed: function(val, max) {
      var self = this
      // var newVal = Math.floor(self.convertRange( (max - val), [ 0, 1000 ], [ 2, 50 ] ));
      // var val = Math.floor(self.convertRange( val, [ 30, 400 ], [ 40, 400 ] ));
      var divisor = 60 / val
      var bpm = Math.floor( (divisor * 60) / 4 );
      // var bpm = Math.floor((1000 / (newVal*4)) * 60);
      // var bpm = 60 / newTempoVal;
      // interval = newVal;
      self.interval = bpm;
      // console.log(bpm + ", " + newVal);
      console.log("val: " + val + ", bpm: " + bpm);
      // document.querySelector('.tempo-output').innerHTML = "" + bpm + " bpm";
    },
    convertRange: function( value, r1, r2 ) { 
      return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
    }
  }
}
</script>

<style lang="scss">

// .seq-button {
//   position: relative;
.sound-settings {
  position: absolute;
  top: 12px;
  right: 12px;
}
// }

</style>