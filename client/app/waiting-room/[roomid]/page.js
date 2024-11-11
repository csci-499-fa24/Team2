"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jeopardyLogo from "../../icons/Jeopardy-Symbol.png";
import Image from 'next/image';
import styles from '../waiting-page.module.css';
import { useSocket } from "../../socketClient";
import { useSelector } from 'react-redux';

const WaitingPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [players, setPlayers] = useState({});
  const [showRules, setShowRules] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [displayName, setDisplayName] = useState(null);
  const router = useRouter();

  const socket = useSocket((message) => {
    console.log("Message received from server:", message);

    if (message.type === 'player_joined' || message.type === 'player_ready') {
      updatePlayerList(message);
    } else if (message.type === 'players_list') {
      setPlayers(message.players);
      updatePlayersInLocalStorage(message.roomKey, message.players);
    }
  });

  useEffect(() => {
    const storedRoomKey = localStorage.getItem("roomKey");
    const completeRoomInfo = JSON.parse(localStorage.getItem("completeRoomInfo"));

    if (storedRoomKey) {
      setRoomNumber(storedRoomKey);
    }

    if (storedRoomKey && completeRoomInfo && completeRoomInfo[storedRoomKey]) {
      setPlayers(completeRoomInfo[storedRoomKey]);
    }

    if (user && user.displayName) {
      setDisplayName(user.displayName);
    } else {
      setDisplayName(user?.email || 'Anonymous');
    }

    if (socket && storedRoomKey) {
      socket.emit('player_joined', { roomKey: storedRoomKey, playerName: displayName, playerStatus: "joined" });
      socket.emit('request_players_list', { roomKey: storedRoomKey });
    }

    const handleStorageChange = (event) => {
      if (event.key === "completeRoomInfo") {
        const updatedRoomInfo = JSON.parse(localStorage.getItem("completeRoomInfo"));
        if (updatedRoomInfo && updatedRoomInfo[storedRoomKey]) {
          setPlayers(updatedRoomInfo[storedRoomKey]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [socket, user, displayName]);

  const updatePlayerList = (message) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = {
        ...prevPlayers,
        [message.playerName]: message.playerStatus,
      };
      updatePlayersInLocalStorage(message.roomKey, updatedPlayers);
      return updatedPlayers;
    });
  };

  const updatePlayersInLocalStorage = (roomKey, updatedPlayers) => {
    const completeRoomInfo = JSON.parse(localStorage.getItem("completeRoomInfo")) || {};
    completeRoomInfo[roomKey] = updatedPlayers;
    localStorage.setItem("completeRoomInfo", JSON.stringify(completeRoomInfo));
  };

  const handleReady = () => {
    const roomKey = localStorage.getItem("roomKey");

    if (socket && roomKey) {
      socket.emit('player_ready', { roomKey, playerName: displayName });
    }

    router.push('/game-search-page');
  };

  const toggleRules = () => setShowRules(prevState => !prevState);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logoContainer}>
            <Image src={jeopardyLogo} alt="Jeopardy Logo" width={200} height={100} />
            <div className={styles.withFriends}>With Friends!</div>
          </div>
          <div className={styles.exitButtonContainer}>
            <button className={styles.exitButton} onClick={() => router.push(`/profile/${user.uid}`)}>Exit Room</button>
          </div>
        </div>
      </header>

      <div className={styles.roomNumber}>
        <h1>Room Number: {roomNumber}</h1>
      </div>

      <div className={styles.waitingContent}>
        <h1 className={styles.playerStatus}>
          {Object.keys(players).length === 0 ? 'Waiting for players...' : 'Current players in the room:'}
        </h1>
      </div>

      <div className={styles.readyPlayers}>
        {Object.keys(players).length > 0 ? (
          Object.keys(players).map((player, index) => (
            <div key={index} className={styles.playerCircle}>
              {player} {players[player] === 'ready' && '(Ready)'}
            </div>
          ))
        ) : (
          <div>No players in this room.</div>
        )}
      </div>

      <div>
        <button className={styles.readyButton} onClick={handleReady}>Ready</button>
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
};

export default WaitingPage;
