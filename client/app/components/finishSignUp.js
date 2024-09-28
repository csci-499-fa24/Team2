import { useEffect, useState } from 'react';
import style from '../page.module.css';

const FinishSignUp = () => {
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode'); 
    const email = localStorage.getItem('emailForSignIn'); 

    if (oobCode && email && url) {
      setFetched(true);
      fetch('http://localhost:8080/api/signin', {
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
