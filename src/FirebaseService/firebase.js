import * as firebase from 'firebase';


// firebase config.
const firebaseConfig = {
  apiKey: "AIzaSyA8mMFWdV6Va_NFc9r4eGTR9xz5bKgzwwc",
  authDomain: "lets-chat-here.firebaseapp.com",
  databaseURL: "https://lets-chat-here.firebaseio.com",
  projectId: "lets-chat-here",
  storageBucket: "lets-chat-here.appspot.com",
  messagingSenderId: "123787944969",
  appId: "1:123787944969:web:19c190a399e7d9337704d8",
  measurementId: "G-L3DW30JSBB"
};

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

export default firebase;
