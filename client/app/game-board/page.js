"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./game-board.module.css";
import { useSelector } from "react-redux";
import { useSocket } from "../socketClient";
import { useRouter } from "next/navigation";
import { setSelectedData } from "../redux/data";

export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const [round, setRound] = useState('');
  const [roundInfo, setRoundInfo] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [expandingBox, setExpandingBox] = useState(null);
  const [disabledQuestions, setDisabledQuestions] = useState([]);
  const [completeRoomInfo, setCompleteRoomInfo] = useState(null); // Room data with player names and money
  const questionRef = useRef(null);
  const router = useRouter();

  // Load completeRoomInfo from localStorage on component mount
  useEffect(() => {
    const storedRoomInfo = localStorage.getItem("completeRoomInfo");
    if (storedRoomInfo) {
      setCompleteRoomInfo(JSON.parse(storedRoomInfo));
      console.log("[Client-side Acknowledgement] Loaded room info from localStorage.");
    }
  }, []);

  //NEW: Function to update round state
  const updateRound = () => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/round-info/${selectedData}`)
    .then((response) => response.json())
    .then((data) => {
      setRound(data.round);
    })
    .catch((error) => {
      console.error("Failed to start the game:", error);
    });
  }

  //NEW: Return the current round of that game like jeopardy/double/final with all the categories and values
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/round-info/${selectedData}`)
    .then((response) => response.json())
    .then((data) => {
      setRoundInfo(data.roundInfo);
    })
    .catch((error) => {
      console.error("Failed to fetch game info:", error);
    });
  }, [round])

  //NEW:state the initial state of round in the beginning of the game
  useEffect(() => {
    updateRound();
  }, [])

  //NEW:debugging uses: log the updated roundinfo
  useEffect(() => {
    console.log("Updated roundInfo state:", roundInfo);
  }, [roundInfo]);

  //NEW:debugging uses: log the updated round
  useEffect(() => {
    console.log("Updated round state:", round);
  }, [round]);

  //NEW: move onto the next round
  const nextRound = () => {
    console.log("current gameID: ", selectedData);
    if(round == "Final Jeopardy!") {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/end-game/${selectedData}`, {
        method: "POST"
      })
      .then((response) => console.log(response))
      .then(()=>{
        console.log("game has ended")
        router.push("../game-search-page/");
      })
    } else {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/next-round/${selectedData}`, {
        method: "POST"
      })
      .then(() => {
        console.log("moving onto ther round");
        updateRound();
      })
      .catch((err) => console.log("round can't proceed:", err))
    }
  }
  
  // Save completeRoomInfo to localStorage whenever it updates
  useEffect(() => {
    if (completeRoomInfo) {
      localStorage.setItem("completeRoomInfo", JSON.stringify(completeRoomInfo));
    }
  }, [completeRoomInfo]);
  
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

  const handleRoomData = useCallback(
    (rooms) => {
      setCompleteRoomInfo(rooms); // Update completeRoomInfo and save to localStorage
    },
    []
  );

  const socket = useSocket(handleServerMessage);

  useEffect(() => {
    if (socket) {
      socket.on("receiveRooms", handleRoomData); // Attach room handler
    }

    const interval = setInterval(() => {
      window.getRooms(); // Request rooms data every 500ms
    }, 500);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("receiveRooms", handleRoomData); // Clean up listener
      }
    };
  }, [socket, handleRoomData]);

  const renderCategories = useCallback(() => {
    if (!Array.isArray(roundInfo)) {
      return <div>No categories available</div>;
    }

    return roundInfo.map((category, index) => (
      <button className={styles.firstrow} key={index}>
        {category.category}
      </button>
    ));
  }, [roundInfo]);

  // const renderRows = useCallback(() => {
  //   if (!Array.isArray(selectedData)) {
  //     return null;
  //   }

  //   const maxRows = Math.max(
  //     ...selectedData.map((category) => category.length)
  //   );
  //   return Array(maxRows)
  //     .fill()
  //     .map((_, rowIndex) => (
  //       <div className={styles.buttonrow} key={rowIndex}>
  //         {selectedData.map((category, colIndex) => {
  //           const question = category[rowIndex];
  //           const isDisabled = disabledQuestions.some(
  //             (q) =>
  //               q.category === question?.category && q.value === question?.value
  //           );
  //           return question ? (
  //             <button
  //               className={`${styles.button} ${
  //                 isDisabled ? styles.disabled : ""
  //               }`}
  //               onClick={() => clickMe(question, question.value)}
  //               key={`${rowIndex}-${colIndex}`}
  //               disabled={isDisabled}
  //             >
  //               ${question.value}
  //             </button>
  //           ) : (
  //             <div
  //               key={`${rowIndex}-${colIndex}`}
  //               className={styles.emptyCell}
  //             ></div>
  //           );
  //         })}
  //       </div>
  //     ));
  // }, [selectedData, disabledQuestions, clickMe]);
  
  //NEW: function that returns the desire question according to the category and value and store into selectedQuestion
  const fetchQuestion = (category, value) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/question/${selectedData}?category=${encodeURIComponent(category)}&value=${encodeURIComponent(value)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.question) {
          setSelectedQuestion(data);
          console.log("Question fetched:", selectedQuestion);
          //console.log("Question fetched:", data.question);
        } else {
          console.error("No question found for the given category and value.");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch question:", error);
      });
  };

  //NEW: a new renderRows function that display the columns for testing purpose (CAN BE REMOVED!)
  const renderRows = () => {
    if (!roundInfo || !Array.isArray(roundInfo) || roundInfo.length === 0) {
      return <div>No data available</div>;
    }
  
    const buttonRows = [];
  
    // Determine the maximum number of values in any category
    let maxValues = 0;
    for (let i = 0; i < roundInfo.length; i++) {
      if (Array.isArray(roundInfo[i].values) && roundInfo[i].values.length > maxValues) {
        maxValues = roundInfo[i].values.length;
      }
    }
    
    // Create rows
    for (let rowIndex = 0; rowIndex < maxValues; rowIndex++) {
      const buttonRow = (
        <div className={styles.buttonrow} key={rowIndex}>
          {roundInfo.map((categoryData, categoryIndex) => {
            // Safely access the value at the current row index
            const value = Array.isArray(categoryData.values) ? categoryData.values[rowIndex] : "";
            const category = categoryData.category;
            return (
              <button
                key={categoryIndex}
                className={styles.button}
                onClick={() => fetchQuestion(category, value)}
              >
                {value || ""}
              </button>
            );
          })}
        </div>
      );
      buttonRows.push(buttonRow);
    }
  
    return <>{buttonRows}</>;
  };
  
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
      <div>
        <button onClick={nextRound}>NextRound!</button>
      </div>
    </div>
  );
}