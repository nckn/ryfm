<template lang="pug">
  a-popover.popover(placement='bottomRight' title='{text}' content='{content}' trigger='click')
    .button.btn-icon.icon.avatar
</template>

<script>

// import { Popover } from 'antd';

export default {
  name: 'UserSignUp',
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    userSignUp: function(err) {
      this.$store
        .dispatch("signUp", {
          email: this.email,
          password: this.password
        })
        .then(() => {
          this.email = "";
          this.password = "";
          console.log('successful sign up')
          //if you wanted to redirect after sign in you'd do that here with this.$router.push('/pagename')
        })
        .catch(err => {
          alert(err.message);
        });
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
  // padding-right: 56px;
}

</style>