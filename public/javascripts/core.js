window.onload = () => {
  // Initialize Firebase
  const config = {
    apiKey: 'AIzaSyBRWkuFbnDnlBlmJqywQRFhJ763d50h7tM',
    authDomain: 'coolbudget-cc15d.firebaseapp.com',
    databaseURL: 'https://coolbudget-cc15d.firebaseio.com',
    storageBucket: 'coolbudget-cc15d.appspot.com',
    messagingSenderId: '400310004398',
  };
  firebase.initializeApp(config);
  // Reference for Firebase Services
  const database = firebase.database();
  const auth = firebase.auth();
  // Firebase UI Object for Google and Facebook Sign In
  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/dashboard',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
    tosUrl: '/',
  };
  // Function to write User Data to Database
  function writeUserData(uid, fname, email) {
    database.ref('users/').child(uid).set({
      username: fname,
      email
    });
  }
  // Function to Sign Out User
  function signOut() {
    auth.signOut().then(() => {
      window.localStorage.user = undefined;
      console.log('Signed Out');
      alert('You have signed out');
      window.location = '/';
    }, (error) => {
      console.error('Sign Out Error', error);
    });
  }
  // Function to Sign Up User
  function handleSignUp() {
    const fname = document.getElementById('fname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const emailHelp = document.getElementById('email_help');
    const passwordHelp = document.getElementById('password_help');

    if (email.length < 6) {
      passwordHelp.textContent = '';
      emailHelp.textContent = 'Email should have up to 6 characters';
      return false;
    }
    if (password.length < 6) {
      emailHelp.textContent = '';
      passwordHelp.textContent = 'Password should have up to 6 characters';
      return false;
    }
    auth.createUserWithEmailAndPassword(email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          emailHelp.textContent = '';
          passwordHelp.textContent = 'Password is too weak';
        } else {
          passwordHelp.textContent = '';
          emailHelp.textContent = errorMessage;
        }
      });
    auth.onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
        writeUserData(uid, fname, email);
        window.location.pathname = '/dashboard';
      } else {
        console.log('User is signed out');
      }
    });
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in');
      console.log(user);
    } else {
      console.log('No User');
    }
  });
  document.getElementById('signout-nav').addEventListener('click', signOut);
  // const signoutNavs = document.getElementsByClassName('signout-nav');
  // for (let i = 0; i < signoutNavs.length; i += 1) {
  //   signoutNavs[i].addEventListener('click', signOut);
  // }
  // Code to load for Signup page
  if (window.location.pathname === '/signup') {
    const signupForm = document.getElementById('register-form');
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSignUp();
    });
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
    auth.onAuthStateChanged((user) => {
      if (user) {
        const name = user.displayName;
        const username = name.match(/\w+(?=\s)/)[0];
        const email = user.email;
        const emailVerified = user.emailVerified;
        const uid = user.uid;
        writeUserData(uid, username, email);
      } else {
        console.log('User is signed out');
      }
    });
  }
  // Code to load for Dashboard Page
  if (window.location.pathname === '/dashboard') {
    // document.getElementById('logout-nav').addEventListener('click', signOut);
  }
};
