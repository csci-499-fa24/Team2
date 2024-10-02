import { useEffect, useState } from 'react';
import style from '../page.module.css';
import { useRouter } from 'next/navigation';

const FinishSignUp = () => {
  const [fetched, setFetched] = useState(false);
  console.log(process.env.NEXT_PUBLIC_SERVER_URL);
  const router = useRouter();

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
            console.log("response:", data.message);
            alert('Successfully signed in!');
            // router.push('/user/'+ data.user.uid);
          }
        })
        .catch(error => console.error('Error:', error));
    }
  }, []);

  return (
    <div className={style.signingUpMessage}>
      {fetched ? <p>Signing you in...</p>: null}
    </div>);
};

export default FinishSignUp;
