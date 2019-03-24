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
      console.log(e.target)
      if (e.target.classList.contains('assigned')) {
        e.target.classList.remove("assigned");
      } else {
        e.target.classList.add("assigned");
      }
    }
  }
}

</script>

<style lang="scss" scoped>

</style>

