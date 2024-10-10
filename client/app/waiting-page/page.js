"use client";
import React, { useState } from 'react';
import styles from './waiting-page.module.css';

export default function WaitingPage() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const handleReadyClick = () => {
    setIsPlayerReady(!isPlayerReady);
  };

  return (
    <div className={styles.page}>
      <header className={styles.flexBox}> 
        <button className={styles.exitGameButton}>Exit Game</button>
      </header>
      <div className={styles.waitingContent}>
        <h1 className={styles.playerStatus}>
          Waiting for players
          <span className={styles.loadingDots}>
            <span className={styles.dot1}>.</span>
            <span className={styles.dot2}>.</span>
            <span className={styles.dot3}>.</span>
          </span>
        </h1>
      </div>
      <div className={styles.readyPlayers}>
        <h3 className={isPlayerReady ? styles.ready : styles.waitingAnimation}>Shelly {isPlayerReady ? '✅' : ''}</h3>
        <h3 className={styles.waitingAnimation}>Alan</h3>
        <h3 className={styles.waitingAnimation}>Micheal</h3>
        <h3 className={styles.waitingAnimation}>Yulin</h3>
        <h3 className={styles.waitingAnimation}>Vicki</h3>
        <h3 className={styles.waitingAnimation}>Tiffany</h3>
      </div>
      <div>
        <button 
          className={styles.readyButton} 
          onClick={handleReadyClick}
        >
          {isPlayerReady ? 'Not ready' : 'Ready?'}
        </button>
      </div>
    </div>
  );
}
