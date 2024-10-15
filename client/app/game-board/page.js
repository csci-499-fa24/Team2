"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./game-board.module.css";
import { useSelector } from "react-redux";
import { useSocket } from "../socketClient";

export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [expandingBox, setExpandingBox] = useState(null);
  const [disabledQuestions, setDisabledQuestions] = useState([]);
  const questionRef = useRef(null);

  const clickMe = useCallback(
    (question, value) => {
      if (
        disabledQuestions.some(
          (q) => q.category === question.category && q.value === question.value
        )
      )
        return;

      setExpandingBox({ question, value });

      const updatedDisabledQuestions = [...disabledQuestions, question];
      setDisabledQuestions(updatedDisabledQuestions);

      window.sendMessage({
        action: "clickQuestion",
        content: {
          question,
          disabledQuestions: updatedDisabledQuestions,
        },
      });

      setTimeout(() => {
        setSelectedQuestion(question);
      }, 500);
      setAnswerFeedback("");
    },
    [disabledQuestions]
  );

  const socketClickMe = useCallback(
    (question, value, updatedDisabledQuestions) => {
      setExpandingBox({ question, value });
      setDisabledQuestions(updatedDisabledQuestions);
      setTimeout(() => {
        setSelectedQuestion(question);
      }, 500);
      setAnswerFeedback("");
    },
    []
  );

  const closeQuestion = useCallback(() => {
    setSelectedQuestion(null);
    window.sendMessage({
      action: "closeQuestion",
      content: "",
    });
    setTimeout(() => {
      setExpandingBox(null);
    }, 500);
  }, []);

  const socketCloseQuestion = useCallback(() => {
    setSelectedQuestion(null);
    setTimeout(() => {
      setExpandingBox(null);
    }, 500);
  }, []);

  const handleServerMessage = useCallback(
    (message) => {
      const action = message["action"];
      if (action === "clickQuestion") {
        const { question, disabledQuestions: updatedDisabledQuestions } =
          message["content"];
        console.log(
          "Received clickQuestion:",
          question,
          updatedDisabledQuestions
        );
        socketClickMe(question, question.value, updatedDisabledQuestions);
      } else if (action === "closeQuestion") {
        socketCloseQuestion();
      } else if (action === "syncDisabledQuestions") {
        console.log("Syncing disabled questions:", message["content"]);
        setDisabledQuestions(message["content"]);
      }
    },
    [socketClickMe, socketCloseQuestion]
  );

  const socket = useSocket(handleServerMessage);

  const renderCategories = useCallback(() => {
    if (!Array.isArray(selectedData)) {
      return <div>No categories available</div>;
    }

    return selectedData.map((category, index) => (
      <button className={styles.firstrow} key={index}>
        {category[0]?.category}
      </button>
    ));
  }, [selectedData]);

  const renderRows = useCallback(() => {
    if (!Array.isArray(selectedData)) {
      return null;
    }

    const maxRows = Math.max(
      ...selectedData.map((category) => category.length)
    );
    return Array(maxRows)
      .fill()
      .map((_, rowIndex) => (
        <div className={styles.buttonrow} key={rowIndex}>
          {selectedData.map((category, colIndex) => {
            const question = category[rowIndex];
            const isDisabled = disabledQuestions.some(
              (q) =>
                q.category === question?.category && q.value === question?.value
            );
            return question ? (
              <button
                className={`${styles.button} ${
                  isDisabled ? styles.disabled : ""
                }`}
                onClick={() => clickMe(question, question.value)}
                key={`${rowIndex}-${colIndex}`}
                disabled={isDisabled}
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
  }, [selectedData, disabledQuestions, clickMe]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const userAnswer = e.target.elements.answer.value.trim().toLowerCase();
      const correctAnswer = selectedQuestion?.answer?.toLowerCase();
      if (userAnswer === correctAnswer) {
        setAnswerFeedback("Correct!");
      } else {
        setAnswerFeedback("Wrong!");
      }
    },
    [selectedQuestion]
  );

  useEffect(() => {
    if (selectedQuestion && questionRef.current) {
      questionRef.current.focus();
    }
  }, [selectedQuestion]);

  // Sync disabled questions on component mount
  useEffect(() => {
    console.log("Requesting disabled questions");
    window.sendMessage({
      action: "getDisabledQuestions",
      content: "",
    });
  }, []);

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
