<template lang="pug">
  .master-inner
    Controls(:settings="settings" :event="'click'" :revealed="false")
    //- MenuSidebar(:style_name="'rightside'" :type="'info'" :options="guiControls" :closer="container")
    .main-container
      .middle-container
        .sidebar
          .sidebar-container.syn
            .synth-settings
              Slider(:slider_name="'Osc 1'" :min="0" :max="3" :value="1" :step="1" :class_name="'switch'")
              Slider(:slider_name="'Osc 2'" :min="0" :max="3" :value="1" :step="1" :class_name="'switch'")
              Slider(:slider_name="'Scale'" :min="0" :max="1" :value="0" :step="1" :class_name="'switch scale'")
              Slider(:slider_name="'Volume'" :min="0.1" :max="0.5" :value="0.15" :step="0.01" :class_name="''")
              Slider(:slider_name="'Detune'" :min="0" :max="8" :value="2" :step="1" :class_name="''")
          .sidebar-container.seq
            //- a-popover(title='Title', trigger='focus')
            //-   template(slot='content')
            //-     Slider(:slider_name="'Kick'" :min="30" :max="500" :value="50" :step="1" :class_name="'sm'")
            //-   a-button.sound-settings(type='primary' shape="circle" icon="setting")
            a-popover(placement='topLeft' trigger="click" v-for="(instrument, index) in instruments" :key="`inst-${index}`")
              template(slot='content')
                //- Slider(:slider_name="'Detune'" :min="0" :max="8" :value="2" :step="1" :class_name="''")
                div.slider-row
                  label {{ instrument.name }} volume
                div.slider-row
                  input.slider(:name='`slider-${instrument.name}`' :id='`slider-${index}`' type='range', :min="0", :max="1", :step="0.01", :value="0.5" @input="changeVol" ref="hihat_volume")
                div.slider-row
                  label Search for sound
                div.slider-row
                  input.search-sound(type="text" v-model="searchString")
                  button.search-sound(@click="searchForSound" :search_id="`${index}`")
              template(slot='title')
                span {{ instrument.name }} settings
              .seq-button.button.icon(@click="triggerSound" @drop="dropEvent" @dragover="dragOver" @dragleave="dragOver" :trigger_id="`${index}`" :name="instrument.name" v-bind:class="instrument.name")
              //- a-popover(title='Title', trigger='focus')
              //-   template(slot='content')
              //-     Slider(:slider_name="'Kick'" :min="30" :max="500" :value="50" :step="1" :class_name="'sm'")
              //-   a-button.sound-settings(type='primary' shape="circle" icon="setting")
        .instrument-wrapper
          .synth-wrapper 
            .synth-container(ref="synth_cont" @mousedown="spinNewAudioSource" @touchstart="spinNewAudioSource" @mousemove="youAreMoving" @touchmove="youAreMoving" @mouseup="youShouldStop" @touchend="youShouldStop")
              .divisions-container
                .divisions(v-for="(divs, index) in scales.c2" v-bind:style="`width:calc((100% / ${scales.c2.length}) - 4px);`" ref="divisions")
            .ball(v-bind:class="{ visible: isDown }")
          .sequencer
            div.cell-row(v-for="(drum, index) in instruments")
              Cell(v-for="(cell, index) in curSequenceRes[index]" :class_name="'sixteen-buttons'" v-bind:class="[ { thirtytwo: resolution === 32 } ]" v-bind:id="index" :key="index" :isgreen="cell")
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

// Small change to test netlify
import axios from 'axios'

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

// import MenuSidebar from '@/components/gui/MenuSidebar'
import Controls from '@/components/gui/Controls'

import gsap from 'gsap';

import globalFunctions from '@/mixins/globalFunctions.js'

// global vars
let synthGainValue = 0.15;

let resolution = 32

var resoList = [
  8,
  16,
  32,
  64
]

