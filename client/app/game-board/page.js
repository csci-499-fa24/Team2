"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./game-board.module.css";
import { useSelector } from "react-redux";

export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [expandingBox, setExpandingBox] = useState(null);
  const questionRef = useRef(null);

  const clickMe = (question, value) => {
    setExpandingBox({ question, value });
    setTimeout(() => {
      setSelectedQuestion(question);
    }, 500);
    setAnswerFeedback("");
  };

  const closeQuestion = () => {
    setSelectedQuestion(null);
    setTimeout(() => {
      setExpandingBox(null);
    }, 500);
  };

  const renderCategories = () => {
    return selectedData.map((category, index) => (
      <button className={styles.firstrow} key={index}>
        {category[0]?.category}
      </button>
    ));
  };

  const renderRows = () => {
    const maxRows = Math.max(
      ...selectedData.map((category) => category.length)
    );
    return Array(maxRows)
      .fill()
      .map((_, rowIndex) => (
        <div className={styles.buttonrow} key={rowIndex}>
          {selectedData.map((category, colIndex) => {
            const question = category[rowIndex];
            return question ? (
              <button
                className={styles.button}
                onClick={() => clickMe(question, question.value)}
                key={`${rowIndex}-${colIndex}`}
              >
                ${question.value}
              </button>
            ) : (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={styles.emptyCell}
              ></div>
            );
          })}
        </div>
      ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userAnswer = e.target.elements.answer.value.trim().toLowerCase();
    const correctAnswer = selectedQuestion?.answer?.toLowerCase();
    if (userAnswer === correctAnswer) {
      setAnswerFeedback("Correct!");
    } else {
      setAnswerFeedback("Wrong!");
    }
  };

  useEffect(() => {
    if (selectedQuestion && questionRef.current) {
      questionRef.current.focus();
    }
  }, [selectedQuestion]);

  return (
    <div className={styles.page}>
      <div className={styles.gameBoard}>
        <div className={styles.firstbuttonrow}>{renderCategories()}</div>
        {renderRows()}
      </div>
      {expandingBox && (
        <div
          className={`${styles.expandingBox} ${
            selectedQuestion ? styles.expanded : ""
          }`}
        >
          {selectedQuestion ? (
            <div className={styles.questionContent}>
              <h2>{selectedQuestion.category}</h2>
              <p className={styles.questionText}>{selectedQuestion.question}</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="answer"
                  required
                  ref={questionRef}
                  className={styles.answerInput}
                  placeholder="Your answer"
                />
                <button type="submit" className={styles.submitButton}>
                  Submit
                </button>
              </form>
              {answerFeedback && (
                <p className={styles.feedback}>{answerFeedback}</p>
              )}
              <button onClick={closeQuestion} className={styles.closeButton}>
                X
              </button>
            </div>
          ) : (
            `$${expandingBox.value}`
          )}
        </div>
      )}
    </div>
  );
}
