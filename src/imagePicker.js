<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC0m2u7NNGaxNxnukDHCbaIUFkSDuSMYgk",
    authDomain: "colorscope.firebaseapp.com",
    projectId: "colorscope",
    storageBucket: "colorscope.firebasestorage.app",
    messagingSenderId: "793058404145",
    appId: "1:793058404145:web:4a937709d3adde789ab210",
    measurementId: "G-5QPQQZW1Y5"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>