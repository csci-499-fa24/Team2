import { useEffect, useState } from 'react';
import style from '../page.module.css';

const FinishSignUp = () => {
  const [fetched, setFetched] = useState(false);
  console.log(process.env.NEXT_PUBLIC_SERVER_URL);

  useEffect(() => {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode'); 
    const email = localStorage.getItem('emailForSignIn'); 

    if (oobCode && email && url) {
      setFetched(true);
      console.log('Signing in at ', process.env.NEXT_PUBLIC_SERVER_URL + '/api/signin');
      fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, oobCode, url }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            console.log(data.message);
            // Redirect to homepage
            alert('Successfully signed in!');
            window.location.href = '/';
          }
        })
        .catch(error => console.error('Error:', error));
    }
  }, []);

  return (
    <div className={style.signingUpMessage}>
      {fetched ? <p>Finishing sign-up...</p> : null}
    </div>);
};

export default FinishSignUp;
