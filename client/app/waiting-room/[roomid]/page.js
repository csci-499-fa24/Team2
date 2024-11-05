"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jeopardyLogo from "../../icons/Jeopardy-Symbol.png";
import Image from 'next/image';
import styles from '../waiting-page.module.css';
import { useSocket } from "../../socketClient";
import { useSelector } from 'react-redux';

export default function WaitingPage() {
  const user = useSelector((state) => state.auth.user);
  const [players, setPlayers] = useState({});
  const [showRules, setShowRules] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const router = useRouter();

  const socket = useSocket((message) => {
    console.log("Message received from server:", message);
    if (message.type === 'player_joined') {
      setPlayers(prevPlayers => ({
        ...prevPlayers,
        [message.playerName]: message.playerStatus,
      }));
    } else if (message.type === 'players_list') {
      setPlayers(message.players);
    }
  });

  useEffect(() => {
    const roomKey = localStorage.getItem("roomKey");
    console.log(roomKey);
    const completeRoomInfo = JSON.parse(localStorage.getItem("completeRoomInfo"));
  
    if (roomKey && completeRoomInfo && completeRoomInfo[roomKey]) {
      setPlayers(completeRoomInfo[roomKey]);
      console.log("setting room key as:", roomKey);
      setRoomNumber(roomKey);
    }
  
    if (socket) {
      socket.emit('request_players_list', { roomKey });
    }
  }, [socket]);

  // Toggle for showing game rules
  const toggleRules = () => {
    setShowRules(!showRules);
  };

  console.log("Current players:", players);

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
            <button className={styles.exitButton} onClick={() => router.push(`/${user.uid}`)}>
              Exit Room
            </button>
          </div>
        </div>
      </header>

      <div className={styles.roomNumber}>
        <h1>
          Room Number: {localStorage.getItem("roomKey")}
          {/* {roomNumber.map((room, index) => (
            <span key={index}> {room} </span>
          ))} */}
        </h1>
      </div>

      <div className={styles.waitingContent}>
        <h1 className={styles.playerStatus}>
          Waiting for players...
        </h1>
      </div>

      <div className={styles.readyPlayers}>
        {Object.keys(players).length > 0 ? (
          Object.keys(players).map((player, index) => (
            <div key={index} className={styles.playerCircle}>
              {player}
            </div>
          ))
        ) : (
          <div>No players in the room.</div>
        )}
      </div>

      <div>
        <button
          className={styles.readyButton}
          onClick={() => router.push('/game-search-page')}
        >
          Ready
        </button>
      </div>

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