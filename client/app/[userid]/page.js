"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseFirestore } from "../lib/firebaseClient";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setActiveUsers } from "../redux/authSlice";
import Navbar from "../components/navbar";
import ProtectedRoute from "../components/protectedRoute";
import Image from "next/image";
import roomIcon from "../icons/room.png";
import keyIcon from "../icons/key.png";
import playersIcon from "../icons/players.png";
import styles from "./[userid].module.css";
import { useSocket } from "../socketClient";

const JeopardyLoggedInPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const dispatch = useDispatch();
  const onlinePlayers = useSelector((state) => state.auth.activeUsers);
  const socket = useSocket();
  const db = getFirebaseFirestore();
  const [newRoom, setNewRoom] = useState({
    name: "",
    isPrivate: false,
    maxPlayers: 3,
  });
  const { userid } = useParams();
  const router = useRouter();

  useEffect(() => {
    const getActivePlayers = async () => { 
      const getQuery = query(collection(db, "users"), where("status", "==", "online"));
      const unsubscribe = onSnapshot(getQuery, (querySnapshot) => {
        const activePlayers = querySnapshot.docs.map((doc) => doc.data().displayName);
        const uniquePlayers = [...new Set([...onlinePlayers, ...activePlayers])];
        dispatch(setActiveUsers(uniquePlayers));
      });
      return () => unsubscribe();
    };

    getActivePlayers();

  }, [dispatch, db  ]); 

  const availableRooms = [
    "Trivia Masters",
    "Quiz Champions",
    "Brainiac Zone",
    "Knowledge Arena",
    "Fact Finders",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom((prevRoom) => ({
      ...prevRoom,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    // <ProtectedRoute>
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
            <button className={styles.tutorialButton}>Start Tutorial</button>
          </section>

          <div className={styles.gameInfoContainer}>
            <section className={styles.onlinePlayers}>
              <h2>Online Players</h2>
              {onlinePlayers.size === 0 ? <div className={styles.noOnlinePlayerMessage}>No players online yet. Invite your friends!</div> : null}
              <div className={styles.playerGrid}>
                {Array.from(onlinePlayers).map((player, index) => (
                  <div key={index} className={styles.playerCard}>
                    <div className={styles.playerAvatar}>{player[0]}</div>
                    <div className={styles.playerName}>{player}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.lowerGameInfo}>
              <section className={styles.availableRooms}>
                <h2>Available Rooms</h2>
                <ul>
                  {availableRooms.map((room, index) => (
                    <li key={index}>
                      <button
                        className={`${styles.roomButton} ${
                          selectedRoom === room ? styles.selectedRoom : ""
                        }`}
                      >
                        {room}
                      </button>
                    </li>
                  ))}
                </ul>
                <button className={styles.viewAllRoomsButton}>
                  View All Rooms
                </button>
              </section>

              <section className={styles.createRoom}>
                <h2>Create a Room</h2>
                <div className={styles.createRoomForm}>
                  <div className={styles.inputGroup}>
                    <Image src={roomIcon} alt="Room" width={24} height={24} />
                    <input
                      type="text"
                      name="name"
                      value={newRoom.name}
                      placeholder="Room Name"
                      className={styles.createRoomInput}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <Image src={keyIcon} alt="Private" width={24} height={24} />
                    <div>Private Room</div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        name="isPrivate"
                        checked={newRoom.isPrivate}
                        onChange={handleInputChange}
                      />
                      <div className={styles.slider}></div>
                    </label>
                  </div>
                  <div className={styles.inputGroup}>
                    <Image
                      src={playersIcon}
                      alt="Players"
                      width={24}
                      height={24}
                    />
                    <div>Max Players</div>
                    <div className={styles.selectWrapper}>
                      <select
                        name="maxPlayers"
                        value={newRoom.maxPlayers}
                        className={styles.createRoomSelect}
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                      </select>
                    </div>
                  </div>
                  <button className={styles.createRoomButton}>Create Room</button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    // </ProtectedRoute>
  );
};

export default JeopardyLoggedInPage;
