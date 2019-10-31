<template lang="pug">
  div.slider-wrapper(v-bind:class="class_name")
    div.slider-row
      label {{ slider_name }}
      label.value.synth-output(v-if="class_name === 'switch'" v-bind:class="oscTypes[sliderValue]")
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
      oscTypes: ['sine', 'square', 'sawtooth', 'triangle']
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

$slider-bg: #efefef;

.slider-wrapper { background: $slider-bg; }

@mixin makeBackground($path) {
  background: url($path) no-repeat;
  background-size: 24px;
  background-position: center;
  // @media screen and (min-width: 768px) {
  //   background-position: center 80%;
  // }
}

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
  .slider-row {
    display: flex;
    align-items: center;
    // justify-content: flex-start;
    justify-content: space-between;
    padding-right: 12px;
    padding-left: 12px;
    .value {
      // width: 20px;
      text-align: right;
      position: relative;
      &.synth-output {
        &:before {
          content: '';
          width: 24px;
          height: 24px;
          position: absolute;
          top: -11px;
          right: 0;
          @include makeBackground('/svg/icon-sine.svg');
        }
        &.sine:before { @include makeBackground('/svg/icon-sine.svg'); }
        &.square:before { @include makeBackground('/svg/icon-square.svg'); }
        &.sawtooth:before { @include makeBackground('/svg/icon-sawtooth.svg'); }
        &.triangle:before { @include makeBackground('/svg/icon-triangle.svg'); }
      }
    }
  }
  label {
    font-size: 12px;
    letter-spacing: 1;
  }
  // padding: 20px; margin-right: 20px;
}

</style>