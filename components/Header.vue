<template lang="pug">
  header
    .block
      h1 Ryfm
      p by Konrad Studio
    .block
      .button.btn-icon.icon.avatar(@click="saveSession")
    .block
      User
      //- nuxt-link(to="/signin")
      //-   .button.btn-icon.icon.avatar
    //- <div class="signature-box">
    //-   <p>Signature</p>
    //-   <div class="notes sixteen"><p>16</p></div>
    //-   <div class="notes eight current-signature"><p>8</p></div>
    //- </div>
</template>

<script>

import User from '@/components/User';
// import { Popover } from 'antd';

export default {
  components: {
    User
  },
  methods: {
    saveSession() {
      this.$nuxt.$emit('save-session', 1)
    }
  }
}
</script>

<style lang="scss" scoped>

header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 56px;
}

</style>