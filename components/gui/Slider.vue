<template lang="pug">
  div.slider-wrapper(v-bind:class="class_name")
    div.slider-row
      label {{ slider_name }}
      label.value.osc-output(v-if="class_name === 'switch'" v-bind:class="oscTypes[sliderValue]")
      label.value.osc-output(v-else-if="class_name === 'switch scale'" v-bind:class="scaleType[sliderValue]")
      label.value.synth-output(v-else) {{ sliderValue }}
    div.slider-row
      input.slider(:name='`${slider_name}`', type='range', :min="min", :max="max", :step="step", :value="sliderValue" @input="changeValue" ref="slider_name")
</template>

<script>
export default {
  name: 'Slider',
  props: ['slider_name', 'min', 'max', 'value', 'step', 'class_name'],
  data () {
    return {
      // sliderValue: this.value
      sliderValue: this.value,
      outputValue: '-',
      oscTypes: ['sine', 'square', 'sawtooth', 'triangle'],
      scaleType: ['cmajor', 'arabic']
    }
  },
  mounted() {
    var self = this
    // self.setupAudioContext()
  },
  methods: {
    changeValue: function(e) {
      var self = this
      e.preventDefault();
      var target = e.target || e.srcElement
      // console.log(target.value)
      self.sliderValue = target.value
      if (target.name == 'Kick' || target.name == 'Snare' || target.name == 'Filter') {
        self.$parent.tweakSounds(target)
      } else {
        self.$parent.changeParam(target)
      }
      self.makeValue()
      // self.value = target.value
      // requestAnimationFrame(self.performAnimation)
      // cancelAnimationFrame(request) //stop the animation
    },
    makeValue () {
      var self = this
      self.outputValue = self.sliderValue
    }
  }
}

</script>

<style lang="scss" scoped>

// $slider-bg: #efefef;
$slider-bg: rgba(235, 235, 235, 0);

.slider-wrapper { background: $slider-bg; }

.slider-wrapper {
  // width: 200px;
  // height: 60px;
  float: left;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  border-radius: 2px;
  flex: auto;
  // margin-right: 12px;
  // &:not(:last-child) {
  // }
  -webkit-transition: background 0.2s;
  transition: background 0.2s;
  &:hover {
    // -webkit-box-shadow: 0px 3px 4px -2px rgba(0,0,0,0.15);
    // -moz-box-shadow: 0px 3px 4px -2px rgba(0,0,0,0.15);
    // box-shadow: 0px 3px 4px -2px rgba(0,0,0,0.15);
    background: lighten($slider-bg, 2%);
  }
  &.sm {
    background: none;
  }
  &.switch {
    //
  }
  
  label {
    font-size: 12px;
    letter-spacing: 1;
  }
  // padding: 20px; margin-right: 20px;
}

</style>