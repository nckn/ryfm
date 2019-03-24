<template lang="pug">
  div.slider-wrapper
    label {{ slider_name }}
    div.slider-row
      input.slider(:name='`${slider_name}`', type='range', min='30', max='500', step='1', value='50')
      p.value.synth-output --
</template>

<script>
export default {
  name: 'Slider',
  props: ['slider_name'],
  data () {
    return {
      //
    }
  },
  mounted() {
    var self = this
    // self.setupAudioContext()
  },
  methods: {
    // setupAudioContext: function() {
    //   var self = this
    //   console.log(self)
    //   // requestAnimationFrame(self.performAnimation)
    //   // cancelAnimationFrame(request) //stop the animation
    // }
  }
}

</script>

<style lang="scss" scoped>

.slider-wrapper { background: red; }

.slider-wrapper {
  width: 200px;
  height: 60px;
  // background: #e6e6e6;
  float: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .slider-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .value {
      width: 20px;
    }
  }
  label {
    font-size: 12px;
  }
  // padding: 20px; margin-right: 20px;
}

</style>