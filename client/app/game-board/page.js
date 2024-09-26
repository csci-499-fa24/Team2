"use client"; 
import React from "react";
import styles from './game-board.module.css';
import { useDispatch, useSelector } from "react-redux";
import { setSelectedData } from "../redux/data";
export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const dispatch  = useDispatch();
  // Define the click handler function
  const clickMe = () => {
    // alert("Clue");
    console.log("selectedData:", selectedData);
  };
  
  return (
    <div className={styles.page}>
      <div className={styles.firstbuttonrow}>
        <button className={styles.firstrow} >1st Category</button>
        <button className={styles.firstrow} >2nd Category</button>
        <button className={styles.firstrow} >3rd Category</button>
        <button className={styles.firstrow} >4th Category</button>
        <button className={styles.firstrow} >5th Category</button>
        <button className={styles.firstrow} >6th Category</button>
      </div>
      <div className={styles.buttonrow}>
        <button className={styles.button} onClick={clickMe}>$200</button>
        <button className={styles.button} onClick={clickMe}>$200</button>
        <button className={styles.button} onClick={clickMe}>$200</button>
        <button className={styles.button} onClick={clickMe}>$200</button>
        <button className={styles.button} onClick={clickMe}>$200</button>
        <button className={styles.button} onClick={clickMe}>$200</button>
      </div>
      <div className={styles.buttonrow}>
        <button className={styles.button} onClick={clickMe}>$400</button>
        <button className={styles.button} onClick={clickMe}>$400</button>
        <button className={styles.button} onClick={clickMe}>$400</button>
        <button className={styles.button} onClick={clickMe}>$400</button>
        <button className={styles.button} onClick={clickMe}>$400</button>
        <button className={styles.button} onClick={clickMe}>$400</button>
      </div>
      <div className={styles.buttonrow}>
        <button className={styles.button} onClick={clickMe}>$600</button>
        <button className={styles.button} onClick={clickMe}>$600</button>
        <button className={styles.button} onClick={clickMe}>$600</button>
        <button className={styles.button} onClick={clickMe}>$600</button>
        <button className={styles.button} onClick={clickMe}>$600</button>
        <button className={styles.button} onClick={clickMe}>$600</button>
      </div>
      <div className={styles.buttonrow}>
        <button className={styles.button} onClick={clickMe}>$800</button>
        <button className={styles.button} onClick={clickMe}>$800</button>
        <button className={styles.button} onClick={clickMe}>$800</button>
        <button className={styles.button} onClick={clickMe}>$800</button>
        <button className={styles.button} onClick={clickMe}>$800</button>
        <button className={styles.button} onClick={clickMe}>$800</button>
      </div>
      <div className={styles.buttonrow}>
        <button className={styles.button} onClick={clickMe}>$1000</button>
        <button className={styles.button} onClick={clickMe}>$1000</button>
        <button className={styles.button} onClick={clickMe}>$1000</button>
        <button className={styles.button} onClick={clickMe}>$1000</button>
        <button className={styles.button} onClick={clickMe}>$1000</button>
        <button className={styles.button} onClick={clickMe}>$1000</button>
      </div>
    </div>
  );
}
