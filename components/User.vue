<template lang="pug">
  a-popover(placement='bottomRight' trigger='click' v-bind:class="'popover'")
    template(slot="content")
      .p-6.container.mx-auto.shadow-md(class='w-1/5')
        form(@submit.prevent='userSignUp')
          h2.mb-2.text-xl.text-green-500.font-bold Sign Up
          .input-row
            label.block.mb-2.text-gray-500(for='email') Email
            input#email.border.w-full.px-2.py-1(type='text' v-model='email')
          .input-row
            label.block.mb-2.text-gray-500(for='password') Password
            input#password.border.w-full.px-2.py-1(type='password' v-model='password')
          button.bg-green-500.text-white.uppercase.py-2.w-full.shadow Sign Up
    .button.btn-icon.icon.avatar
</template>

<script>

// import { Popover } from 'antd';
// import UserSignIn from '@/components/UserSignIn';
// import UserSignup from '@/components/UserSignUp';

export default {
  name: 'User',
  components: {
    // UserSignIn,
    // UserSignup,
  },
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
  padding-right: 56px;
  .input-row {
    display: flex;
    -ms-flex-direction: column;
  }
}

</style>