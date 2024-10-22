"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseFirestore } from "../lib/firebaseClient";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setActiveUsers } from "../redux/authSlice";
import Navbar from "../components/navbar";
import ProtectedRoute from "../components/protectedRoute";
import styles from "./[userid].module.css";
import { useSocket } from "../socketClient";

const JeopardyLoggedInPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 7;
  const socket = useSocket(); // Custom hook for managing socket connections
  const db = getFirebaseFirestore(); // Firestore instance
  const { userid } = useParams(); // Get the user ID from URL parameters
  const router = useRouter(); // Router instance to handle navigation
  const dispatch = useDispatch();
  const onlinePlayers = useSelector((state) => state.auth.activeUsers);
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Fetches the list of active game rooms from the server
  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/active-games`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRooms(data.activeGames || []);
      } else {
        console.error("Failed to fetch available rooms");
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };
    
  useEffect(() => {
    const getActivePlayers = async () => { 
      const getQuery = query(collection(db, "users"), where("status", "==", "online"));
      const unsubscribe = onSnapshot(getQuery, (querySnapshot) => {
        const activePlayers = querySnapshot.docs.map((doc) => doc.data().displayName);
        console.log("Active Players from page.js: ", activePlayers);
        const uniquePlayers = [...new Set([...onlinePlayers, ...activePlayers])];
        dispatch(setActiveUsers(uniquePlayers));
      });
      return () => unsubscribe();
    };
    getActivePlayers();
  }, [dispatch, db]); 

  useEffect(() => {
    fetchAvailableRooms();
  }, []); 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom((prevRoom) => ({
      ...prevRoom,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle creating a new room
  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/start-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Room created successfully:", data);

        // Set the room key using the setRoomKey function
        window.setRoomKey(data.gameId);

        // Redirect to the waiting page using a relative path
        router.push("/waiting-page");

      } else {
        console.error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  // Handle joining an existing room
  const handleJoinRoom = (roomKey) => {
    // Set the room key using the setRoomKey function
    window.setRoomKey(roomKey);

    // Redirect to the waiting page using a relative path
    router.push("/waiting-page");
  };

  // Open the tutorial video in a new tab
  const handleWatchTutorial = () => {
    window.open("https://www.youtube.com/watch?v=Hc0J2jmGnow", "_blank");
  };

  // Pagination calculations
  const totalPages = Math.ceil(availableRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const paginatedRooms = availableRooms.slice(startIndex, startIndex + roomsPerPage);

  // Move to the next page of rooms
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Move to the previous page of rooms
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
                Always phrase your answer in the form of a question, e.g., "What
                is...?" or "Who is...?"
              </li>
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
          <button className={styles.tutorialButton} onClick={handleWatchTutorial}>Watch Tutorial</button>
        </section>

        <div className={styles.gameInfoContainer}>
          <section className={styles.onlinePlayers}>
            <h2>Online Players</h2>
            {onlinePlayers.size === 0 ? <div className={styles.noOnlinePlayerMessage}>No players online yet. Invite your friends!</div> :
            <div className={styles.playerGrid}>
              {Array.from(onlinePlayers).map((player, index) => (
                <div key={index} className={styles.playerCard}>
                  {player && player[0] ? <div className={styles.playerAvatar}>{player[0]}</div> : null}
                  {player ? <div className={styles.playerName}>{player}</div> : null}
                </div>
              ))}
            </div>
            }
          </section>
        </div>

          <div className={styles.lowerGameInfo}>
            <section className={styles.availableRooms}>
              <h2>Available Rooms</h2>
              {paginatedRooms.length === 0 ? (
                <div className={styles.noOnlinePlayerMessage}>
                  No rooms available yet. Please create or join a room!
                </div>
              ) : (
                <ul>
                  {paginatedRooms.map((room, index) => (
                    <li key={index}>
                      <button
                        className={`${styles.roomButton} ${selectedRoom === room ? styles.selectedRoom : ""}`}
                        onClick={() => handleJoinRoom(room)}>
                        {room}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {availableRooms.length > 0 && (
                <div className={styles.paginationControls}>
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span style={{ margin: "0 15px" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              )}
              <div className={styles.buttonRow}>
                <button className={styles.viewAllRoomsButton} onClick={fetchAvailableRooms}>Refresh Rooms</button>
                <button className={styles.createRoomButton} onClick={handleCreateRoom}>Create New Room</button>
              </div>
            </section>
          </div>
        </main>
      </div>
  );
};

export default JeopardyLoggedInPage;
