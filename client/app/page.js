"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import jeopardyLogo from "./icons/Jeopardy-Symbol.png";
import AccountEmailPassword from "./components/accountEmailPassword";
import { updateUserStatus, logoutUser } from "./redux/authSlice";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
import { useSocket } from "./socketClient";

const inactivityTimeout = 1000 * 60 * 60; // 1 hour
let inactivityTimer;

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("Loading");
  const [Jeopardies, setJeopardies] = useState([]);
  const [displayForm, setDisplayForm] = useState("login");
  const { user } = useSelector((state) => state.auth);
  console.log("User:", user);
  const dispatch = useDispatch();

  const socket = useSocket();

  const resetInactivityTimer = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutOnInactivity, inactivityTimeout);
  };

  const logoutOnInactivity = () => {
    if (user) {
      console.log("Logging out ", user);
      dispatch(updateUserStatus(user.uid, user.displayName, 'offline'));
      dispatch(logoutUser());
      alert("You have been logged out due to inactivity.");
      router.push("/");
    }
  }

  // returns true if user is logged out due to inactivity; false otherwise
  const checkInactivityOnLoad = () => {
    console.log("Checking inactivity on load");
    const lastActivity = localStorage.getItem('lastActivity');

    if (lastActivity) {
      const timeElapsed = Date.now() - parseInt(lastActivity);

      if (timeElapsed > inactivityTimeout && user) {
        console.log("Logging out due to inactivity");
        logoutOnInactivity();
        return true;
      } else {
        resetInactivityTimer();
        return false;
      }

    } else {
      console.log("No last activity found");
      resetInactivityTimer();
      return false;
    }
  };

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/jeopardy")
      .then((response) => response.json())
      .then((data) => {
        setJeopardies(data);
        console.log("Fetched Data:", data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      clearTimeout(inactivityTimer);
    };
  }, []); 

    // Effect to check user authentication and redirect if necessary
    useEffect(() => {
      if (user) {
        const isInactive = checkInactivityOnLoad();
        if (!isInactive) {
          router.push(`/${user.uid}`);
        }
      }
    }, [user, router]);

  useEffect(() => {
    if (Jeopardies) {
      console.log("Jeopardies state:", Jeopardies);
    }
  }, [Jeopardies]);

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
