window.onload = () => {
  let sumTotal = 0;
  let sumEnvelope = 0;

  // Initialize Firebase
  const config = {
    apiKey: 'AIzaSyBRWkuFbnDnlBlmJqywQRFhJ763d50h7tM',
    authDomain: 'coolbudget-cc15d.firebaseapp.com',
    databaseURL: 'https://coolbudget-cc15d.firebaseio.com',
    storageBucket: 'coolbudget-cc15d.appspot.com',
    messagingSenderId: '400310004398',
  };
  firebase.initializeApp(config);
  const database = firebase.database();
  const auth = firebase.auth();

   // Function to write User Data to Database
  function writeUserData(uid, fname, email) {
    database.ref('users/').child(uid).set({
      username: fname,
      email,
    });
  }

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

  // Store user info on Local Storage
  function storeUserInfo(uid, username, email) {
    window.localStorage.setItem('user', uid);
    window.localStorage.setItem('email', email);
    window.localStorage.setItem('username', username);
  }

  // Function to Sign Out User
  function signOut() {
    auth.signOut().then(() => {
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('email');
      window.localStorage.removeItem('username');
      console.log('Signed Out');
      window.location = '/';
    });
  }
  // Function to Sign Up User
  function handleSignUp() {
    const username = document.getElementById('fname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const usernameHelp = document.getElementById('fname_help');
    const emailHelp = document.getElementById('email_help');
    const passwordHelp = document.getElementById('password_help');

    if (username.length < 2) {
      usernameHelp.textContent = 'Please enter a valid username';
    } else {
      usernameHelp.textContent = '';
    }

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
        writeUserData(uid, username, email);
        storeUserInfo(uid, username, email);
        window.location.pathname = '/dashboard';
      }
    });
  }

  // Sign In User
  function handleSignIn() {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    } else {
      const email = document.getElementById('email2').value;
      const password = document.getElementById('password2').value;
      const emailHelp = document.getElementById('email_help2');
      const passwordHelp = document.getElementById('password_help2');
      if (email.length < 6) {
        passwordHelp.textContent = '';
        emailHelp.textContent = 'Please enter an email address.';
        return false;
      }
      if (password.length < 6) {
        emailHelp.textContent = '';
        passwordHelp.textContent = 'Please enter a correct password';
        return false;
      }
      auth.signInWithEmailAndPassword(email, password).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          emailHelp.textContent = '';
          passwordHelp.textContent = 'Wrong password';
        } else {
          passwordHelp.textContent = '';
          emailHelp.textContent = errorMessage;
        }
        console.log(error);
        auth.onAuthStateChanged((user) => {
          if (user) {
            window.location.pathname = '/dashboard';
          }
        });
      });
    }
  }

  function isLoggedIn() {
    const signIn = document.getElementById('signin-nav');
    const signUp = document.getElementById('signup-nav');
    const logOut = document.getElementById('signout-nav');
    const dash = document.getElementById('dashboard-nav');
    if (window.localStorage.user) {
      signIn.style.display = 'none';
      signUp.style.display = 'none';
      logOut.style.display = 'block';
      dash.style.display = 'block';
    } else {
      signIn.style.display = 'block';
      signUp.style.display = 'block';
      logOut.style.display = 'none';
      dash.style.display = 'none';
    }
  }

  // Off Envelope Added Notification
  function offAlert() {
    if (document.getElementById('success-alert').style.display === 'block') {
      document.getElementById('success-alert').style.display = 'none';
    }
    document.getElementById('danger-alert').style.display = 'none';
  }
  // Off Income Added Notification
  function offIncomeAlert() {
    if (document.getElementById('success-alert2').style.display === 'block') {
      document.getElementById('success-alert2').style.display = 'none';
    }
    document.getElementById('danger-alert2').style.display = 'none';
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
    isLoggedIn();
  }
  // Code to load for Signin page
  if (window.location.pathname === '/signin') {
    const signinForm = document.getElementById('login-form');
    signinForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSignIn();
    });
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
  }

  // Get Total Income
  function totalIncome() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        const incomeRef = database.ref('incomes');
        return incomeRef.child(userId).once('value', (snapshot) => {
          snapshot.forEach((data) => {
            const amount = data.val().amt;
            sumTotal += +amount;
          });
          const incomeTotal = document.getElementById('total-income');
          incomeTotal.textContent = sumTotal;
          if (sumTotal === 0) {
            const budgetReport = document.getElementById('budget-report');
            budgetReport.textContent = 'You have not added your income';
          }
          return sumTotal;
        }, (error) => {
          console.log(`Error: ${error.code}`);
        });
      }
    });
  }
  // Get Total Envelope
  function totalEnvelope() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        const envelopeRef = database.ref('envelopes/' + userId);
        for (let i = 0; i < 11; i += 1) {
          if (envelopeRef.child(i)) {
            envelopeRef.child(i).once('value', (snapshot) => {
              snapshot.forEach((data) => {
                const amount = data.val().amt;
                sumEnvelope += +amount;
              });
              const envelopeTotal = document.getElementById('total-envelope');
              envelopeTotal.textContent = sumEnvelope;
              return sumEnvelope;
            }, (error) => {
              console.log(`Error: ${error.code}`);
            });
          }
        }
      }
    });
  }

  function analyseBudget() {
    const income = document.getElementById('total-income');
    const envelope = document.getElementById('total-envelope');
    const incomeVal = parseInt(income.textContent, 10);
    const envelopeVal = parseInt(envelope.textContent, 10);
    console.log(`Income ${typeof incomeVal} ${incomeVal}`);
    console.log(`Envelope ${typeof envelopeVal} ${envelopeVal}`);
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
        const uid = user.uid;
        writeUserData(uid, username, email);
        storeUserInfo(uid, username, email);
      } else {
        console.log('User is signed out');
      }
    });
  }

  // Code to load for Dashboard Page
  if (window.location.pathname === '/dashboard') {
    document.getElementById('logout-nav').addEventListener('click', signOut);
    document.getElementById('income-btn').addEventListener('click', () => {
      document.getElementById('add-income').click();
    });
    document.getElementById('envelope-btn').addEventListener('click', () => {
      document.getElementById('add-envelope').click();
    });
    // Analyse Budget
    totalIncome();
    totalEnvelope();

    // Add Income
    const incomeForm = document.getElementById('income-form');
    incomeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      auth.onAuthStateChanged((user) => {
        if (user) {
          const userId = user.uid;
          const incomeName = document.getElementById('income-name').value;
          const incomeAmt = document.getElementById('income-amt').value;
          const incomeNotes = document.getElementById('income-notes').value;
          localStorage.setItem('income', incomeName);
          localStorage.setItem('amount', incomeAmt);
          database.ref('incomes').child(userId).push({
            name: incomeName,
            amt: incomeAmt,
            notes: incomeNotes
          }, (err) => {
            if (err) {
              document.getElementsById('danger-alert2').style.display = 'block';
              document.getElementById('close-button-income').click();
              setTimeout(offIncomeAlert, 4000);
            } else {
              document.getElementById('success-alert2').style.display = 'block';
              document.getElementById('close-button-income').click();
              setTimeout(offIncomeAlert, 4000);
              const incLocalName = localStorage.getItem('income');
              const incLocalAmt = localStorage.getItem('amount');
              const incLocal = document.createElement('div');
              incLocal.classList.add('panel-body');
              incLocal.setAttribute('id', 'incomes-para');
              incLocal.innerHTML = `<p>${incLocalName}</p><span>${incLocalAmt}</span>`;
              document.getElementById('income-group').appendChild(incLocal);
            }
          });
        } else {
          console.log('No User');
        }
      });
    });
    // Display Income
    const incomesList = document.getElementById('income-group');
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        const incomesRef = database.ref('incomes');
        incomesRef.child(userId).once('value', (snapshot) => {
          snapshot.forEach((data) => {
            const amount = data.val().amt;
            const name = data.val().name;
            const income = document.createElement('div');
            income.classList.add('panel-body');
            income.setAttribute('id', 'incomes-para');
            income.innerHTML = `<p>${name}</p><span>${amount}</span>`;
            incomesList.appendChild(income);
          });
        }, (error) => {
          console.log(`Error: ${error.code}`);
        });
      }
    });
    // Display User
    const username = localStorage.getItem('username');
    const names = document.getElementsByClassName('user-name');
    for (let i = 0; i < names.length; i += 1) {
      names[i].textContent = username;
    }
    // Display Envelopes
    const envelopesList = document.getElementById('envelopes-para');
    const usersRef = database.ref('users');
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userId = user.uid;
        const envelopesRef = database.ref('envelopes/' + userId);
        for (let i = 0; i < 11; i += 1) {
          if (envelopesRef.child(i)) {
            envelopesRef.child(i).once('value', (snapshot) => {
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
              });
            }, (error) => {
              console.log(`Error: ${error.code}`);
            });
          }
        }
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
          localStorage.setItem('name', envelopeName);
          localStorage.setItem('amt', envelopeAmt);
          database.ref('envelopes/' + userId).child(envelopePr).push({
            name: envelopeName,
            amt: envelopeAmt
          }, (err) => {
            if (err) {
              document.getElementsById('danger-alert').style.display = 'block';
              document.getElementById('close-button').click();
              setTimeout(offAlert, 4000);
            } else {
              document.getElementById('success-alert').style.display = 'block';
              document.getElementById('close-button').click();
              setTimeout(offAlert, 4000);
              const envLocalName = localStorage.getItem('name');
              const envLocalAmt = localStorage.getItem('amt');
              const envLocal = document.createElement('div');
              envLocal.classList.add('list-group-item');
              envLocal.innerHTML = `<div class="row-content">
                                      <div class="action-secondary"><a><i class="material-icons">mode edit</i></a></div>
                                      <p class="list-group-item-text">${envLocalName}</p>
                                      <p class="list-group-item-text">${envLocalAmt}</p>
                                    </div>`;
              envelopesList.appendChild(envLocal);
            }
          });
        } else {
          console.log('No User');
        }
      });
    });
  }
};
