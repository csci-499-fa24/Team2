"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateDisplayName, updateUserEmail } from "../../redux/authSlice";
import styles from './profile.module.css';
import Navbar from '@/app/components/navbar';
import ProtectedRoute from '@/app/components/protectedRoute';

const ProfilePage = () => {
    const router = useRouter();
    const { user, loading } = useSelector((state) => state.auth);
    const [userid, setUserid] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [newDisplayName, setNewDisplayName] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user && !loading) {
            router.push("/");
        } else if (user) {
            setUserEmail(user.email);
            setDisplayName(user.displayName);
            setUserid(user.uid);
        }
    }, [user]);

    const handleForm = async (e) => {
        e.preventDefault();
        const emailToUpdate = newEmail === "" ? userEmail : newEmail;
        const displayNameToUpdate = newDisplayName === "" ? displayName : newDisplayName;
        let updatedName = false;
        let updatedEmail = false;

        if (displayNameToUpdate !== displayName || emailToUpdate !== userEmail) {
            if (displayNameToUpdate !== displayName) {
                try {
                    console.log("update in progress");
                    console.log("userid: ", userid);
                    const isDisplayNameUpdated = await dispatch(updateDisplayName(userid, displayNameToUpdate));
                    console.log("updatedDisplayName:", isDisplayNameUpdated);
                    if (isDisplayNameUpdated) {
                        window.setDisplayName(newDisplayName);
                        updatedName = true;
                    } else {
                        updatedName = false;
                    }
                } catch (error) {
                    alert("Error updating profile. Please try again.");
                }
            }

            if (emailToUpdate !== userEmail) {
                try {
                    const isEmailUpdated = await dispatch(updateUserEmail(userid, emailToUpdate));
                    if (isEmailUpdated) {
                        updatedEmail = true
                    } else {
                        updatedEmail = false
                    }
                } catch (error) {
                    alert("Error updating profile. Please try again.");
                }
            }

            if (updatedName || updatedEmail) {
                alert("Profile updated successfully.");
            } else if (!updatedName) {
                alert("Display name already exists. Please choose another one.");
            } else if (!updatedEmail) {
                alert("Email already exists. Please choose another one.");
            }

        } else {
            alert("No changes made.");
        }
    }

    return (
        // <ProtectedRoute>
        <div>
            <Navbar />
            <div className={styles.profileContainer}>
                <h2 className={styles.profileGreeting}>Hello, {displayName}!</h2>
                <form className={styles.formContainer}>
                    <label htmlFor="email" className={styles.inputLabel}>Email:</label>
                    <input type="email" name="email" id="email" disabled className={styles.inputField + " " + styles.disabledInput}
                        placeholder={userEmail} onChange={(e) => setNewEmail(e.target.value)} />

                    <label htmlFor="displayName" className={styles.inputLabel}>Display Name:</label>
                    <input type="text" name="displayName" id="displayName" className={styles.inputField}
                        placeholder={displayName} onChange={(e) => setNewDisplayName(e.target.value)} />
                </form>
                <div className={styles.buttonsContainer}>
                    <button className={styles.buttons} onClick={handleForm} >Update Profile</button>
                    <button className={styles.buttons} onClick={() => router.push(`/${userid}`)}>Go back</button>
                </div>
            </div>
        </div>
        // </ProtectedRoute> 
    );
};

export default ProfilePage;