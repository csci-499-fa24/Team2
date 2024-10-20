"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../../redux/authSlice";
import styles from './profile.module.css';
import Navbar from '@/app/components/navbar';

const ProfilePage = () => {
    const { userid } = useParams();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const [userEmail, setUserEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [newDisplayName, setNewDisplayName] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        if(!user) {
            router.push("/");
        }else {
            setUserEmail(user.email);
            setDisplayName(user.displayName);
        }
    }, [userid, user]);

    const handleForm = (e) => {
        e.preventDefault();
        const updateEmail = newEmail ===  "" ? userEmail : newEmail;
        const updateDisplayName = newDisplayName === "" ? displayName : newDisplayName;
        console.log("email:", updateEmail, "displayName:", updateDisplayName, "userid:", userid);

        if(updateEmail !== userEmail || updateDisplayName !== displayName) {
            try {
            dispatch(updateUserData(userid, updateEmail, updateDisplayName));
            alert("Profile updated successfully");
            } catch (error) {
                alert("Error updating profile. Please try again.");
            }
        } else {
            alert("No new changes inputted.");
        }
    }
    
    return (
        <div>
            <Navbar />
            <div className={styles.profileContainer}>
                <h1>Hello, {displayName}!</h1>
                <form className={styles.formContainer}>
                    <label htmlFor="email">Email:</label>
                    <input type="email" name="email" id="email" 
                    placeholder={userEmail} onChange={(e) => setNewEmail(e.target.value)}/>

                    <label htmlFor="displayName">Display Name:</label>
                    <input type="text" name="displayName" id="displayName" 
                    placeholder={displayName} onChange={(e) => setNewDisplayName(e.target.value)}/>
                </form>
                <div className={styles.buttonsContainer}>
                <button onClick={handleForm} >Update Profile</button>
                <button onClick={() => router.push(`/${userid}`)}>Go back</button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;