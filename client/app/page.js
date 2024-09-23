"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import jeopardyLogo from "./icons/Jeopardy-Symbol.png";
import userIcon from "./icons/user.png";
import { io } from "socket.io-client"; 
export default function Home() {
  const [message, setMessage] = useState("Loading");
  const [Jeopardies, setJeopardies] = useState([]);
  const [socket, setSocket] = useState(null); 
  const [roomKey, setRoomKey] = useState("room1"); // set roomkey here for now

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/jeopardy")
      .then((response) => response.json())
      .then((data) => {
        setJeopardies(data);
        console.log("Fetched Data:", data); // Log data here
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
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SERVER_URL);
    setSocket(socketInstance);

    console.log("Emitting roomkey...");
    socketInstance.emit("roomkey", roomKey);
  
    console.log("Starting initHandshake event...");
    socketInstance.emit("initHandshake", roomKey);
    
    socketInstance.on("serverHandshake", (confirmation) => {
      console.log("Server handshake received:", confirmation);
      if (confirmation) {
        console.log("Sending receivedHandshake...");
        socketInstance.emit("receivedHandshake", roomKey);
      }
    });

    socketInstance.on("confirmHandshake", (confirmation) => {
      console.log("Server handshake confirmed");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomKey]);

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

      <div className={styles.loginContainer}>
        <div className={styles.inputContainer}>
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
              placeholder="Username"
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.inputField}
            />
          </div>
        </div>

        <button className={styles.loginButton}>Login</button>
      </div>

      <p className={styles.notAUser}>
        Not a user yet?{" "}
        <a href="/signup" className={styles.signupLink}>
          Create an account
        </a>
      </p>
    </div>
  );
}
