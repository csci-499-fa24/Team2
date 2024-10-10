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
        <div className={`${styles.playerCircle} ${isPlayerReady ? styles.readyPlayerCircle : ''}`}>
          Shelly {isPlayerReady ? '✔' : ''}
        </div>
        <div className={styles.playerCircle}>Alan</div>
        <div className={styles.playerCircle}>Micheal</div>
        <div className={styles.playerCircle}>Yulin</div>
        <div className={styles.playerCircle}>Vicki</div>
        <div className={styles.playerCircle}>Tiffany</div>
      </div>
      <div>
        <button 
          className={`${styles.readyButton} ${isPlayerReady ? styles.readyButtonActive : ''}`} 
          onClick={handleReadyClick}
        >
          {isPlayerReady ? 'Ready' : 'Not Ready'}
        </button>
      </div>
    </div>
  );
}
