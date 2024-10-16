"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { initializeFirebase, getFirebaseFirestore } from "../lib/firebaseClient";
import { updateDoc, doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Image from "next/image";
import jeopardyLogo from "../icons/Jeopardy-Symbol.png";
import userIcon from "../icons/user.png";
import roomIcon from "../icons/room.png";
import keyIcon from "../icons/key.png";
import playersIcon from "../icons/players.png";
import styles from "./[userid].module.css";
import { useSocket } from "../socketClient";

const JeopardyLoggedInPage = () => {
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState(new Set());
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
    const fetchUserData = async (userId) => {
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
    
      if (userSnapshot.exists()) {
        console.log('User data:', userSnapshot.data());
        setUsername(userSnapshot.data().displayName);
      } else {
        console.log('No such document!');
      }
    };

    const getActivePlayers = async () => {
      try{
        const fireStoreQuery = query(
          collection(db, "users"),
          where('status', '==', 'online')
        );
        
        const querySnapshot = await getDocs(fireStoreQuery);
        const activePlayers = new Set();

        querySnapshot.forEach((doc) => {
          const playerName = doc.data().displayName;
          const playerId = doc.data().uid;
          if (playerId != userid && !onlinePlayers.has(playerName)) {
            console.log('Adding player:', playerName, " and username:", username);
            // console.log("users: ", onlinePlayers);  
            // console.log(playerId, userid);
            activePlayers.add(playerName);
          }else {
            console.log('Player already exists:', playerName);  
          }
        });

        setOnlinePlayers(activePlayers);
      } catch (error) {
        console.error('Error fetching active players:', error);
      }
    }

    if (userid) {
      fetchUserData(userid);
    }

    getActivePlayers();

  }, [userid, db]); 

  useEffect(() => {
    initializeFirebase();
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (userid) {
          setUsername(userid);
        }
      } else {
        if (!isSigningOut && loadingAuthState) {
          // console.log("User is not logged in");
          alert("You are not logged in. Please log in to continue.");
          router.push("/");
        }
      }
      setLoadingAuthState(false);
    });

    return () => unsubscribe();
  }, [userid, isSigningOut, loadingAuthState]);

  if (!userid) {
      return <div>Loading...</div>;
  }

  const availableRooms = [
    "Trivia Masters",
    "Quiz Champions",
    "Brainiac Zone",
    "Knowledge Arena",
    "Fact Finders",
  ];

  const updateUserStatus = async (uid, status) => {
    try{
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        status: status,
      });
    } catch (error) {
        console.error('Error updating user status:', error);
    }
  }

  const handleLogout = async() => {
    try{
      await updateUserStatus(userid, "offline");
      await signOut(getAuth());
      setIsSigningOut(true);
      alert("Successfully logged out!");
      router.push("/");
    }catch(error){
      console.error('Error:', error);
      alert("Error logging out. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom((prevRoom) => ({
      ...prevRoom,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src={jeopardyLogo}
            alt="Jeopardy Logo"
            width={300}
            height={100}
          />
          <div className={styles.withFriends}>With Friends!</div>
        </div>
        <div className={styles.userContainer}>
          <Image src={userIcon} alt="User Icon" width={40} height={40} />
          <div className={styles.username}>{username}</div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={styles.dropdownButton}
          >
            ▼
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <button>View Profile</button>
              <button onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </header>

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
  );
};

export default JeopardyLoggedInPage;
