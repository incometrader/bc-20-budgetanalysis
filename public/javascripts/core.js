window.onload = () => {
  const config = {
    apiKey: 'AIzaSyBRWkuFbnDnlBlmJqywQRFhJ763d50h7tM',
    authDomain: 'coolbudget-cc15d.firebaseapp.com',
    databaseURL: 'https://coolbudget-cc15d.firebaseio.com',
    storageBucket: 'coolbudget-cc15d.appspot.com',
    messagingSenderId: '400310004398',
  };

  firebase.initializeApp(config);

  const uiConfig = {
    signInSuccessUrl: '/dashboard',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
    tosUrl: '/',
  };

  const database = firebase.database();
  const auth = firebase.auth();

  function handleSignUp() {
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
        console.log(error);
      });
  }
  // Code to load for Signup page
  if (window.location.pathname === '/signup') {
    const signupForm = document.getElementById('register-form');
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSignUp();
    });
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
  }
  // Code to load for Dashboard Page

};
