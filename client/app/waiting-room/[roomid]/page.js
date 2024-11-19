"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jeopardyLogo from "../../icons/Jeopardy-Symbol.png";
import Image from 'next/image';
import styles from '../waiting-page.module.css';
import { useSocket } from "../../socketClient";
import { useSelector } from 'react-redux';
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;


function getMaxPlayersByGameId(gameId, games) {
  if (!Array.isArray(games)) {
    console.error("The 'games' parameter is not an array:", games);
    return null; // Return null if games is not an array
  }

  const game = games.find((game) => game.gameId === gameId);
  return game ? game.maxPlayers : null; // Return null if gameId is not found
}

const fetchAvailableRooms = async () => {
  try {
    const response = await fetch(
      `${serverUrl}/api/games/active-games?includePrivate=true&includeInProgress=true&includeMaxPlayers=true`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Fetched data: ", data);
      return data.activeGames; 
    } else {
      console.error("Failed to fetch available rooms");
      return []; // Return an empty array in case of an error
    }
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return []; // Return an empty array in case of an exception
  }
};

const WaitingPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [players, setPlayers] = useState({});
  const [showRules, setShowRules] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [displayName, setDisplayName] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const router = useRouter();

  const socket = useSocket((message) => {
    console.log("Message received from server:", message);

    if (message.type === 'player_joined' || message.type === 'player_ready') {
      updatePlayerList(message);
    } else if (message.type === 'players_list') {
      setPlayers(message.players);
    }
  });

  useEffect(() => {
    const storedRoomKey = localStorage.getItem("roomKey");
    const completeRoomInfo = JSON.parse(localStorage.getItem("completeRoomInfo"));
    console.log("WHATEVER THIS IS",completeRoomInfo)

    if (storedRoomKey) {
      setRoomNumber(storedRoomKey);
      fetchAvailableRooms()
      .then((availableRooms) => {
        console.log("Availabel ROoms",availableRooms)
        const maxPlayersForRoom = getMaxPlayersByGameId(storedRoomKey, availableRooms);
        if (maxPlayersForRoom !== null) {
          setMaxPlayers(maxPlayersForRoom);
        } else {
          console.error("Room key not found in available rooms");
        }
      })
      .catch((error) => {
        console.error("Error fetching available rooms:", error);
      });
  }

    const currentDisplayName = localStorage.getItem("displayName");

    if (currentDisplayName) {
      setDisplayName(currentDisplayName);
    } else {
      setDisplayName(user?.email || 'Anonymous');
    }

    if (socket && storedRoomKey && displayName) {
      socket.emit("getPLayersInRoom", { roomKey: storedRoomKey });
      socket.on("players_list", (message) => {
        console.log("Players list received from server:", message.players);
        setPlayers(message.players);
      });

      if(!Object.keys(players).includes(displayName)) {
        socket.emit('player_joined', { roomKey: storedRoomKey, playerName: displayName, playerStatus: "joined" });
      }
    }

    return () => {
      if (socket) {
        socket.off('player_joined');
        socket.off('player_ready');
        socket.off('players_list');
      }
    };
  }, [socket, user, displayName]);

  const updatePlayerList = (message) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = {
        ...prevPlayers,
        [message.playerName]: { roomKey: message.roomKey, status: message.playerStatus }
      };
      return updatedPlayers;
    });
  };

  const handleReady = () => {
    const roomKey = localStorage.getItem("roomKey");

    if (socket && roomKey) {
      socket.emit('player_ready', { roomKey, playerName: displayName });
    }

      router.push('/game-search-page');
  };

  const handleExit = () => {
    const roomKey = localStorage.getItem("roomKey");
    socket.emit("player_left", { roomKey, playerName: displayName });
    socket.disconnect();
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
            .map((player, index) => (
              <div key={index} className={styles.playerBox}>
                {player} {players[player].status === 'ready' && '(Ready)'}
                {player === displayName && ' (You)'}
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
