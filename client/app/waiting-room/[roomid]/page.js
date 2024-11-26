"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jeopardyLogo from "../../icons/Jeopardy-Symbol.png";
import Image from 'next/image';
import styles from '../waiting-page.module.css';
import { useSocket } from "../../socketClient";
import { useSelector } from 'react-redux';
import { IoMdCloseCircleOutline } from "react-icons/io";

const WaitingPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [players, setPlayers] = useState({});
  const [showRules, setShowRules] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [displayName, setDisplayName] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [readyStatus, setReadyStatus] = useState(false);
  const router = useRouter();

  const socket = useSocket((message) => {
    console.log("Message received from server:", message);

    if (message.type === 'player_joined' || message.type === 'player_ready') {
      updatePlayerList(message);
    } else if (message.type === 'update_players_list') {
      setPlayers(message.players);
    }
  });

  useEffect(() => {
    console.log("WaitingPage useEffect");
    console.log("player:", players, "displayName:", displayName, "readyStatus:", readyStatus);
    const storedRoomKey = localStorage.getItem("roomKey");
    const completeRoomInfo = JSON.parse(localStorage.getItem("completeRoomInfo"));

    if (storedRoomKey) {
      setRoomNumber(storedRoomKey);
    }

    const currentDisplayName = localStorage.getItem("displayName");

    if (currentDisplayName) {
      setDisplayName(currentDisplayName);
    } else {
      setDisplayName(user?.email || 'Anonymous');
    }

    // Emit the player join event when user enters the room
    if (socket && storedRoomKey && displayName) {
      socket.emit("getPlayersInRoom", { roomKey: storedRoomKey });
      socket.on("update_players_list", (message) => {
        console.log("Players list received from server:", message.players);
        setPlayers(message.players);
      });

      if(!Object.keys(players).includes(displayName)) {
        socket.emit('player_joined', { roomKey: storedRoomKey, playerName: displayName});
      }
    }

    return () => {
      // Clean up socket listeners on unmount
      if (socket) {
        console.log("Cleaning up socket listeners in WaitingPage...");
        socket.off('player_joined');
        socket.off('player_ready');
        socket.off('update_players_list');
      }
    };
  }, [socket, user, displayName, players]);

  const updatePlayerList = (message) => {
    console.log("updatingPlayerList", message);
    setPlayers((prevPlayers) => {
      const updatedPlayers = {
        ...prevPlayers,
        [message.playerName]: { roomKey: message.roomKey, status: message.playerStatus }
      };
      return updatedPlayers;
    });
  };

  const handleReady = () => {
    console.log("READY BUTTON CLICKEDDDD")
    const roomKey = localStorage.getItem("roomKey");

    console.log("player:", players, "displayName:", displayName, "readyStatus:", readyStatus);

    
    if(!displayName) {
      const userDisplayName = localStorage.getItem("displayName");
      setDisplayName(userDisplayName);
    }

    try {
      console.log(`${roomKey} - ${displayName} ready status toggled from ${readyStatus}`);
      window.togglePlayerStatus(roomKey, displayName);  
      setReadyStatus((prevStatus) => !prevStatus);
    } catch (error) {
      console.error("Error toggling player status:", error);
    }
  };

  useEffect(() => {
    const allReady = Object.keys(players).every(player => players[player].ready);
    console.log("All players ready: ", allReady);
    if (Object.keys(players).length > 1 && allReady) {
      console.log("Players ready:", players);
      router.push('/game-search-page');
    }
  }, [players, router]);

  const handleExit = () => {
    console.log("EXIT BUTTON CLICKED");
    const roomKey = localStorage.getItem("roomKey");
    socket.emit("player_left", { roomKey, playerName: displayName });
    socket.disconnect();
    localStorage.setItem("roomKey", "");
    router.push(`/${user.uid}`);
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
            <button className={styles.exitButton} onClick={handleExit}>Exit Room</button>
          </div>
        </div>
      </header>

      <div className={styles.roomInfo}>
        <h1>Room Number: {roomNumber}</h1>
        <h2>Players: {Object.keys(players).length}/{maxPlayers}</h2>
      </div>

      <div className={styles.waitingContent}>
        <h1 className={styles.playerStatus}>
          {Object.keys(players).length === 0 ? 'Waiting for players...' : 'Current players in the room:'}
        </h1>
      </div>

      <div className={styles.readyPlayers}>
        {Object.keys(players).length > 0 ? (
          Object.keys(players)
            // .filter(player => players[player].roomKey === roomNumber) // Filter players by the current room number
            .map((player, index) => (
              <div className={styles.playersContainer}>
              <div key={index} className={styles.playerCircle}>
                {player} {players[player].status === 'ready' && '(Ready)'}
                {player === displayName && ' (You)'} {/* Mark the current player with '(You)' */}
              </div>
              {players[player].ready ? <div className={styles.readyStatus}>Ready</div> : <div className={styles.readyStatus}>Not Ready</div>}
              </div>
            ))
        ) : (
          <div>No players in this room.</div>
        )}
      </div>

      <div className={styles.readyStatusContainer}>
        <button className={`${styles.readyButton} ${readyStatus ? '' : styles.readyButtonMarginBottom}`} onClick={handleReady}>Ready</button>
        {readyStatus ? <p className={styles.waitingMessage}>Waiting for other players...</p> : null}
      </div>

      <div className={styles.rulesToggle} onClick={toggleRules}>
        {showRules ? 'Hide Rules' : 'Show Rules'}
      </div>

      <div className={`${styles.rulesBox} ${showRules ? styles.active : ''}`}>
        <div className={styles.rulesBoxHeader}>
          <h2 className={styles.gameRules}>Jeopardy Game Rules</h2>
          <IoMdCloseCircleOutline className={styles.closeRules} onClick={toggleRules} />
        </div>
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
