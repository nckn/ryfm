<template lang="pug">
  div.seq-button.sixteen-buttons(v-bind:class="{ assigned: isgreen === 1}" v-bind:id="id" @click="affectCell" v-bind:active="isgreen === 1")
</template>

<script>
export default {
  name: 'Cell',
  props: ['class_name', 'id', 'isgreen'],
  data () {
    return {
      active: false
    }
  },
  mounted() {
    var self = this
    // self.setupAudioContext()
    console.log('heres a cell')
    console.log(this.isgreen)
  },
  methods: {
    affectCell: function(e) {
      var self = this
      var target = e.target || e.scrElement
      // console.log(e.target)
      if (target.classList.contains('assigned')) {
        target.classList.remove("assigned");
        target.removeAttribute('active')
      } else {
        target.classList.add("assigned");
        target.setAttribute('active', true)
      }
    }
  }
}

</script>

<style lang="scss" scoped>

</style>