export default {
  name: 'Ryfm',
  mixins: [globalFunctions],
  components: {
    Cell,
    Slider,
    // MenuSidebar
    Controls
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
      incMax: resolution - 1,
      valSlider: 60,
      interval: 60 / 4,
      sequences: [],
      instruments: [
        {name: 'hihat'},
        {name: 'snare'},
        {name: 'kick'}
      ],
      curSequenceRes: [],
      sequenceCells: [
        [
          [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
          [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        ],
        [
          [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
          [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
        ]
      ],
      resolution: resolution,
      kickValue: {
        one: 0.25,
        two: 50,
      },
      fundamental: 40,
      interactiveReg: null,
      activeAudioSource: false,
      snd: [],
      oscTypes: ['sine', 'square', 'sawtooth', 'triangle'],
      osc: ['sawtooth', 'sawtooth'],
      // osc: ['sine', 'square'],
      // range of tones
      scale: {min: 40, max: 200},
      detune: 1,
      // https://pages.mtu.edu/~suits/notefreqs.html
      scales: {
        c2: [
          65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81,
          146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63,
          293.66
        ],
        arabic: [
        // C2,    Db,     E,      F,      G,      Ab,     Bb    
          65.41,  69.30,  82.41,  87.31,  98.00,  103.83, 116.54,
          130.81, 138.59, 164.81, 174.61, 196.00, 207.65, 233.08,
          261.63, 277.18
        ],
      },
      isDown: false,
      stepVoices: true,
      splits: [],
      divDim: [],
      curScale: null,
      // Tremolo
      modulatorOscillator: null,
      modulatorGain: null,
      // Custom sounds related
      isHovering: false,
      droppedFile: null,
      fileIsLoaded: false,
      fileIsLoading: false,
      droppedFile: null,
      // These are the custom audio source container objects
      srcs: [
        {src: null, startTime: 0, childNo: 0, progress: 0, offset: 0, isVirgin: true, isPlaying: false},
        {src: null, startTime: 0, childNo: 7, progress: 0, offset: 0, isVirgin: true, isPlaying: false},
        {src: null, startTime: 0, childNo: 7, progress: 0, offset: 0, isVirgin: true, isPlaying: false}
      ],
      shouldPlayCustom: [false,false,false],
      dropIndex: 0,
      songData: new Array(3),
      trackGain: new Array(3),
      // Freesound.org search related
      searchString: '',
      // Controls for menu sidebar
      settings: [
        {name: 'General',
          stepsliders: [
            {
              name: 'Resolution', value: 0, min: 0, max: resoList.length - 1, step: 1,
              fonts: resoList
            },
          ]
        },
        {name: 'FXs',
          checkbox: [
            {name: 'Enable FXs', checked: true},
            {name: 'After image', checked: true},
            // {name: 'Enable Environment', checked: true},
            {name: 'Mirror text', checked: true},
            {name: 'Neon colors', checked: true},
          ]
        },
        {name: 'FXsSliders',
          sliders: [
            {name: 'Scan lines', value: 0.5},
            {name: 'Noise intensity', value: 0.5},
            {name: 'Bloom strength', value: 1, min: 0, max: 6, step: 0.01},
            {name: 'Blur radius', value: 0.5},
            {name: 'Light intensity', value: 0.5},
          ]
        },
        {name: 'Pixel',
          sliders: [
            {name: 'Pixel size', value: 0.5}
          ]
        },
      ],
    }
  },
  mounted() {
    var self = this
    self.isTouch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    // console.log(self.isTouch)
    self.playIcon = self.$refs.play_icon
    self.footer = self.$refs.footer

    // set current sequence Cells
    self.curSequenceRes = self.sequenceCells[1]

    self.mapRangeOfSynth();
    
    self.getAllDivisionAttr();

    // console.log(globalFunctions)

    // Setup audio nodes
    self.setupAudioContext()

    self.setupMouseFollow()
    
    self.setupAudioSources()
    
    // self.assignRightSize()
    // setTimeout(() => {
    //   self.assignRightSize()
    // }, 100)

    // Set the current scale
    self.curScale = self.scales.c2

    // Setup Tremolo FX
    self.setupTremoloEffect()

    // resize
    window.addEventListener( 'resize', () => {
      self.mapRangeOfSynth()
      self.getAllDivisionAttr();
    }, false )
  },
  created() {
    this.setupButtons('sixteen-buttons', resolution)
  },
  methods: {
    changeVal(ob) {
      // Slider
      var self = this
      console.log('name: ', ob.name)
      if (ob.name === 'Resolution') {
        console.log('value: ', ob.value)
        if (parseInt(ob.value) === 0) {
          self.setResolution(16)
        }
        else if (parseInt(ob.value) === 1) {
          self.setResolution(32)
        }
        // this.setupButtons('sixteen-buttons', resolution)
      }
      else if (ob.name === 'Enable FXs') {
        // self.renderComposer = !self.renderComposer
      } 
    },
    setResolution(res) {
      var self = this
      var allButtons = document.getElementsByClassName('sixteen-buttons')
      // console.log('setting all buttons')
      // console.log(allButtons)
      // return
      for (var i = 0; i < allButtons.length; i++) {
        if (res === 16) {
          console.log('will remove')
          resolution = 16
          allButtons[i].classList.remove('thirtytwo')
          // set current sequence Cells
          self.curSequenceRes = self.sequenceCells[0]
        }
        else if (res === 32) {
          console.log('will add')
          resolution = 32
          allButtons[i].classList.add('thirtytwo')
          // set current sequence Cells
          self.curSequenceRes = self.sequenceCells[1]
        }
      }
      self.incMax = self.resolution - 1;
      // self.inc = 0;
    },
    searchForSound(e) {
      var self = this
      var target = e.target || e.srcElement
      var sId = parseInt(target.getAttribute('search_id'))
      // console.log(target)
      const url = `https://freesound.org/apiv2/search/text/?query=${self.searchString}&fields=previews&token=Q77jykfkUnXkB7acjlT3ny3KwJhJ6CqpWpkPVcmH`
      axios
        // .get(url + this.result.label)
        .get(url)
        .then((response) => {
          // const responseData = response
          const responseData = response.data.results[0]
          // const responseData = response.data.data[0]
          console.log(responseData.previews['preview-lq-mp3'])
          var soundUrl = responseData.previews['preview-lq-mp3']
          self.loadFromFreesoundUrl(soundUrl, sId)
          // this.fetchAudio(String(responseData.id))
          // this.result.giphy = responseData.images.original.url
          // this.result.alt = responseData.title
          // this.result.giphyUrl = responseData.url
        })
        .catch((e) => {
          // this.errors.push(e)
          console.log('Error searching for sound', e)
        })
    },
    loadFromFreesoundUrl: function(url, num) {
      var self = this
      // var num = 0
      var request = new XMLHttpRequest();
      self.shouldPlayCustom[num] = true
      request.open( "GET", url, true );
      request.responseType = "arraybuffer";
      request.onload = function () {
        console.log( 'sending request');
        self.audioContext.decodeAudioData( request.response, function ( buffer ) {
          console.log( 'req repsonse: ', buffer);
          self.srcs[num].src = null
          self.srcs[num].src = self.audioContext.createBufferSource()
          self.srcs[num].src.buffer = buffer
          self.songData[num] = buffer
        }, function ( e ) { console.log( e ); } );
      };
      request.onerror = function ( e ) {
        console.log( 'failed with this error', e );
      };
      request.send();
      // mix(0);
    },
    setupAudioSources() {
      var self = this
      for (var i = 0; i < self.srcs.length; i++) {
        self.srcs[i].src = self.audioContext.createBufferSource()
        // self.srcs[i].loop = true
        // self.srcs[i].src.connect(self.mixGain)
        // self.sourceGain[i].connect(self.convolver)
        // self.sourceGain[i].connect(self.dry)
      }
    },
    loadAudio (data, num) {
      var self = this
      // var trackData = new ArrayBuffer(data)
      console.log('data type: ' + data, 'num: ', num);
      // console.log('data type: ' + typeof data);
      // console.log('we are loading: ' + trackData);
      // console.log('the log is: ' + typeof trackData);
      self.audioContext.decodeAudioData(data, function (buffer) {
        self.srcs[num].isVirgin = false
        // Reverse buffer
        // Array.prototype.reverse.call( buffer.getChannelData(0) )
        // Array.prototype.reverse.call( buffer.getChannelData(1) )
        self.srcs[num].src = null
        self.srcs[num].src = self.audioContext.createBufferSource()
        self.srcs[num].src.buffer = buffer
        self.songData[num] = buffer
        // // Change appearance of players now that everything is loaded
        // if (num === 0) {
        //   self.$children[0].allowPlayer()
        // } else if (num === 1) {
        //   self.$children[7].allowPlayer()
        // }
        // // Show visualizer
        // self.frameLooper()
      }, function (e) {
        console.log('it fails: ' + e)
      })
    },
    dropEvent (e) {
      var self = this
      var target = e.target || e.srcElement
      e.stopPropagation()
      e.preventDefault()
      // Get the id of target
      var tId = parseInt(target.getAttribute('trigger_id'))
      // console.log('target is: ', target)
      // console.log('target is: ', tId)
      // console.log('target is: ', typeof tId)
      self.dropIndex = tId
      self.shouldPlayCustom[self.dropIndex] = true
      // console.log(e.target.files)
      // // console.log(self.logObject(e))
      // return
      self.isHovering = false
      if (e.dataTransfer) {
        // console.log(e.dataTransfer.files)
        self.droppedFile = e.dataTransfer.files[0]
        // Check if file is sound
        var isSoundOkay = self.isFileSound(e.dataTransfer.files[0] || e.target.files[0])
        // console.log('file: ' + isSoundOkay)
        if (!isSoundOkay) {
          self.toggleHoverState()
          self.dragText = 'You need a good old mp3 or wav file. Try again!'
          return
        }
        // Set the custom sound flag
      } else if (e.target.files) {
        self.droppedFile = e.target.files[0]
      }
      // File reader
      var reader = new FileReader()
      reader.onload = function (fileEvent) {
        var str = self.droppedFile.name
        // self.artistInfo.innerHTML = str
        self.songData[tId] = fileEvent.target.result
        self.loadAudio(self.songData[tId], self.dropIndex)
        // console.log(self.songData)
      }
      reader.readAsArrayBuffer(self.droppedFile)
      // var playButton = 'start-' + num
      // document.getElementById(playButton).removeChild(document.getElementById('drag-instr'));
      // Remove class
      target.classList.remove('hovering')
    },
    dragOver (e) {
      console.log(e.type)
      var target = e.target || e.srcElement;
      if (e.type === 'dragover') {
        target.classList.add('hovering')
      }
      else if (e.type === 'dragleave') {
        target.classList.remove('hovering')
      }
      e.stopPropagation()
      e.preventDefault()
      if (this.isHovering) {
        return
      }
      this.toggleHoverState()
      return false
    },
    toggleHoverState () {
      this.isHovering = !this.isHovering
    },
    turnOffHoverState () {
      console.log('leaving')
      this.isHovering = false
    },
    changeVol (e) {
      var self = this
      var target = e.target || e.srcElement
      var id = parseInt(target.id.substring(target.id.lastIndexOf("-") + 1))
      // console.log(target.name, 'id: ', id)
      // Hihat
      self.trackGain[id].gain.value = target.value
    },
    playCustomSound (id) {
      var self = this
      // var id = self.dropIndex
      console.log('playing custom sound')
      console.log(self.srcs[id].src)
      // return
      // self.shouldPlayCustom[id] = false
      // self.srcs[self.dropIndex].isPlaying = true
      // self.srcs[id].src.start(0)
      var gainCustomSound = self.audioContext.createGain();
      // var ratios = [5.43, 6.79, 8.21];
      // Filter
      var bandpass = self.audioContext.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 5000;
      //
      var highpass = self.audioContext.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 7000;
      var newSound = self.audioContext.createBufferSource()
      newSound.buffer = self.songData[id]
      // Connect to the track gain - start
      newSound.connect(self.trackGain[id])
      self.trackGain[id].connect(self.mixGain)
      // Connect to the track gain - end
      newSound.start(self.audioContext.currentTime);
      // newSound.stop(self.audioContext.currentTime + 0.05);
      newSound.onended = (evt) => {
        // self.stopSource(id)
        // console.log('done playing !!!!!')
        newSound.disconnect()
        newSound.stop(0)
        newSound = null
      }
      // ratios.forEach(function(ratio) {
      //   var osc4 = self.audioContext.createOscillator();
      //   osc4.type = "square";
      //   osc4.frequency.value = self.fundamental * ratio;
      //   osc4.connect(bandpass);
      //   osc4.start(self.audioContext.currentTime);
      //   osc4.stop(self.audioContext.currentTime + 0.05);
      // });
      gainCustomSound.gain.setValueAtTime(1, self.audioContext.currentTime);
      gainCustomSound.gain.exponentialRampToValueAtTime(0.01, self.audioContext.currentTime + 0.05);
      bandpass.connect(highpass);
      highpass.connect(gainCustomSound);
      gainCustomSound.connect(self.mixGain);
    },
    setupTremoloEffect() {
      var self = this
      // Create a modulator (low frequency) oscillator
      self.modulatorOscillator = self.audioContext.createOscillator();
      // Set its frequency value to the desired vibrato rate
      self.modulatorOscillator.frequency.value = 6;
      // Create an amplifier to control depth of vibrato
      self.modulatorGain = self.audioContext.createGain();
      // Set the depth of vibrato
      self.modulatorGain.gain.value = 10; // why this value?
      // Connect the LFO to its gain controller
      self.modulatorOscillator.connect(self.modulatorGain);
      self.modulatorOscillator.start();
      // Connect the LFO's GainNode to the frequency AudioParam of the carrier
      // self.modulatorGain.connect(self.source[0].frequency);
    },
    assignRightSize () {
      // Make sure sound tiles are always square
      // TODO: Make sure they are from beginning
      var self = this
      var idol = document.getElementsByClassName('seq-button sixteen-buttons')
      // var idol = document.getElementsByClassName('grid__item-img')
      console.log(idol)
      // var idol = thumbs
      if (idol.length > 0) {
        var idolStyle = document.defaultView.getComputedStyle(idol[0], null)
        var idolWidth = (parseInt(idolStyle.width, 10))
        for (var i = 0; i < idol.length; i++) {
          // console.log('here they are:' + idol[i])
          idol[i].style.height = '' + idolWidth + 'px'
          // idol[i].classList.add('revealed')
        }
      }
    },
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
        // console.log(e.target)
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
      // Reset tremolo
      self.modulatorOscillator.frequency.value = 0
      // create a starting point in time for the ramp
      for (var i = 0; i < self.snd.sourceGain.length; i++) {
        self.snd.sourceGain[i].gain.setValueAtTime(0.1, self.audioContext.currentTime);
        // turn the gain volume off
        self.snd.sourceGain[i].gain.linearRampToValueAtTime(0., self.audioContext.currentTime + 0.1);
      }
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

      // Tremolo related - start
      self.modulatorGain.connect(self.snd.source[0].frequency);
      self.modulatorGain.connect(self.snd.source[1].frequency);

      // create a starting point in time for the ramp
      for (var i = 0; i < self.snd.sourceGain.length; i++) {
        self.snd.sourceGain[i].gain.setValueAtTime(0.0, self.audioContext.currentTime)
        // turn the gain volume to -20 dB
        self.snd.sourceGain[i].gain.linearRampToValueAtTime(0.1, self.audioContext.currentTime + 0.1);
      }
      // Tremolo related - end

      // console.log(self.osc[0])
      // if (!self.snd.source[0].start) {
      //   self.snd.source[0].start = self.snd.source[0].noteOn;
      // }
      // self.snd.source[0].noteOn;
      self.snd.source[0].connect(self.snd.sourceGain[0]);
      self.snd.source[1].connect(self.snd.sourceGain[1]);
      // self.snd.sourceGain[0].connect(self.trackFilter);
      // self.snd.sourceGain[1].connect(self.trackFilter);
      self.snd.sourceGain[0].connect(self.mixGain);
      self.snd.sourceGain[1].connect(self.mixGain);
      // Set volume of synth
      self.snd.sourceGain[0].gain.value = synthGainValue;
      self.snd.sourceGain[1].gain.value = synthGainValue;
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
    getAllDivisionAttr() {
      var self = this
      // Empty array
      self.divDim = []
      self.divs = self.$refs.divisions
      for (var i = 0; i < self.divs.length; i++) {
        var div = self.divs[i];
        var divDim = div.getBoundingClientRect();
        // console.log(self.divs[i])
        self.divDim.push( divDim )
        // console.log(self.divDim)
      }
    },
    mapRangeOfSynth() {
      var self = this
      self.synthCont = self.$refs.synth_cont
      self.synthDim = self.synthCont.getBoundingClientRect();
      self.range = {
        minX: self.synthDim.x,
        maxX: self.synthDim.x + self.synthDim.width,
        minY: self.synthDim.y,
        maxY: self.synthDim.y + self.synthDim.height,
      }
      // console.log('bounding client rect')
      // console.log(self.range.maxX)
      var span = self.range.maxX / self.scales.c2.length;
      // var newSpan = self.map(span, self.range.minX, self.range.maxX, self.scale.min, self.scale.max)
      for (var i = 0; i < self.scales.c2.length; i++) {
        // var split = newSpan * i;
        // var split = span * i;
        // self.splits.push( split );
        // console.log('split: ', split)
      }
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

      // self.curScale = self.scales.c2

      // console.log(self.divDim[0].left)
      // console.log(self.curScale.length)
      for (var i = 0; i < self.curScale.length; i++) {
        if (i === 0) {
          if (tone > self.divDim[0].left && 
              tone < self.divDim[1].left) {
            // console.log('yes')
            tone = self.curScale[0];
          }
        }
        else if (i === self.curScale.length - 1) {
          if (tone > self.divDim[self.curScale.length - 1].left) {
            tone = self.curScale[self.curScale.length - 1];
          }
        }
        else {
          if (
            tone > self.divDim[i].left &&
            tone < self.divDim[i + 1].left) {
            tone = self.curScale[i];
          }
        }
      }

      for (var i = 0; i < self.divDim.length; i++) {
        // if (tone <)
        // var div = self.divs[i];
        // self.divDim = div.getBoundingClientRect();
        // console.log(self.divs[i])
        // console.log(self.divDim)
      }

      // for (var i = 0; i < self.scales.length; i++) {
      //   var s = self.scales[i]
      //   // if (tone < s)
      // }
      // const closest = self.splits.reduce((a, b) => {
      //   let aDiff = Math.abs(a - tone);
      //   let bDiff = Math.abs(b - tone);
      //   if (aDiff == bDiff) {
      //     // Choose largest vs smallest (> vs <)
      //     return a > b ? a : b;
      //   } else {
      //     return bDiff < aDiff ? b : a;
      //   }
      // });
      // console.log(closest)
      // return closest
      // console.log(tone)
      return tone
    },
    setVoices(evt) {
      var self = this
      var tone;
      tone = evt.x
      // tone = self.mapTheXValue(evt.x)
      
      if (self.stepVoices)
        tone = self.confineToScale(tone)
      
      self.snd.source[0].frequency.value = tone ? tone : 80;
      self.snd.source[1].frequency.value = tone ? (tone) - self.detune : 80;

      // Set tremolo
      console.log('y is: ', evt.y)
      // TODO: calculate
      var maxTremolo = 8
      var newY = maxTremolo - (self.map(evt.y, 100, 400, 0, maxTremolo))
      self.modulatorOscillator.frequency.value = newY
      self.modulatorGain.gain.value = newY * 2
    },
    mapTheXValue(value) {
      var self = this
      var val = self.map(value, self.range.minX, self.range.maxX, self.scale.min, self.scale.max)
      return val
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
      
      // Create track gains
      for (var tI = 0; tI < self.trackGain.length; tI++) {
        self.trackGain[tI] = self.audioContext.createGain()
      }
      
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
      self.mixGain.gain.value = 0.5;
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
    stopSource: function(id) {
      var self = this
      console.log('sound over')
      if (self.srcs[id].isPlaying) {
        self.srcs[id].src.disconnect()
        self.srcs[id].src.stop(0)
        // console.log('stopppppping sounddddddddddd')
        // self.srcs[id].src = null
        // self.loadAudio(self.songData, id)
        self.srcs[id].isPlaying = false
      }
    },
    playSequence: function() {
      var self = this
      console.log(self.inc)
      var rows = document.getElementsByClassName('cell-row')
      var btns = document.getElementsByClassName('sixteen-buttons')
      if (self.isPlaying) {
        requestAnimationFrame(self.playSequence);
      }
      // Interval
      // console.log(self.interval)
      // requestAnimationFrame(self.performAnimation)
      // console.log(btns[self.inc].getAttribute('active'))
      // console.log(rows.length)
      // console.log(btns.length)
      if ((self.currentTime - self.previousTime) > self.interval) {
        // console.log(currentTime + " - " + previousTime + " > " + interval);
        self.previousTime = self.currentTime;
        if (rows[0].children[self.inc].getAttribute('active')) {
          // Play custom sound on 1
          if (self.shouldPlayCustom[0]) {
            // Stop the audio source before starting it again
            self.stopSource(self.dropIndex)
            // Play the audio source before starting it again
            self.playCustomSound(0)
            // console.log('custom souuuuuund')
            // TODO: set play flag to true
          }
          // or play default hihat sound
          else {
            // hihat - open
            if (rows[0].children[self.inc].classList.contains('dbl')) {
              self.playSound('85');
            }
            // hihat - default
            self.playSound('72');
          }
        }
        if (rows[1].children[self.inc].getAttribute('active')) {
          // Play custom sound on 2
          if (self.shouldPlayCustom[1]) {
            // Stop the audio source before starting it again
            self.stopSource(self.dropIndex)
            // Play the audio source before starting it again
            self.playCustomSound(1)
            // console.log('custom souuuuuund')
            // TODO: set play flag to true
          }
          // or play default hihat sound
          else {
            // snare
            self.playSound('83');
          }
        }
        if (rows[2].children[self.inc].getAttribute('active')) { 
          // Play custom sound on 3
          if (self.shouldPlayCustom[2]) {
            // Stop the audio source before starting it again
            self.stopSource(self.dropIndex)
            // Play the audio source before starting it again
            self.playCustomSound(2)
            // console.log('custom souuuuuund')
            // TODO: set play flag to true
          }
          // or play default hihat sound
          else {
            // kick
            self.playSound('65');
          }
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
            if (input >= 0 && input <= (resolution - 1)) { // 0 - 7
              sequences[ seqIndex ][ 0 ][ input ] = (sequences[ seqIndex ][ 0 ][ input ] == 0) ? 1 : 0;
            }
            if (input >= resolution && input < ((resolution * 2) - 1)) { // 8 - resolution
              sequences[ seqIndex ][ 1 ][ input-resolution ] = (sequences[ seqIndex ][ 1 ][ input-resolution ] == 0) ? 1 : 0; // input-8
            }
            if (input >= (resolution * 2) && input < ((resolution * 3) - 1)) { // 8 - resolution
              sequences[ seqIndex ][ 2 ][ input-resolution ] = (sequences[ seqIndex ][ 2 ][ input-resolution ] == 0) ? 1 : 0; // input-8
            }
            if (input >= (resolution * 3) && input < (resolution * 4)) { // resolution - 24
              sequences[ seqIndex ][ 3 ][ input-(resolution * 3) ] = (sequences[ seqIndex ][ 3 ][ input-(resolution * 3) ] == 0) ? 1 : 0; // input-resolution
            }
            // var newElement = document.createElement("div");
            // newElement.className = "fill";
            // target.appendChild(newElement);
            if (target.classList.contains('assigned')) {
              target.classList.remove("assigned");
            }
            else {
              target.classList.add("assigned");
            }
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
      // Set the resolution
      self.setResolution(32)
    },
    playSound: function (key) {
      var self = this
      // console.log(key)
      if (key == '72') {
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
        gainOsc4.connect(self.trackGain[0]);
        self.trackGain[0].connect(self.mixGain);
        // self.mixGain.gain.value = 1;
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
        // self.mixGain.gain.value = 1;
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
        // self.mixGain.gain.value = 1;
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
        self.filterGain.connect(self.trackGain[1]);
        self.trackGain[1].connect(self.mixGain);
        node.start(self.audioContext.currentTime);
        node.stop(self.audioContext.currentTime + 0.2);
      } else if (key == '65') {
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
          this.gains[i].connect(self.trackGain[2]);
          self.trackGain[2].connect(self.mixGain);
          // this.gains[i].connect(self.audioContext.destination);
          this.oscs[i].start(self.audioContext.currentTime);
          this.oscs[i].stop(self.audioContext.currentTime + 0.5);
        }
        // self.mixGain.gain.value = 0.5;
      } else if (key == '32') {
        self.togglePlay()
      }
    },
    listenForKeys: function() {
      // Keystrokes
      var self = this
      document.addEventListener("keydown", function(event) {
        // if (event.which == '65') {
        // TODO: play the custom sounds on keypresses - start
        
        // if (self.shouldPlayCustom[1]) {
        //   // Stop the audio source before starting it again
        //   self.stopSource(self.dropIndex)
        //   // Play the audio source before starting it again
        //   self.playCustomSound(1)
        //   // console.log('custom souuuuuund')
        //   // TODO: set play flag to true
        // }
        // // or play default hihat sound
        // else {
        //   // snare
        //   self.playSound('83');
        // }

        // TODO: play the custom sounds on keypresses - end
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
      if (target.name == 'Scale') {
        // self.curScale = self.scales[target.value]
        self.curScale = target.value == 0 ? self.scales.c2 : self.scales.arabic
        console.log('changing scale')
      }
      if (target.name == 'Volume') {
        synthGainValue = target.value;
        // self.snd.sourceGain[0].gain.value = target.value;
        // self.snd.sourceGain[1].gain.value = target.value;
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