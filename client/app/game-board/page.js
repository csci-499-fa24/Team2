"use client"; 
import React, { useState } from "react";
import styles from './game-board.module.css';
import { useDispatch, useSelector } from "react-redux";
import { setSelectedData } from "../redux/data";
export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const dispatch  = useDispatch();
  // Define the click handler function
  const clickMe = (question) => {
    //console.log("Selected Question:", question);
    setSelectedQuestion(question);
    setModalOpen(true);
    setAnswerFeedback("");
  };
  const renderRows = () => {
    const rows = [];
    const itemsPerRow = 6; // 6 categories per row

    for (let i = 0; i < selectedData.length; i += itemsPerRow) {
      const rowItems = selectedData.slice(i, i + itemsPerRow);
      rows.push(
        <div className={styles.buttonrow} key={i}>
          {rowItems.map((question, index) => (
            <button 
              className={styles.button} 
              onClick={() => clickMe(question)} 
              key={index}>
              ${question.value}
            </button>
          ))}
        </div>
      );
    }
    return rows;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const userAnswer = e.target.elements.answer.value.trim().toLowerCase();
    const correctAnswer = selectedQuestion?.answer?.toLowerCase(); 
    console.log("User Answer:", userAnswer);
    console.log("correct answer:", correctAnswer);
    if (userAnswer === correctAnswer) {
      setAnswerFeedback("Correct!");
    } else {
      setAnswerFeedback("Wrong!");
    }
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
      {renderRows()}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Question: {selectedQuestion?.category}</h2>
            <p>{selectedQuestion?.question}</p>

            <form onSubmit={handleSubmit}>
              <label>
                Your Answer:
                <input type="text" name="answer" required />
              </label>
              <button type="submit" className="button">Submit</button>
            </form>
            {answerFeedback && <p>{answerFeedback}</p>}

            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
