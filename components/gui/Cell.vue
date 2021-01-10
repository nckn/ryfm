<template lang="pug">
  div.seq-button.sixteen-buttons(v-bind:class="{ assigned: isgreen === 1}" :id="id" @click="affectCell" v-bind:active="isgreen === 1" @dblclick="makeSpecial" :row_id="row_id")
</template>

<script>
export default {
  name: 'Cell',
  props: ['class_name', 'id', 'isgreen', 'row_id'],
  data () {
    return {
      active: false
    }
  },
  mounted() {
    var self = this
    // self.setupAudioContext()
    // console.log('heres a cell')
    // console.log(this.isgreen)
  },
  methods: {
    makeSpecial (e) {
      console.log('double click')
      var self = this
      var target = e.target || e.scrElement
      if (target.classList.contains('dbl')) {
        target.classList.remove("dbl");
        target.removeAttribute('active')
      } else {
        target.classList.add("dbl");
        target.setAttribute('active', true)
      }
    },
    affectCell: function(e) {
      var self = this
      var target = e.target || e.scrElement
      var rowId = parseInt(target.getAttribute('row_id'))
      var cellId = parseInt(target.getAttribute('id'))
      // console.log(e.target)
      if (target.classList.contains('assigned')) {
        target.classList.remove("assigned");
        target.removeAttribute('active')
      } else {
        target.classList.add("assigned");
        target.setAttribute('active', true)
      }
      // console.log(rowId, cellId)
      let cell = {
        rowId: rowId,
        cellId: cellId
      }
      this.$parent.changeSequence(cell)
    }
  }
}

</script>

<style lang="scss" scoped>

.seq-button {
  &.dbl {
    background: #7cb0de;
  }
}

</style>

