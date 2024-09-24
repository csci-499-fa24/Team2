import { useEffect } from 'react';

const FinishSignUp = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode'); // Get the oobCode from the URL
    const email = localStorage.getItem('emailForSignIn'); // Retrieve the email

    if (oobCode && email) {
      // Send a request to your API route to verify the link and sign in
      fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, oobCode }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            console.log(data.message); // Successfully signed in
            // Redirect or update the UI accordingly
          }
        })
        .catch(error => console.error('Error:', error));
    }
  }, []);

  return <div>Finishing sign-up...</div>;
};

export default FinishSignUp;
