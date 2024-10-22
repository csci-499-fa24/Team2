"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'
import jeopardyLogo from "../icons/Jeopardy-Symbol.png";
import Image from 'next/image';
import styles from './waiting-page.module.css';
import { useSocket } from "../socketClient";

export default function WaitingPage() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showRules, setShowRules] = useState(false); 

  const [completeRoomInfo, setCompleteRoomInfo] = useState(null);
  const handleServerMessage = () => {};
  const socket = useSocket(handleServerMessage);

  const handleReadyClick = () => {
    setIsPlayerReady(!isPlayerReady);
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };



  const router = useRouter()  // Initialize router
  


  const message = "Waiting for players...";

  const roomNumber = [
    "4680" 
  ]

  useEffect(() => {
    const storedRoomInfo = localStorage.getItem("completeRoomInfo");
    if (storedRoomInfo) {
      setCompleteRoomInfo(JSON.parse(storedRoomInfo));
      console.log("[Client-side Acknowledgement] Loaded room info from localStorage.");
    }
  }, []);

  useEffect(() => {
    if (completeRoomInfo) {
      localStorage.setItem("completeRoomInfo", JSON.stringify(completeRoomInfo));
    }
  }, [completeRoomInfo]);

  const handleRoomData = useCallback(
    (rooms) => {
      setCompleteRoomInfo(rooms); // Update completeRoomInfo and save to localStorage
    },
    []
  );

  useEffect(() => {
    if (socket) {
      socket.on("receiveRooms", handleRoomData); // Attach room handler
    }

    const interval = setInterval(() => {
      window.getRooms(); // Request rooms data every 500ms
    }, 500);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("receiveRooms", handleRoomData); // Clean up listener
      }
    };
  }, [socket, handleRoomData]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logoContainer}>
         <Image
            src={jeopardyLogo}
            alt="Jeopardy Logo"
            width={200}
            height={100}
          />
          <div className={styles.withFriends}>With Friends!</div>
          </div>
          <div className={styles.exitButtonContainer}>
            <button className={styles.exitButton} onClick={() => router.push('/user')}>Exit Room</button> 
          </div>
        </div>
      </header>
      <div className={styles.roomNumber}> 
        <h1>
          Room Number: 
          {roomNumber.map((room, index) => (
            <span key={index}> {room} </span>
          ))}
        </h1>
      </div>
      <div className={styles.waitingContent}>
        <h1 className={styles.playerStatus}>
        {message.split('').map((char, index) => (
          char === ' ' ? (
            <span key={index} className={styles.space}></span>
          ) : (
            <span key={index} className={styles.animatedLetter} style={{ animationDelay: `${index * 0.1}s` }}>
              {char}
            </span>
          )
        ))}
        </h1>
      </div>
      <div className={styles.readyPlayers}>
        <div className={`${styles.playerCircle} ${isPlayerReady ? styles.readyPlayerCircle : ''}`}>
          Shelly {isPlayerReady ? '✔' : ''}
        </div>
        <div className={styles.playerCircle}>Alan</div>
        <div className={styles.playerCircle}>Micheal</div>
        <div className={styles.playerCircle}>Yulin</div>
        <div className={styles.playerCircle}>Vicki</div>
        <div className={styles.playerCircle}>Tiffany</div>
      </div>
      <div>
        <button 
          className={`${styles.readyButton} ${isPlayerReady ? styles.readyButtonActive : ''}`} 
          onClick={handleReadyClick}
        >
          {isPlayerReady ? 'Ready' : 'Not Ready'}
        </button>
      </div>
      
      {/* Toggle Rules */}
      <div className={styles.rulesToggle} onClick={toggleRules}>
        {showRules ? 'Hide Rules' : 'Show Rules'}
      </div>
      
      <div className={`${styles.rulesBox} ${showRules ? styles.active : ''}`}>
        <h2 className={styles.gameRules}>Jeopardy Game Rules</h2>
        <ul>
          <li className={styles.gameRules}>Select a category and dollar amount from the game board.</li>
          <li className={styles.gameRules}>Read the clue carefully and formulate your response.</li>
          <li className={styles.gameRules}>Always phrase your answer in the form of a question, e.g., "What is...?" or "Who is...?"</li>
          <li className={styles.gameRules}>Correct answers add the clue's dollar amount to your score; incorrect answers deduct the same amount.</li>
          <li className={styles.gameRules}>The player with control of the board selects the next clue.</li>
        </ul>
        <h2 className={styles.gameRules}>Special Rules</h2>
        <ul>
          <li className={styles.gameRules}>Daily Doubles: Hidden on the board, they allow you to wager up to your entire score or the highest dollar amount on the board.</li>
          <li className={styles.gameRules}>Final Jeopardy!: All players can wager any amount up to their total score on the final clue.</li>
          <li className={styles.gameRules}>Timing: You have a limited time to buzz in after the clue is read, and then to provide your answer.</li>
        </ul>
      </div>
    </div>
  );
}
