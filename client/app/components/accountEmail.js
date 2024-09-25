import React, {useState} from 'react';
import styles from "../page.module.css";
import Image from "next/image";
import userIcon from "../icons/user.png";

export default function AccountEmail({action}) {
    const [email, setEmail] = useState("");

    const createNewAccount = async() => {
        console.log('HI WHATS GOING ON  ', email);
        try{
            console.log('HI WHATS GOING ON NOW  ', email);
            const response = await fetch('/api/sendEmailLink', {
                method: 'POST',
                body: JSON.stringify({email}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('AND NOW  ', email);
            const data = await response.json();
            console.log('AND NOWWWWWWWWW  ', email);
            if (response.ok) {
                console.log(data.message);
                localStorage.setItem('emailForSignIn', email); 
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error creating account. Please try again.");
        }
    }

    const signInAccount = async() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            signInWithEmailLink(auth, email, window.location.href)
              .then((result) => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
                // You can access the new user by importing getAdditionalUserInfo
                // and calling it with result:
                // getAdditionalUserInfo(result)
                // You can access the user's profile via:
                // getAdditionalUserInfo(result)?.profile
                // You can check if the user is new or existing:
                // getAdditionalUserInfo(result)?.isNewUser
              })
              .catch((error) => {
                console.error('Error sending link:', error.message);
                alert("Error logging in. Please try again.");
              });
          }
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log(e.target.id);
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
                </div>
            </form>

            {action === "login" ? 
            <button className={styles.submitFormButton} type={'submit'} id={"loginAccount"} onClick={handleSubmit}>Login</button>
            :
            <button className={styles.submitFormButton} type={'submit'} id={"newAccount"} onClick={handleSubmit}>Create Account</button>
            }
      </div>
    );
};