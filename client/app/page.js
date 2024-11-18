"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import jeopardyLogo from "./icons/Jeopardy-Symbol.png";
import AccountEmailPassword from "./components/accountEmailPassword";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
import { useSocket } from "./socketClient";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("Loading");
  const [displayForm, setDisplayForm] = useState("login");
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socket = useSocket();

  // Effect to check user authentication and redirect if necessary
  useEffect(() => {
    if (user && !loading) {
      router.push(`/${user.uid}`);
    } else if(loading) {
      console.log("Loading user data...");
    }else {
      console.log("User is not logged in")
    }
  }, [user, router, loading]);

  function CreateAccount() {
    setDisplayForm("signup");
  }

  function LoginAccount() {
    setDisplayForm("login");
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleContainer}>
        <Image
          src={jeopardyLogo}
          alt="Jeopardy Logo"
          width={500}
          height={250}
        />
        <h2 className={styles.subtitle}>With Friends!</h2>
      </div>

      <AccountEmailPassword action={displayForm}/>

      {loading ? <p className={styles.loading}>Loading...</p> : null}

      {displayForm === "login" ? 
      <p className={styles.notAUser}>
        Not a user yet?{" "}
        <span className={styles.signupLink} onClick={CreateAccount}>
          Create an account
        </span>
      </p>
      : displayForm === "signup" ?
      <p className={styles.notAUser}>
        Already have an account?{" "}
        <span className={styles.signupLink} onClick={LoginAccount}>
          Login
        </span>
      </p>
      : null}
    </div>
  );
}
