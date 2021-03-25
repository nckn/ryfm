<template lang="pug">
  a-popover(placement='bottomRight' trigger='click' v-bind:class="'popover'")
    template(slot="content")
      //- Sign in - start
      form.signin-container(@submit.prevent="userSignIn" v-show="isSignIn")
        h3 Sign In
        .input-row
          label(for="email") Email
          input#email(type="text", v-model="email")
        .input-row
          label(for="password") Password
          input#password(type="password", v-model="password")
        .input-row
          button Sign In
        //- button Or sign up
      //- Sign in - end
      //- Sign up - start
      form(@submit.prevent='userSignUp' v-show="!isSignIn")
        h2.mb-2.text-xl.text-green-500.font-bold Sign Up
        .input-row
          label.block.mb-2.text-gray-500(for='email') Email
          input#email.border.w-full.px-2.py-1(type='text' v-model='email')
        .input-row
          label.block.mb-2.text-gray-500(for='password') Password
          input#password.border.w-full.px-2.py-1(type='password' v-model='password')
        button.bg-green-500.text-white.uppercase.py-2.w-full.shadow Sign Up
      //- Sign up - end
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
      isSignIn: true
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
    },
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
  .input-row {
    display: flex;
    -ms-flex-direction: column;
  }
}

.ant-popover-inner-content {
  padding: 24px;
  box-sizing: border-box;
}

// Styling inputs here to make it more clear
.signin-container {
  .input-row {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    &:not(:last-child) {
      margin-bottom: 24px;
    }
    input {
      outline: none;
      border: none;
      background: #f5f5f5;
      height: 32px;
      -webkit-appearance: none;
      &[type=text] {
        // font-family: 'WorkSansReg', sans-serif;
        border-radius: 3px;
        padding: 0 12px;
        box-sizing: border-box;
      }
      &[type=submit] {
        // font-family: 'WorkSansExtraBold', sans-serif;
        font-size: 1rem;
        border-radius: 2px;
        text-transform: uppercase;
        padding: 0 18px;
      }
    }
    button {
      outline: none;
      border: none;
      background: #050505;
      height: 32px;
      -webkit-appearance: none;
      color: #d5d5d5;
      border-radius: 2px;
    }    
  }
  .ryfm-checkbox {
    display: block;
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    // color: $color-primary-000;
    // font-size: $font-size-base;
    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
      /* When the checkbox is checked, add a blue background */
      &:checked ~ .checkmark {
        background-color: #2196F3;
        &:after {
          display: block;
        }
      }
    }
    /* Create a custom checkbox */
    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 25px;
      width: 25px;
      background-color: #eee;
      border-radius: 2px;
      /* Create the checkmark/indicator (hidden when not checked) */
      &:after {
        content: "";
        position: absolute;
        display: none;
        left: 9px;
        top: 5px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
      }
    }
    &:hover input ~ .checkmark {
      background-color: #ccc;
    }
  }
}

</style>