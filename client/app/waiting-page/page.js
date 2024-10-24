"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import jeopardyLogo from "../icons/Jeopardy-Symbol.png";
import Image from 'next/image';
import styles from './waiting-page.module.css';

export default function WaitingPage() {
  const [players, setPlayers] = useState([
    { name: 'Shelly', ready: false },
    { name: 'Alan', ready: false },
    { name: 'Micheal', ready: false },
    { name: 'Yulin', ready: false },
    { name: 'Vicki', ready: false },
    { name: 'Tiffany', ready: false },
  ]);
  const [showRules, setShowRules] = useState(false);

  const handlePlayerReadyToggle = (index) => {
    setPlayers(players.map((player, i) => 
      i === index ? { ...player, ready: !player.ready } : player
    ));
  };

  const toggleAllPlayersReady = () => {
    const allReady = players.every(player => player.ready);
    setPlayers(players.map(player => ({ ...player, ready: !allReady })));
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  const router = useRouter(); 
  const roomNumber = ["4680"];

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
          Waiting for players...
        </h1>
      </div>

      <div className={styles.readyPlayers}>
        {players.map((player, index) => (
          <div 
            key={index} 
            className={`${styles.playerCircle} ${player.ready ? styles.readyPlayerCircle : ''}`}
            onClick={() => handlePlayerReadyToggle(index)} 
          >
            {player.name} {player.ready ? '✔' : ''}
          </div>
        ))}
      </div>

      <div>
        <button
          className={`${styles.readyButton} ${players.every(player => player.ready) ? styles.readyButtonActive : ''}`}
          onClick={() => router.push('/game-search-page')}
        >
          Ready
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
