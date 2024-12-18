"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import jeopardyLogo from "../../icons/Jeopardy-Symbol.png";
import Image from "next/image";
import styles from "../waiting-page.module.css";
import { useSocket } from "../../socketClient";
import { useSelector } from "react-redux";
import { IoMdCloseCircleOutline } from "react-icons/io";
import VoiceChat from './voiceChatClient';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const signalingServerUrl = 'wss://team2-server.onrender.com/webrtc';

function getMaxPlayersByGameId(gameId, games) {
  if (!Array.isArray(games)) {
    console.error("The 'games' parameter is not an array:", games);
    return null;
  }

  const game = games.find((game) => game.gameId === gameId);
  return game ? game.maxPlayers : null;
}

const fetchAvailableRooms = async () => {
  try {
    const response = await fetch(
      `${serverUrl}/api/games/active-games?includePrivate=true&includeInProgress=true&includeMaxPlayers=true`
    );
    if (response.ok) {
      const data = await response.json();
      return data.activeGames;
    } else {
      console.error("Failed to fetch available rooms");
      return [];
    }
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return [];
  }
};

const WaitingPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [players, setPlayers] = useState({});
  const [showRules, setShowRules] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [displayName, setDisplayName] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [readyStatus, setReadyStatus] = useState(false);
  const [roomIsFull, setRoomIsFull] = useState(false);
  const [hasAddedParticipant, setHasAddedParticipant] = useState(false);
  const [hasRemovedParticipant, setHasRemovedParticipant] = useState(false);

  const router = useRouter();

  const socket = useSocket((message) => {
    console.log("Message received from server:", message);

    if (message.type === "player_joined" || message.type === "player_ready") {
      updatePlayerList(message);
    } else if (message.type === "update_players_list") {
      setPlayers(message.players);
    }
  });

  useEffect(() => {
    //console.log("WaitingPage useEffect triggered");
    const storedRoomKey = localStorage.getItem("roomKey");
    const completeRoomInfo = JSON.parse(
      localStorage.getItem("completeRoomInfo")
    );

    if (storedRoomKey && !hasAddedParticipant) {
      setRoomNumber(storedRoomKey);
      window.addParticipant(storedRoomKey);
      setHasAddedParticipant(true);

      fetchAvailableRooms()
        .then((availableRooms) => {
          const maxPlayersForRoom = getMaxPlayersByGameId(
            storedRoomKey,
            availableRooms
          );
          if (maxPlayersForRoom !== null) {
            setMaxPlayers(maxPlayersForRoom);
            const currentPlayersInRoom = Object.keys(players).length;
            // Check if room is full
            // if (currentPlayersInRoom > maxPlayersForRoom) {
            //   setRoomIsFull(true); // Mark room as full
            //   alert("The room is full. Please join another room.");
            //   router.push(`/${user.uid}`);
            //   return;
            // }
          } else {
            console.error("Room key not found in available rooms");
          }
        })
        .catch((error) => {
          console.error("Error fetching available rooms:", error);
        });
    }

    const currentDisplayName = localStorage.getItem("displayName");
    setDisplayName(currentDisplayName || user?.email || "Anonymous");
  }, [hasAddedParticipant, user]);

  useEffect(() => {
    const storedRoomKey = localStorage.getItem("roomKey");

    if (socket && storedRoomKey) {
      socket.emit("getPlayersInRoom", { roomKey: storedRoomKey });
      socket.on("update_players_list", handleUpdatePlayersList);

      if (!Object.keys(players).includes(displayName)) {
        socket.emit("player_joined", {
          roomKey: storedRoomKey,
          playerName: displayName,
        });
      }
    }

    return () => {
      if (socket) {
        socket.off("player_joined");
        socket.off("update_players_list", handleUpdatePlayersList);
      }
    };
  }, [socket, user, displayName, players]);

  // Check if all players are ready and if they are then reroutes to game search page
  useEffect(() => {
    const allReady = Object.keys(players).every(
      (player) => players[player].ready
    );
    console.log("All players ready: ", allReady);
    if (Object.keys(players).length > 1 && allReady) {
      // Mark the game as in progress before redirecting
      const markGameInProgress = async () => {
        try {
          const roomKey = localStorage.getItem("roomKey");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/set-in-progress/${roomKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to mark game as in progress");
          }

          console.log("Game marked as in progress");
          router.push("/game-search-page");
        } catch (error) {
          console.error("Error marking game as in progress:", error);
        }
      };

      markGameInProgress();
    }
  }, [players, router]);

  const handleUpdatePlayersList = (message) => {
    setPlayers(message.players);
    // if (Object.keys(message.players).length > maxPlayers) {
    //   setRoomIsFull(true);
    //   alert("The room is full. Please join another room.");
    //   router.push(`/${user.uid}`);
    // }
  };

  const updatePlayerList = (message) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = {
        ...prevPlayers,
        [message.playerName]: {
          roomKey: message.roomKey,
          status: message.playerStatus,
        },
      };
      return updatedPlayers;
    });
  };

  const handleReady = () => {
    const roomKey = localStorage.getItem("roomKey");
    try {
      window.addParticipant(roomKey);
      window.togglePlayerStatus(roomKey, displayName);
      setReadyStatus((prevStatus) => !prevStatus);
    } catch (error) {
      console.error("Error toggling player status:", error);
    }
  };

  const handleExit = () => {
    const roomKey = localStorage.getItem("roomKey");

    if (!hasRemovedParticipant) {
      window.removeParticipant(roomKey);
      setHasRemovedParticipant(true);
    }

    localStorage.removeItem("roomKey");
    localStorage.removeItem("displayName");

    // socket.emit("player_left", { roomKey, playerName: displayName });
    socket.disconnect();
    localStorage.setItem("roomKey", "");
    router.push(`/${user.uid}`);
  };

  const toggleRules = () => setShowRules((prevState) => !prevState);

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
            <button className={styles.exitButton} onClick={handleExit}>
              Exit Room
            </button>
          </div>
        </div>
      </header>

      <div className={styles.roomInfo}>
        <h1>Room Number: {roomNumber}</h1>
        <h2>
          Players: {Object.keys(players).length}/{maxPlayers}
        </h2>
      </div>

      <div className={styles.waitingContent}>
        <h1 className={styles.playerStatus}>
          {Object.keys(players).length === 0
            ? "Waiting for players..."
            : "Current players in the room:"}
        </h1>
      </div>

      <div className={styles.readyPlayers}>
        {Object.keys(players).length > 0 ? (
          Object.keys(players).map((player, index) => (
            <div className={styles.playersContainer}>
              <div key={index} className={styles.playerCircle}>
                {player} {players[player].status === "ready" && "(Ready)"}
                {player === displayName && " (You)"}
              </div>
              {players[player].ready ? (
                <div className={styles.readyStatus}>Ready</div>
              ) : (
                <div className={styles.readyStatus}>Not Ready</div>
              )}
            </div>
          ))
        ) : (
          <div>No players in this room.</div>
        )}
      </div>

      <div className={styles.readyStatusContainer}>
        <button
          className={`${styles.readyButton} ${
            readyStatus ? "" : styles.readyButtonMarginBottom
          }`}
          onClick={handleReady}
        >
          Ready
        </button>
        {readyStatus ? (
          <p className={styles.waitingMessage}>Waiting for other players...</p>
        ) : null}
      </div>
      
      <br></br>
      <br></br>
      <br></br>
      <div className={styles.playerScoreContainer}>
          <VoiceChat signalingServerUrl={signalingServerUrl} />
      </div>
      <br></br>
      <br></br>
      <br></br>
      
      <div className={styles.rulesToggle} onClick={toggleRules}>
        {showRules ? "Hide Rules" : "Show Rules"}
      </div>

      {showRules && (
        <div className={styles.rulesBox}>
          <div className={styles.rulesBoxHeader}>
            <h2 className={styles.gameRules}>Jeopardy Game Rules</h2>
            <IoMdCloseCircleOutline
              className={styles.closeRules}
              onClick={toggleRules}
            />
          </div>
          <ul>
            <li className={styles.gameRules}>
              Select a category and dollar amount from the game board.
            </li>
            <li className={styles.gameRules}>
              Read the clue carefully and formulate your response.
            </li>
            <li className={styles.gameRules}>
              Always phrase your answer in the form of a question, e.g., "What
              is...?" or "Who is...?"
            </li>
            <li className={styles.gameRules}>
              Correct answers add the clue's dollar amount to your score;
              incorrect answers deduct the same amount.
            </li>
            <li className={styles.gameRules}>
              The player with control of the board selects the next clue.
            </li>
          </ul>
          <h2 className={styles.gameRules}>Special Rules</h2>
          <ul>
            <li className={styles.gameRules}>
              Daily Doubles: Hidden on the board, they allow you to wager up to
              your entire score or the highest dollar amount on the board.
            </li>
            <li className={styles.gameRules}>
              Final Jeopardy!: All players can wager any amount up to their
              total score on the final clue.
            </li>
            <li className={styles.gameRules}>
              Timing: You have a limited time to buzz in after the clue is read,
              and then to provide your answer.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WaitingPage;