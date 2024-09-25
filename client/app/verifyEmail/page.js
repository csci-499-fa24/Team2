"use client";

import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '../lib/firebaseClient';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
          const firebaseAuth = await initializeFirebase();
          setAuth(firebaseAuth);
          console.log('Firebase initialized successfully', firebaseAuth);
      } catch (error) {
          console.error('Error initializing Firebase:', error);
      }
    };

    initFirebase();

    const CompleteSignIn = async() => {
      const url = window.location.href;
      if (isSignInWithEmailLink(auth, url)) {
        const storedEmail = window.localStorage.getItem('emailForSignIn') ;
        if (!storedEmail) {
          const email = prompt('Please enter your email again');
          setEmail(email);
        }else {
          setEmail(storedEmail);
        }

        try {
          const response = await fetch('/api/completeSignin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, url }), 
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log('Successfully signed in:', data.user);
          alert('Successfully signed in!');
          window.localStorage.removeItem('emailForSignIn');
        } catch (error) {
            console.error('Error signing in:', error);
        }
      }
    }

    CompleteSignIn();
  }, []);

  const additionalVerification = async(token) => {
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error verifying email:', error));
  }

  return(
    <div>
      {auth ? <p>Firebase Auth initialized!</p>:<p>Loading Firebase Auth...</p>}
    </div>
  );
};

export default VerifyEmail;