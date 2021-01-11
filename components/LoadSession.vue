<template lang="pug">
  a-select(default-value='Load a session' style='width: 200px' @change='handleChange')
    a-select-option(v-for="(ses, index) in allSessionData" :key="`${ses}`" :value="String(ses)") {{ index }}
</template>

<script>

// import { Popover } from 'antd';
// import UserSignIn from '@/components/UserSignIn';
// import UserSignup from '@/components/UserSignUp';

export default {
  name: 'LoadSession',
  data() {
    return {
      allSessionData: []
    }
  },
  mounted() {
    var self = this
    // Listen for when sessions are loaded
    self.$nuxt.$on('sessions-loaded', (data) => {
      console.log('sessions are loaded: ', data)
      this.allSessionData = data
    })
  },
  methods: {
    handleChange(value) {
      var self = this
      console.log(value)
    }
  }
}
</script>

<style lang="scss" scoped>

.popover {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 56px;
  .input-row {
    display: flex;
    -ms-flex-direction: column;
  }
}

</style>