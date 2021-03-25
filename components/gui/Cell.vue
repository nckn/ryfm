<template lang="pug">
  div.seq-button.sixteen-buttons(
    :id="id"
    :row_id="row_id"
    v-bind:active="is_active"
    v-bind:class="{ assigned: is_active}"
    @touchstart="affectCell"
    @mousedown="affectCell"
    @dblclick="makeSpecial"
  )
</template>

<script>
export default {
  name: 'Cell',
  props: ['class_name', 'id', 'is_active', 'row_id'],
  data () {
    return {
      active: false,
      mouseMoveIsSet: false
    }
  },
  mounted() {
    var self = this
    // self.setupAudioContext()
    var theHoverELem = document.querySelector('.sequencer')
  },
  methods: {
    makeSpecial (e) {
      // console.log('double click')
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
        if (self.mouseMoveIsSet)
          return
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
      // Tell parent to remake sequence
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

