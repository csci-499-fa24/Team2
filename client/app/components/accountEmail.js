import React, {useState} from 'react';
import styles from "../page.module.css";
import Image from "next/image";
import userIcon from "../icons/user.png";
import '../../firebase';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export default function AccountEmail({action}) {
    const [email, setEmail] = useState("");

    const auth = getAuth();
    // Send sign-in link to email
    const actionCodeSettings = {
        url: 'http://localhost:3000/finishSignUp',
        handleCodeInApp: true,
    };

    const createNewAccount = async() => {
        console.log(email)
        try{
            fetch('/api/auth/signup', {
                method: 'POST',
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            }); 
        }catch (error) {
            console.error('Error sending link:', error.message);
            alert("Error sending link. Please try again.");
        }
        // try {
        //     await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        //     window.localStorage.setItem('emailForSignIn', email);
        //     alert('Email link sent!');
        //   } catch (error) {
        //     console.error('Error sending link:', error.message);
        //     alert("Error sending link. Please try again.");
        //   }
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
        if (email === "") {
            alert("Email cannot be blank");
        } else {
            if (e.target.id === "loginAccount") {
                signInAccount();
            } else {
                createNewAccount();
            }
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
                    />
                </div>
            </form>

            {action === "login" ? 
            <button className={styles.submitFormButton} form={"emailForm"} id={"loginAccount"} onClick={handleSubmit}>Login</button>
            :
            <button className={styles.submitFormButton} form={"emailForm"} id={"newAccount"} onClick={handleSubmit}>Create Account</button>
            }
      </div>
    );
};