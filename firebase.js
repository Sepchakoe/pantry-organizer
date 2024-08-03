// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYdZSy_35LPN6vGkFLAa445YqEjA7SrDI",
  authDomain: "inventory-management-app-6de17.firebaseapp.com",
  projectId: "inventory-management-app-6de17",
  storageBucket: "inventory-management-app-6de17.appspot.com",
  messagingSenderId: "72511133572",
  appId: "1:72511133572:web:504d21446d8590e76cefd1",
  measurementId: "G-Q63ZHRPEY0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export{firestore}