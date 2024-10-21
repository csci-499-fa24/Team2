"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateDisplayName, updateUserEmail} from "../../redux/authSlice";
import styles from './profile.module.css';
import Navbar from '@/app/components/navbar';
import ProtectedRoute from '@/app/components/protectedRoute';

const ProfilePage = () => {
    const { userid } = useParams();
    const router = useRouter();
    const { user, loading } = useSelector((state) => state.auth);
    const [userEmail, setUserEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [newDisplayName, setNewDisplayName] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        if(!user && !loading) {
            router.push("/");
        }else {
            setUserEmail(user.email);
            setDisplayName(user.displayName);
        }
    }, [userid, user, loading]);

    const handleForm = async(e) => {
        console.log("HANDLING FORM")
        e.preventDefault();
        const emailToUpdate = newEmail ===  "" ? userEmail : newEmail;
        const displayNameToUpdate = newDisplayName === "" ? displayName : newDisplayName;
        console.log("email:", emailToUpdate, "displayName:", displayNameToUpdate, "userid:", userid);

        if(displayNameToUpdate !== displayName || emailToUpdate !== userEmail) {
            if(displayNameToUpdate !== displayName) {
                try {
                    console.log("update in progress");
                    const isDisplayNameUpdated = await dispatch(updateDisplayName(userid, displayNameToUpdate));
                    console.log("updatedDisplayName:", isDisplayNameUpdated);
                    if (isDisplayNameUpdated) {
                        alert("Profile displayName updated successfully");
                    }else {
                        alert("Display name already exists. Please choose another one.");
                    }
                } catch (error) {
                    alert("Error updating profile. Please try again.");
                }
            }

            if(emailToUpdate !== userEmail) {
                try {
                    console.log("update in progress");
                    const isEmailUpdated = await dispatch(updateUserEmail(userid, emailToUpdate));
                    console.log("updatedDisplayName:", isEmailUpdated);
                    if (isEmailUpdated) {
                        alert("Profile Email updated successfully");
                    }else {
                        alert("Email already exists. Please choose another one.");
                    }
                } catch (error) {
                    alert("Error updating profile. Please try again.");
                }
            }
        }else {
            alert("No changes made.");
        }
    }
    
    return (
        // <ProtectedRoute>
            <div>
                <Navbar />
                <div className={styles.profileContainer}>
                    <h1>Hello, {displayName}!</h1>
                    <form className={styles.formContainer}>
                        <label htmlFor="email">Email:</label>
                        <input type="email" name="email" id="email" disabled
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
        // </ProtectedRoute> 
    );
};

export default ProfilePage;