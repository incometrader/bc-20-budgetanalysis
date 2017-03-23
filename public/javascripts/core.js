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
  function offAlert() {
    if (document.getElementById('success-alert').style.display === 'block') {
      document.getElementById('success-alert').style.display = 'none';
    }
    document.getElementById('danger-alert').style.display = 'none';
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in');
      console.log(user);
    } else {
      console.log('No User');
    }
  });
  if (window.location.pathname !== '/dashboard') {
    document.getElementById('signout-nav').addEventListener('click', signOut);
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
    document.getElementById('logout-nav').addEventListener('click', signOut);
    // Display Envelopes and User
    const envelopesList = document.getElementById('envelopes-para');
    const usersRef = database.ref('users');
    const envelopesRef = database.ref('envelopes');
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        usersRef.child(userId).on('value', (snapshot) => {
          const username = snapshot.val().username;
          const names = document.getElementsByClassName('user-name');
          for (let i = 0; i < names.length; i += 1) {
            names[i].textContent = username;
          }
        }, (error) => {
          console.log(`Error: ${error.code}`);
        });
        envelopesRef.child(userId).on('value', (snapshot) => {
          snapshot.forEach((data) => {
            let amount = data.val().amt;
            let priority = data.val().pr;
            let name = data.val().name;
            let envelope = document.createElement('div');
            envelope.classList.add('list-group-item');
            envelope.innerHTML = `<div class="row-content">
                                    <div class="action-secondary"><a><i class="material-icons">mode edit</i></a></div>
                                    <p class="list-group-item-text">${name}</p>
                                    <p class="list-group-item-text">${amount}</p>
                                  </div>`;
            envelopesList.appendChild(envelope);
            console.log(envelope);
          });
          console.log(snapshot.val());
        }, (error) => {
          console.log(`Error: ${error.code}`);
        });
      }
    });

    // Create New Envelope
    const envelopeForm = document.getElementById('envelope-form');
    envelopeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      auth.onAuthStateChanged((user) => {
        if (user) {
          const userId = user.uid;
          const envelopeName = document.getElementById('envelope-name').value;
          const envelopeAmt = document.getElementById('envelope-amt').value;
          const envelopePr = document.getElementById('envelope-pr').value;
          database.ref('envelopes/').child(userId).push({
            name: envelopeName,
            amt: envelopeAmt,
            pr: envelopePr
          }, (err) => {
            if (err) {
              document.getElementsById('danger-alert').style.display = 'block';
              document.getElementById('close-button').click();
              setTimeout(offAlert, 4000);
            } else {
              document.getElementById('success-alert').style.display = 'block';
              document.getElementById('close-button').click();
              setTimeout(offAlert, 4000);
            }
          });
        } else {
          console.log('No User');
        }
      });
    });
  }
};
