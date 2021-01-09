import firebase from 'firebase/app'
import 'firebase/auth'

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD6a231GQIH_W1c_gpPhDF4RfokZkvURpY",
  authDomain: "ryfm-55887.firebaseapp.com",
  projectId: "ryfm-55887",
  storageBucket: "ryfm-55887.appspot.com",
  messagingSenderId: "703557553948",
  appId: "1:703557553948:web:090af3c75dcebcd65af4d9",
  measurementId: "G-ECWXQ7VFZX"
};
// Initialize Firebase
!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : ''
// firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export const auth = firebase.auth()
export default firebase
