import firebase from "firebase/app";
import "firebase/firebase-firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAv7WSwRw8pYp3d6GodHQEi3VqbjObO3bg",
  authDomain: "pet-hotel-abf31.firebaseapp.com",
  databaseURL:
    "https://pet-hotel-abf31-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pet-hotel-abf31",
  storageBucket: "pet-hotel-abf31.appspot.com",
  messagingSenderId: "1010491416106",
  appId: "1:1010491416106:web:494746e797f505de2bad53",
  measurementId: "G-75Y978F7TM"
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();

export default firebase;
