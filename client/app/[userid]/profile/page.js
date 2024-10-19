"use client";

import React from 'react';
import { useParams, useRouter } from "next/navigation";
import styles from './profile.module.css';
import Navbar from '@/app/components/navbar';

const ProfilePage = () => {
    const { userid } = useParams();
    const router = useRouter();
    
    return (
        <div>
            <Navbar />
            <div className={styles.profileContainer}>
                <h1>Hello, {userid}!</h1>
                <p className={styles.test}>Welcome to the profile page!</p>
                <button onClick={() => router.push(`/${userid}`)}>Go back</button>
            </div>
        </div>
    );
};

export default ProfilePage;