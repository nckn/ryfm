<template lang="pug">
form.signin-container(@submit.prevent="userSignIn")
  h2.mb-2.text-xl.text-green-500.font-bold Sign In
  .mb-4
    label.block.mb-2.text-gray-500(for="email") Email
    input#email.border.w-full.px-2.py-1(type="text", v-model="email")
  .mb-4
    label.block.mb-2.text-gray-500(for="password") Password
    input#password.border.w-full.px-2.py-1(type="password", v-model="password")
  button.bg-green-500.text-white.uppercase.py-2.w-full.shadow Sign In
</template>

<script>
// import { Popover } from 'antd';

export default {
  name: "UserSignIn",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    userSignIn: function (err) {
      this.$store
        .dispatch("signInWithEmail", {
          email: this.email,
          password: this.password,
        })
        .then(() => {
          this.email = "";
          this.password = "";
        })
        .catch((err) => {
          alert(err.message);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.signin-container {
  // width: 100%;
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
  // padding-right: 56px;
}
</style>