<template lang="pug">
  div.seq-button(v-bind:class="class_name" v-bind:id="id")
</template>

<script>
export default {
  name: 'Cell',
  props: ['class_name', 'id'],
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

</style>

