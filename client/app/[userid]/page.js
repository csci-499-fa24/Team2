"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseFirestore } from "../lib/firebaseClient";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setActiveUsers } from "../redux/authSlice";
import Navbar from "../components/navbar";
import styles from "./[userid].module.css";
import { useSocket } from "../socketClient";
import { setSelectedData } from "../redux/data";

const JeopardyLoggedInPage = () => {
  const selectedData = useSelector((state) => state.selectedData.value);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    isPrivate: false,
    maxPlayers: "4",
  });
  const [joinRoomKey, setJoinRoomKey] = useState("");
  const roomsPerPage = 7;
  const [roomsData, setRoomsData] = useState([]);
  const socket = useSocket();
  const db = getFirebaseFirestore();
  const { userid } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const onlinePlayers = useSelector((state) => state.auth.activeUsers);
  const { user, loading } = useSelector((state) => state.auth);
  // const socketDisplayName = useSelector((state) => state.auth.user.displayName);
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const CreateGameModal = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      handleCreateRoom(gameSettings.isPrivate, gameSettings.maxPlayers);
    };

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Create New Game</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>
                Private Room
                <input
                  type="checkbox"
                  checked={gameSettings.isPrivate}
                  onChange={(e) =>
                    setGameSettings({
                      ...gameSettings,
                      isPrivate: e.target.checked,
                    })
                  }
                />
              </label>
            </div>
            <div className={styles.formGroup}>
              <label>Maximum Players</label>
              <select
                value={gameSettings.maxPlayers}
                onChange={(e) =>
                  setGameSettings({
                    ...gameSettings,
                    maxPlayers: e.target.value,
                  })
                }
              >
                {[4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} Players
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.modalButtons}>
              <button type="submit" className={styles.createButton}>
                Create Game
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const JoinGameModal = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      handleJoinByKey(joinRoomKey);
    };

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Join Game</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Room Key</label>
              <input
                type="text"
                value={joinRoomKey}
                onChange={(e) => {
                  e.preventDefault();
                  setJoinRoomKey(e.target.value);
                }}
                placeholder="Enter room key"
                className={styles.input}
                autoFocus
              />
            </div>
            <div className={styles.modalButtons}>
              <button type="submit" className={styles.createButton}>
                Join Game
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getUpdatedPlayerCount = (roomData, roomKey) => {
    if (!roomData || !roomKey || !roomData[roomKey]) {
        return 0; 
    }

    
    const roomPlayers = Object.keys(roomData[roomKey]);

   
    return roomPlayers.length;
};

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch(
        `${serverUrl}/api/games/active-games?includePrivate=true&includeInProgress=true&includeMaxPlayers=true`
      );

      if (response.ok) {
        const data = await response.json();
        const filteredRooms = data.activeGames.filter(
          (room) => !room.isPrivate && !room.inProgress
        );
        setAvailableRooms(filteredRooms);
      } else {
        console.error("Failed to fetch available rooms");
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      const handleUpdateRooms = () => {
        console.log("Received updateRooms event");
        fetchAvailableRooms();
      };
      socket.emit("getRooms");
      socket.on("updateRooms", handleUpdateRooms);
      socket.on("receiveRooms", (data) => {
        setRoomsData(data);
      });

      return () => {
        socket.off("updateRooms", handleUpdateRooms);
        socket.off("receiveRooms");
      };
    }
  }, [socket]);
  
  useEffect(() => {
    if (socket) {
      const handleUpdateRooms = () => {
        console.log("Received updateRooms event");
        fetchAvailableRooms();
      };
      socket.emit("getRooms");
      socket.on("updateRooms", handleUpdateRooms);
      socket.on("receiveRooms", (data) => {
        setRoomsData(data);
      });

      return () => {
        socket.off("updateRooms", handleUpdateRooms);
        socket.off("receiveRooms");
      };
    }
  }, [socket]);

  useEffect(() => {
    const getActivePlayers = async () => {
      const getQuery = query(
        collection(db, "users"),
        where("status", "==", "online")
      );
      const unsubscribe = onSnapshot(getQuery, (querySnapshot) => {
        const activePlayers = querySnapshot.docs.map(
          (doc) => doc.data().displayName
        );
        console.log("Active Players from page.js: ", activePlayers);
        const uniquePlayers = [
          ...new Set([...onlinePlayers, ...activePlayers]),
        ];
        dispatch(setActiveUsers(uniquePlayers));
      });
      return () => unsubscribe();
    };
    getActivePlayers();
  }, [dispatch, db]);

  useEffect(() => {
    if (!user && !loading) {
      alert("You're not logged in. Please log in.");
      router.push("/");
    }

    fetchAvailableRooms();
  }, []);

  const handleCreateRoom = async (isPrivate, maxPlayers) => {
    try {
      const response = await fetch(`${serverUrl}/api/games/start-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPrivate,
          maxPlayers: parseInt(maxPlayers),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("maxPlayers", data.maxPlayers);
        // console.log(data.maxPlayers);
        window.setRoomKey(data.gameId);
        router.push(`/waiting-room/${data.gameId}`);
        dispatch(setSelectedData(data.gameId));
        console.log("Updated RoomID:", data.gameId);

        // Emit event to server to update rooms
        socket.emit("roomCreated");

      } else {
        console.error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
    setShowCreateModal(false);
  };

  const handleJoinRoom = async (roomKey) => {
    try {
      const response = await fetch(
        `${serverUrl}/api/games/active-games?includePrivate=true&includeInProgress=true&includeMaxPlayers=true`
      );

      if (response.ok) {
        const data = await response.json();
        const room = data.activeGames.find((game) => game.gameId === roomKey);

        if (room && room.inProgress) {
          alert("This game is already in progress. Please join another room.");
          return;
        }

        window.setRoomKey(roomKey);
        router.push(`waiting-room/${roomKey}`);
      }
    } catch (error) {
      console.error("Error checking room status:", error);
    }
  };

  const handleJoinByKey = (roomKey) => {
    if (roomKey.trim()) {
      window.setRoomKey(roomKey);
      router.push(`/waiting-room/${roomKey}`);
    }
    setShowJoinModal(false);
  };

  const handleWatchTutorial = () => {
    window.open("https://www.youtube.com/watch?v=Hc0J2jmGnow", "_blank");
  };

  const totalPages = Math.ceil(availableRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const paginatedRooms = availableRooms.slice(
    startIndex,
    startIndex + roomsPerPage
  );
  console.log(paginatedRooms);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.howToPlay}>
          <h2>How To Play</h2>
          <div className={styles.rules}>
            <h3>Game Structure:</h3>
            <ul>
              <li>
                Jeopardy! consists of three rounds: Jeopardy!, Double Jeopardy!,
                and Final Jeopardy!
              </li>
              <li>
                The Jeopardy! and Double Jeopardy! rounds each feature six
                categories with five clues each.
              </li>
              <li>
                Clue values in Jeopardy! range from $200 to $1000, and in Double
                Jeopardy!, they're doubled.
              </li>
            </ul>
            <h3>Gameplay:</h3>
            <ul>
              <li>Select a category and dollar amount from the game board.</li>
              <li>Read the clue carefully and formulate your response.</li>
              <li>
                Correct answers add the clue's dollar amount to your score;
                incorrect answers deduct the same amount.
              </li>
              <li>
                The player with control of the board selects the next clue.
              </li>
            </ul>
            <h3>Special Rules:</h3>
            <ul>
              <li>
                Daily Doubles: Hidden on the board, they allow you to wager up
                to your entire score or the highest dollar amount on the board.
              </li>
              <li>
                Final Jeopardy!: All players can wager any amount up to their
                total score on the final clue.
              </li>
              <li>
                Timing: You have a limited time to buzz in after the clue is
                read, and then to provide your answer.
              </li>
            </ul>
            <h3>Winning:</h3>
            <ul>
              <li>
                The player with the highest score at the end of Final Jeopardy!
                wins the game and keeps their winnings.
              </li>
              <li>
                Returning champions can continue playing until defeated or
                reaching certain win limits.
              </li>
            </ul>
          </div>
          <button
            className={styles.tutorialButton}
            onClick={handleWatchTutorial}
          >
            Watch Tutorial
          </button>
        </section>

        <div className={styles.gameInfoContainer}>
          <section className={styles.onlinePlayers}>
            <h2>Online Players</h2>
            {onlinePlayers.size === 0 ? (
              <div className={styles.noOnlinePlayerMessage}>
                No players online yet. Invite your friends!
              </div>
            ) : (
              <div className={styles.playerGrid}>
                {Array.from(onlinePlayers).map((player, index) => (
                  <div key={index} className={styles.playerCard}>
                    {player && player[0] ? (
                      <div className={styles.playerAvatar}>{player[0]}</div>
                    ) : null}
                    {player ? (
                      <div className={styles.playerName}>{player}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.lowerGameInfo}>
          <section className={styles.availableRooms}>
            <h2>Available Rooms</h2>
            {paginatedRooms.some((room) => !room.isPrivate && !room.inProgress) ? (
              <ul>
                {paginatedRooms
                  .filter((room) => !room.isPrivate && !room.inProgress)
                  .map((room) => {
                    const isRoomFull = room.currentPlayers > room.maxPlayers;

                    return (
                      <li key={room.gameId}>
                        <button
                          className={`${styles.roomButton} ${selectedRoom === room.gameId ? styles.selectedRoom : ""}`}
                          onClick={() => {
                            const currentPlayerCount = getUpdatedPlayerCount(roomsData, room.gameId);
                    
                            // Check if the room is full
                            if (currentPlayerCount === room.maxPlayers) {
                              window.alert("This room is full. Please join another room.");
                              return; // Prevent joining the room if it's full
                            }
                    
                            // Proceed with joining the room
                            handleJoinRoom(room.gameId);
                          }}
                          disabled={isRoomFull}
                        >
                          <div>{room.gameId}</div>
                          <div className={styles.playerCount}>
                            {getUpdatedPlayerCount(roomsData, room.gameId) === room.maxPlayers ? (
                              <span>FULL</span> // Display "FULL" if the room is full
                            ) : (
                              <>
                                Players: {getUpdatedPlayerCount(roomsData, room.gameId)}/{room.maxPlayers}
                              </>
                            )}
                          </div>
                          {isRoomFull && (
                            <div className={styles.roomFullMessage}>Room Full</div>
                          )}
                        </button>
                      </li>
                    );
                    
                    
                  })}
              </ul>
            ) : (
              <div className={styles.noOnlinePlayerMessage}>
                No rooms available yet. Please create or join a room!
              </div>
            )}

            {availableRooms.length > 0 && (
              <div className={styles.paginationControls}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                  Previous
                </button>
                <span style={{ margin: "0 15px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
            <div className={styles.buttonRow}>
              <button
                className={styles.viewAllRoomsButton}
                onClick={fetchAvailableRooms}
              >
                Refresh Rooms
              </button>
              <button
                className={styles.createRoomButton}
                onClick={() => setShowCreateModal(true)}
              >
                Create New Room
              </button>
              <button
                className={styles.joinRoomButton}
                onClick={() => setShowJoinModal(true)}
              >
                Join Game
              </button>
            </div>
          </section>
        </div>
      </main>
      {showCreateModal && <CreateGameModal />}
      {showJoinModal && <JoinGameModal />}
    </div>
  );
};

export default JeopardyLoggedInPage;