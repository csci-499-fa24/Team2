import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
import styles from "../page.module.css";
import Image from "next/image";
import userIcon from "../icons/user.png";

export default function AccountEmailPassword({action}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();
    
    const createNewAccount = async() => {
        try{
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL +'/api/createAccount', {
                method: 'POST',
                body: JSON.stringify({email, password}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                router.push(`/${data.uid}`);
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

    const signInAccount = async() => {
        try{
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL +'/api/signInAccount', {
                method: 'POST',
                body: JSON.stringify({email, password}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                router.push(`/${data.uid}`);
            }else if(response.status === 400) {
                console.error('Error:', data.message);
                alert(data.message);
            }else {
                console.error('Error:', data.error);
                alert(data.error, "Please try again later.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error Signing In Account. Please try again.");
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
                    <input
                    type="password"
                    placeholder='Password'
                    className={styles.inputField}
                    onChange={(e) => setPassword(e.target.value)}
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