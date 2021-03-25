<template lang="pug">
  header
    .block.logo-text
      h1 Ryfm
      p by Konrad Studio
    .block
      //- .control-section.play-toggle(@click="togglePlay")
      //-   .play-button
      //-     .play-icon.stop(ref="play_icon")
      a-tooltip(placement="bottom" :mouseEnterDelay="0.65")
        template(slot="title")
          span Save the session
        .button.btn-icon.icon.save(@click="saveSession")
    .block
      LoadSession(v-show="this.$store.getters.isAuthenticated")
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

import LoadSession from '@/components/LoadSession';
import User from '@/components/User';
// import { Popover } from 'antd';

export default {
  name: 'Header',
  data () {
    return {
      playIcon: ''
    }
  },
  components: {
    LoadSession,
    User
  },
  mounted() {
    // console.log('store')
    // console.log(this.$store.getters.isAuthenticated)
    // self.playIcon = self.$refs.play_icon
  },
  methods: {
    saveSession() {
      this.$nuxt.$emit('save-session', 1)
    },
    togglePlay() {
      // this.$nuxt.$emit('toggle-play', 1)
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
  // padding-right: 56px;
  .block {
    display: flex;
    align-items: center;
    justify-content: center;
    &.logo-text {
      flex-direction: column;
      // align-items: baseline;
      height: 28px;
      h1, p {
        height: 100%;
      }
      h1 {
        // line-height: 0;
      }
      p {
        margin-top: 4px;
        // line-height: 0;
      }
    }
  }
}

</style>