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
    let emailHelp = document.getElementById('email_help').textContent;
    let passwordHelp = document.getElementById('password_help').textContent;

    if (email.length < 6) {
      passwordHelp = '';
      emailHelp = 'Email should have up to 6 characters';
      return false;
    }
    if (password.length < 6) {
      emailHelp = '';
      passwordHelp = 'Password should have up to 6 characters';
      return false;
    }
    auth.createUserWithEmailAndPassword(email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          emailHelp = '';
          passwordHelp = 'Password is too weak';
        } else {
          passwordHelp = '';
          emailHelp = errorMessage;
        }
        console.log(error);
      });
  }
  if (window.location.pathname === '/signup') {
    const signupForm = document.getElementById('register-form');
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSignUp();
    });
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
  }
};
