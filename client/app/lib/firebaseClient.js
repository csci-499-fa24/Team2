import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const getFirebaseConfig = async () => {
    const response = await fetch('/api/configFirebase', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok){
        console.log('Failed to fetch Firebase config')
    };
    return response.json();
};

const initializeFirebase = async () => {
    const config = await getFirebaseConfig();
    const app = initializeApp(config);
    return getAuth(app);
};

export { initializeFirebase };
