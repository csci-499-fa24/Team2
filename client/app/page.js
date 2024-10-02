"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import jeopardyLogo from "./icons/Jeopardy-Symbol.png";
import AccountEmail from "./components/accountEmail";
import FinishSignUp from "./components/finishSignUp";
import { useSocket } from "./socketClient";


export default function Home() {
  const [message, setMessage] = useState("Loading");
  const [Jeopardies, setJeopardies] = useState([]);
  const [displayForm, setDisplayForm] = useState("login");
  
  const [roomKey, setRoomKey] = useState("");
  const [socketMessage, setSocketMessage] = useState("");

  useEffect(() => {
    console.log("Hello! Please open the developer console and type setRoomKey('yourRoomKey') to enter the room.");
    console.log("Once you have done that, you can type in sendMessage('your message here') to send a message to others in the room!");
    // this allows us to make a global function to set things in the console
    window.setRoomKey = (key) => {
      setRoomKey(key);
      console.log(`Room key set to: ${key}`);
    };

    window.sendMessage = (msg) => {
      setSocketMessage(msg);
      console.log(`Message set to: "${msg}"`);
    };
  }, []);

  const socket = useSocket(roomKey, socketMessage);

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
  }, []);

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

      <AccountEmail action={displayForm}/>
      <FinishSignUp />

      {displayForm === "login" ? 
      <p className={styles.notAUser}>
        Not a user yet?{" "}
        <span className={styles.signupLink} onClick={CreateAccount}>
          Create an account
        </span>
      </p>
      : 
      <p className={styles.notAUser}>
        Already have an account?{" "}
        <span className={styles.signupLink} onClick={LoginAccount}>
          Login
        </span>
      </p>
      }
    </div>
  );
}

