
const firebaseConfig = {
  apiKey: "AIzaSyBSc-VjMRCYg9tB6Zrq76VShdUqI3mfr9k",
  authDomain: "coriurbooking.firebaseapp.com",
  projectId: "coriurbooking",
  storageBucket: "coriurbooking.appspot.com",
  messagingSenderId: "535738706685",
  appId: "1:535738706685:web:c9f6826c10789c46442c94",
  measurementId: "G-PJB7D96TTH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
