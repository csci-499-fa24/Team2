"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./game-board.module.css";
import { useSelector } from "react-redux";
import { useSocket } from "../socketClient";
import { useRouter } from "next/navigation";
import { setSelectedData } from "../redux/data";
import Fuse from 'fuse.js'; 
import axios from 'axios';

export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const [round, setRound] = useState("");
  const [roundInfo, setRoundInfo] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [expandingBox, setExpandingBox] = useState(null);
  const [disabledQuestions, setDisabledQuestions] = useState([]);
  const [completeRoomInfo, setCompleteRoomInfo] = useState(null);
  const [answeredAlready, setAnsweredAlready] = useState(false);
  const [playerScores, setPlayerScores] = useState({});
  const [incorrectNotification, setIncorrectNotification] = useState(null);
  const [correctNotification, setCorrectNotification] = useState(null);
  const questionRef = useRef(null);
  const router = useRouter();

  // Load completeRoomInfo from localStorage on component mount
  useEffect(() => {
    const storedRoomInfo = localStorage.getItem("completeRoomInfo");
    if (storedRoomInfo) {
      setCompleteRoomInfo(JSON.parse(storedRoomInfo));
      console.log(
        "[Client-side Acknowledgement] Loaded room info from localStorage."
      );
    }
  }, []);

  // Function to show incorrect answer notification
  const OtherUserIncorrectPopUp = (name) => {
    setIncorrectNotification(`${name} has answered incorrectly!`);
    setTimeout(() => {
      setIncorrectNotification(null); // Clear notification after 3 seconds
    }, 3000);
  };

  const OtherUserCorrectPopUp = (name) => {
    setCorrectNotification(`${name} has answered correctly!`);
    setTimeout(() => {
      setCorrectNotification(null);
    }, 3000); //
  };

  //NEW: Function to update round state
  const updateRound = () => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/round-info/${selectedData}`
    )
      .then((response) => response.json())
      .then((data) => {
        setRound(data.round);
      })
      .catch((error) => {
        console.error("Failed to start the game:", error);
      });
  };

  //NEW: Return the current round of that game like jeopardy/double/final with all the categories and values
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/round-info/${selectedData}`
    )
      .then((response) => response.json())
      .then((data) => {
        setRoundInfo(data.roundInfo);
      })
      .catch((error) => {
        console.error("Failed to fetch game info:", error);
      });
  }, [round]);

  //NEW:state the initial state of round in the beginning of the game
  useEffect(() => {
    updateRound();
  }, []);

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
    if (round == "Final Jeopardy!") {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/end-game/${selectedData}`,
        {
          method: "POST",
        }
      )
        .then((response) => console.log(response))
        .then(() => {
          console.log("game has ended");
          router.push("../game-search-page/");
        });
    } else {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/next-round/${selectedData}`,
        {
          method: "POST",
        }
      )
        .then(() => {
          console.log("moving onto ther round");
          updateRound();
          calledNextRound();
        })
        .catch((err) => console.log("round can't proceed:", err));
    }
  };

  // Save completeRoomInfo to localStorage whenever it updates
  useEffect(() => {
    if (completeRoomInfo) {
      localStorage.setItem(
        "completeRoomInfo",
        JSON.stringify(completeRoomInfo)
      );
    }
  }, [completeRoomInfo]);

  // Update playerScores when completeRoomInfo changes
  useEffect(() => {
    const currentRoomKey = localStorage.getItem("roomKey");
    const storedRoomInfo = localStorage.getItem("completeRoomInfo");
    if (storedRoomInfo) {
      const parsedRoomInfo = JSON.parse(storedRoomInfo);
      const currentRoomObject = parsedRoomInfo[currentRoomKey];
      setPlayerScores(currentRoomObject || {});
    }
  }, [completeRoomInfo]);

  const clickMe = useCallback(
    (question, value) => {
      console.log(question, value);
      if (
        disabledQuestions.some(
          (q) => q.category === question.category && q.value === question.value
        )
      )
        return;

      setExpandingBox({ question, value });

      const updatedDisabledQuestions = [...disabledQuestions, question];
      setDisabledQuestions(updatedDisabledQuestions);

      setAnsweredAlready(false);

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
      setAnsweredAlready(false);
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

  //triggering nextRound message function
  const calledNextRound = useCallback(() => {
    console.log("triggered calledNextRound");
    window.sendMessage({
      action: "calledNextRound",
      content: "",
    });
  }, []);

  //receiving nextRound message function
  const socketNextRound = useCallback(() => {
    updateRound();
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
      } else if (action === "notifyOthersAboutIncorrect") {
        OtherUserIncorrectPopUp(message["content"]["name"]);
      } else if (action === "notifyOthersAboutCorrect") {
        OtherUserCorrectPopUp(message["content"]["name"]);
      } else if (action === "calledNextRound") {
        console.log("nextRound action also triggered");
        socketNextRound(message["content"]["name"]);
      }
    },
    [socketClickMe, socketCloseQuestion]
  );

  const handleRoomData = useCallback((rooms) => {
    setCompleteRoomInfo(rooms);
  }, []);

  const socket = useSocket(handleServerMessage);

  useEffect(() => {
    if (socket) {
      socket.on("receiveRooms", handleRoomData);
    }

    const interval = setInterval(() => {
      window.getRooms();
    }, 1000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("receiveRooms", handleRoomData);
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

  // Old render rows code moved to the bottom

  //NEW: function that returns the desire question according to the category and value and store into selectedQuestion
  const fetchQuestion = (category, value) => {
    fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL
      }/api/games/question/${selectedData}?category=${encodeURIComponent(
        category
      )}&value=${encodeURIComponent(value)}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.question) {
          setSelectedQuestion(data);
          console.log("Question fetched:", selectedQuestion);
          clickMe(data, value);
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
      if (
        Array.isArray(roundInfo[i].values) &&
        roundInfo[i].values.length > maxValues
      ) {
        maxValues = roundInfo[i].values.length;
      }
    }

    // Create rows
    for (let rowIndex = 0; rowIndex < maxValues; rowIndex++) {
      const buttonRow = (
        <div className={styles.buttonrow} key={rowIndex}>
          {roundInfo.map((categoryData, categoryIndex) => {
            // Safely access the value at the current row index
            const valuesArray = Array.isArray(categoryData.values)
              ? [...categoryData.values]
              : [];

            // Remove commas from the values and parse them to integers for sorting
            const sortedValues = valuesArray.sort((a, b) => {
              const numA = parseInt(a.substring(1).replace(/,/g, "")); // Remove commas
              const numB = parseInt(b.substring(1).replace(/,/g, "")); // Remove commas
              return numA - numB;
            });

            const value = sortedValues[rowIndex] || "";
            const category = categoryData.category;

            // Check if the question is disabled
            const isDisabled = disabledQuestions.some(
              (q) => q.category === category && q.value === value
            );

            return (
              <button
                key={categoryIndex}
                className={`${styles.button} ${
                  isDisabled ? styles.disabled : ""
                }`} // Apply disabled styling
                onClick={() => fetchQuestion(category, value)}
                disabled={isDisabled} // Disable the button interaction
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
    async (e) => {
      e.preventDefault();

      function formatQuestion(question) {
        const cleanedQuestion = question.replace(/[;:&[\]]|q\[\w+\]=/g, "").trim();
        return cleanedQuestion;
      }
      
      async function getAnswerFromGoogle(question) {
        try {
          const formattedQuestion = formatQuestion(question);
          const apiKey = NEXT_PUBLIC_GOOGLE_API_KEY;
          const cxId = NEXT_PUBLIC_GOOGLE_ENGINE_ID;
          const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
            params: {
              key: apiKey,
              cx: cxId,
              q: formattedQuestion
            }
          });
      
          if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0].snippet;
          }
          return "";
        } catch (error) {
          console.error("Error fetching answer from Google Custom Search:", error);
          return "";
        }
      }      
      
      async function isCorrectAnswer(correctAnswer = "", playerResponse = "", question = "") {
        let usedGoogle = false  // Check to see if Google is used to change flexibility
        if (!correctAnswer && question) { // Use Google if no answer
          correctAnswer = await getAnswerFromGoogle(question);
          usedGoogle = true;
        }
        if (!correctAnswer || !playerResponse) {
          console.log("No correct answer or player response provided.");
          return false; // Automatically mark as wrong if there's no answer or response
        }
        // Clean the answers by removing non-alphabetic characters and converting to lowercase
        const cleanText = text => 
          text.replace(/[^a-zA-Z\s]/g, "").toLowerCase().trim();
        const cleanCorrectAnswer = cleanText(correctAnswer);
        const cleanPlayerResponse = cleanText(playerResponse);
        // Ensure neither cleaned answer is empty
        if (!cleanCorrectAnswer || !cleanPlayerResponse) {
          console.log("One of the cleaned answers is empty.");
          return false;
        }
        if (usedGoogle) { // If Google is used, just get subset
          if (cleanCorrectAnswer.includes(cleanPlayerResponse)) {
            return true;
          }
        }
        // Fuzzy matching
        const options = {
          includeScore: true,
          threshold: 0.3, // Lower = stricter
          keys: []
        };
        const fuse = new Fuse([cleanCorrectAnswer], options); 
        const result = fuse.search(cleanPlayerResponse);
        const isMatch = result.length > 0 && result[0].score < options.threshold;
        return isMatch;
      }               
      
      if (answeredAlready) {
        setAnswerFeedback("Sorry, you can't answer again!");
        return;
      }

      const userAnswer = e.target.elements.answer.value.trim().toLowerCase();
      const correctAnswer = selectedQuestion?.answer?.toLowerCase();
      const currentDisplayName = localStorage.getItem("displayName");

      // Safely parse the stored money value and initialize to 0 if it's null or invalid
      const currentMoney = Number(localStorage.getItem("money")) || 0;
      const correct = await isCorrectAnswer(correctAnswer, userAnswer, selectedQuestion.question);
      if (correct) {
        // Correct answer, so increase the money
        const newMoney =
          currentMoney + Number(selectedQuestion.value.substring(1));
        // Update the localStorage with the new money amount
        localStorage.setItem("money", Number(newMoney));

        window.setMoneyAmount(newMoney);
        setAnswerFeedback("Correct!");
        setPlayerScores((prevScores) => ({
          ...prevScores,
          [currentDisplayName]: `$${newMoney}`,
        }));
        window.sendMessage({
          action: "notifyOthersAboutCorrect",
          content: { name: localStorage.getItem("displayName") },
        });
        setTimeout(() => {
          closeQuestion();
        }, 1000);
      } else {
        // let other players know something is incorrect
        window.sendMessage({
          action: "notifyOthersAboutIncorrect",
          content: { name: localStorage.getItem("displayName") },
        });
        // Incorrect answer, so decrease the money
        const newMoney =
          currentMoney - Number(selectedQuestion.value.substring(1));
        // Update the localStorage with the new money amount
        localStorage.setItem("money", Number(newMoney));

        window.setMoneyAmount(newMoney);
        setAnswerFeedback("Wrong!");
        setPlayerScores((prevScores) => ({
          ...prevScores,
          [currentDisplayName]: `$${newMoney}`,
        }));
      }

      setAnsweredAlready(true);
    },
    [selectedQuestion, answeredAlready, closeQuestion]
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
      <div className={styles.playerScores}>
        <h2>Player Scores</h2>
        {Object.entries(playerScores).map(([player, score]) => (
          <div key={player} className={styles.playerScore}>
            {player}: {score}
          </div>
        ))}
      </div>
      {expandingBox && (
        <div
          className={`${styles.expandingBox} ${
            selectedQuestion ? styles.expanded : ""
          }`}
        >
          {selectedQuestion ? (
            <div className={styles.questionContent}>
              <h2 className={styles.questionHeader}>
                {selectedQuestion.category}
              </h2>
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
      {incorrectNotification && (
        <div className={styles.incorrectNotification}>
          {incorrectNotification}
        </div>
      )}
      {correctNotification && (
        <div className={styles.correctNotification}>{correctNotification}</div>
      )}
      <div>
        {!selectedQuestion && (
          <button onClick={nextRound} className={styles.nextRoundButton}>
            Next Round!
          </button>
        )}
      </div>
    </div>
  );
}
