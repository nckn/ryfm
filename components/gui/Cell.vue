<template lang="pug">
  div.seq-button(v-bind:class="class_name" v-bind:id="id" @click="affectCell")
</template>

<script>
export default {
  name: 'Cell',
  props: ['class_name', 'id'],
  data () {
    return {
      active: false
    }
  },
  mounted() {
    var self = this
    // self.setupAudioContext()
  },
  methods: {
    affectCell: function(e) {
      var self = this
      var target = e.target || e.scrElement
      console.log(e.target)
      if (target.classList.contains('assigned')) {
        target.classList.remove("assigned");
      } else {
        target.classList.add("assigned");
      }
    }
  }
}

</script>

<style lang="scss" scoped>

</style>

