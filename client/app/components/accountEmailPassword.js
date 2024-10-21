import React, {useState} from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '../lib/firebaseClient';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserDocument } from '../redux/authSlice';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import styles from "../page.module.css";
import Image from "next/image";
import userIcon from "../icons/user.png";

export default function AccountEmailPassword({action}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const db = getFirebaseFirestore();
    const dispatch = useDispatch();

    const router = useRouter();
    const checkPasswordRequirements = (password) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        return passwordRegex.test(password);
    }
    
    const createNewAccount = async() => {
        const auth = getFirebaseAuth();
        const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;
        const userExists = await fetch(`${serverURL}/api/checkExistingUser/${email}`, {
            method: 'GET',
        });
        if (userExists.ok) {
            alert('Account already registered! Please sign in.');
            return;
        }

        if(!checkPasswordRequirements(password)) {
            alert('Password must be at least 8 characters long and contain at least one uppercase letter, special character, and number.');
        }else {
            try{
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const uid = user.uid;
                const idToken = await user.getIdToken();
                const response = await fetch(`${serverURL}/api/verifyToken`, {
                    method: 'POST',
                    body: JSON.stringify({token: idToken}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    await dispatch(createUserDocument(user.uid, user.email));
                    alert("Account created!");
                    router.push(`/${uid}`);
                }else if(response.status === 400) {
                    console.error('Error:', data.message);
                    alert(data.message);
                }else {
                    console.error('Error:', data.error);
                    alert(data.error, "Please try again later.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Error creating account. Please try again.");
            }
        }
    }

    const signInAccount = async() => {
        const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;
        const userExists = await fetch(`${serverURL}/api/checkExistingUser/${email}`, {
            method: 'GET',
        });

        if (userExists.status === 400) {
            alert('Account not registered! Please create an account.');
            return;
        }

        try{
            const auth = getFirebaseAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const uid = user.uid;
            const idToken = await user.getIdToken();
            const response = await fetch(`${serverURL}/api/verifyToken`, {
                method: 'POST',
                body: JSON.stringify({token: idToken}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                // await dispatch(updateUserStatus(user.uid, 'online'));
                alert("Signed in!");
                router.push(`/${uid}`);
            }else if(response.status === 400) {
                console.error('Error:', data.message);
                alert(data.message);
            }else {
                console.error('Error:', data.error);
                alert(data.error, "Please try again later.");
            }
        } catch (error) {
            console.error('Error:', error.message);
            alert("Error Signing In Account. Please try again.");
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        // console.log(e.target.id);
        if (email) {
            if (e.target.id === "loginAccount") {
                signInAccount();
            } else {
                createNewAccount();
            }
        }else{
            alert("Please enter an email address.");
        }
    }

    return (
        <div className={styles.loginContainer}>
            <form className={styles.inputContainer} id="emailForm">
                <div className={styles.iconWrapper}>
                    <Image
                    src={userIcon}
                    alt="User Icon"
                    className={styles.userIcon}
                    width={50}
                    height={50}
                    />
                </div>
                <div className={styles.inputsWrapper}>
                    <input
                    type="text"
                    placeholder="Email"
                    className={styles.inputField}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                    <input
                    type="password"
                    placeholder='Password'
                    className={styles.inputField}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
            </form>
            {action === "login" ? null:
                <ul className={styles.passwordReqContainer}>
                    Password requirements: 
                    <li>At least 8 characters</li>
                    <li>At least 1 uppercase letter</li>
                    <li>At least 1 number</li>
                    <li>At least 1 special character</li>
                </ul>
            }
            {action === "login" ? 
            <button className={styles.submitFormButton} type={'submit'} id={"loginAccount"} onClick={handleSubmit}>Login</button>
            :
            <button className={styles.submitFormButton} type={'submit'} id={"newAccount"} onClick={handleSubmit}>Create Account</button>
            }
      </div>
    );
};