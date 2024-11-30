import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./game-board.module.css";
import { useSocket } from "../socketClient";
import { parseQuestionContent, formatQuestion, getAnswerFromGoogle, isCorrectAnswer } from "./utils";
import axios from "axios";

export function useGameBoardLogic(selectedData, router) {
  const [round, setRound] = useState("");
  const [roundInfo, setRoundInfo] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [expandingBox, setExpandingBox] = useState(null);
  const [dailyDoubleExpandingBox, setDailyDoubleExpandingBox] = useState(null);
  const [wagerAmount, setWagerAmount] = useState("");
  const [disabledQuestions, setDisabledQuestions] = useState([]);
  const [completeRoomInfo, setCompleteRoomInfo] = useState(null);
  const [answeredAlready, setAnsweredAlready] = useState(false);
  const [playerScores, setPlayerScores] = useState({});
  const [incorrectNotification, setIncorrectNotification] = useState(null);
  const [correctNotification, setCorrectNotification] = useState(null);
  const [turnNotification, setTurnNotification] = useState(null);
  const [lastPlayerCorrect, setLastPlayerCorrect] = useState("");
  const [currentClueAnswer, setCurrentClueAnswer] = useState(null);
  const [clueAnswerNotification, setClueAnswerNotification] = useState(null);
  const questionRef = useRef(null);

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

  // Function to update round state
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

  // Return the current round of that game with all the categories and values
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

  // Set the initial state of round at the beginning of the game
  useEffect(() => {
    updateRound();
  }, []);

  const endGame = async () => {
    try {
      const winner = determineWinner(playerScores);
      if (winner) {
        // Display winner alert before any further processing
        alert(`${winner} is the winner!`);

        // Convert `showNumber` to a number if necessary
        const showNumber = isNaN(Number(round)) ? 1 : Number(round); // Default to 1 if not a number
        const points = playerScores[winner]; // Get the points for the winner 

        const gameData = {
          gameId: selectedData,
          showNumber,
          owner: winner,
          winner,
          points,
          players: Object.keys(playerScores), // Needs to be made the correct array with userIDs
        };

        console.log("Sending game data:", gameData);

        // Step 1: Record the game history
        // await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/history/record_game`, gameData);
        console.log("Game history temporarily not recorded.");

        // Step 2: End the game
        const endGameResponse = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/end-game/${selectedData}`);
        console.log(endGameResponse.data.message); // Outputs: "Game {gameId} has been ended."
      }
    } catch (error) {
      console.error("Failed to record or end game:", error);
    } finally {
      // Delay the redirect slightly to ensure the alert has time to display
      setTimeout(() => {
        router.push("../");
      }, 1000);
    }
  };

  // Helper function to determine the winner based on playerScores
  const determineWinner = (scores) => {
    const players = Object.keys(scores);
    if (players.length === 0) return null;

    let winner = players[0];
    for (let i = 1; i < players.length; i++) {
      if (scores[players[i]] > scores[winner]) {
        winner = players[i];
      }
    }
    return winner;
  };

  // Optional: Display a winner popup
  const showWinnerPopup = () => {
    const winner = determineWinner(playerScores);
    if (winner) {
      console.log(`${winner} is the winner!`); // Keep the console log for debugging purposes
    }
  };

  // Next round function that handles final round and winner popup
  const nextRound = () => {
    if (round === "Final Jeopardy!") {
      showWinnerPopup();
      endGame(); // Ensure history call and redirection
    } else {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/next-round/${selectedData}`,
        { method: "POST" }
      )
        .then(() => {
          console.log("Moving to the next round");
          updateRound();
          calledNextRound();
        })
        .catch((err) => console.log("Round can't proceed:", err));
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

  useEffect(() => {
    if (!roundInfo || !Array.isArray(roundInfo) || roundInfo.length === 0) {
      return;
    }

    // Convert the first clue's category into a numeric value and apply mod 15, then scale to 10-25
    const firstCategory = roundInfo[0]?.category || "";
    const categorySum = firstCategory
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const modValue = (categorySum % 15) + 10; // Ensures a value between 10 and 25

    let counter = 0;

    for (let i = 0; i < roundInfo.length; i++) {
      const categoryData = roundInfo[i];
      if (Array.isArray(categoryData.values)) {
        for (let j = 0; j < categoryData.values.length; j++) {
          counter++;
          if (counter === modValue) {
            const value = categoryData.values[j];
            const category = categoryData.category;

            // Fetch the question for the "Daily Double"
            fetch(
              `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/question/${selectedData}?category=${encodeURIComponent(
                category
              )}&value=${encodeURIComponent(value)}`
            )
              .then((response) => response.json())
              .then((data) => {
                if (data && data.question) {
                  localStorage.setItem("dailyDoubleClue", data.question);
                  console.log("Daily Double Clue set:", data.category, data.value);
                } else {
                  console.error(
                    "No question found for the given category and value."
                  );
                }
              })
              .catch((error) => {
                console.error("Failed to fetch question:", error);
              });
            return; // Exit loop after finding the "Daily Double"
          }
        }
      }
    }
  }, [roundInfo, selectedData]);

  // Update playerScores when completeRoomInfo changes
  useEffect(() => {
    const currentRoomKey = localStorage.getItem("roomKey");
    const storedRoomInfo = localStorage.getItem("completeRoomInfo");
    if (storedRoomInfo) {
      const parsedRoomInfo = JSON.parse(storedRoomInfo);
      const currentRoomObject = parsedRoomInfo[currentRoomKey] || {};
  
      // Initialize money property for each player if not set
      const updatedPlayerScores = {};
      Object.keys(currentRoomObject).forEach((player) => {
        const playerData = currentRoomObject[player];
        updatedPlayerScores[player] = {
          ...playerData,
          money: playerData.money !== undefined ? playerData.money : 0,
        };
      });
  
      setPlayerScores(updatedPlayerScores);
    }
  }, [completeRoomInfo]);

  // Initialize lastPlayerCorrect
  useEffect(() => {
    if (
      lastPlayerCorrect === "" &&
      roundInfo &&
      roundInfo.length > 0 &&
      playerScores &&
      Object.keys(playerScores).length > 0
    ) {
      const firstCategory = roundInfo[0]?.category || "";
      const categorySum = firstCategory
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const players = Object.keys(playerScores);
      const modValue = categorySum % players.length;
      const firstPlayer = players[modValue];
      setLastPlayerCorrect(firstPlayer);
      console.log("Initial lastPlayerCorrect set to:", firstPlayer);
      // Send to other users
      window.sendMessage({
        action: "updateLastPlayerCorrect",
        content: { lastPlayerCorrect: firstPlayer },
      });
    }
  }, [roundInfo, playerScores, lastPlayerCorrect]);

  const clickMe = useCallback(
    (question, value) => {
      const isCurrentPlayerTurn = localStorage.getItem("displayName") === lastPlayerCorrect;

      console.log(question, value);

      if (
        disabledQuestions.some(
          (q) => q.category === question.category && q.value === question.value
        )
      )
        return;

      if (!isCurrentPlayerTurn) {
        setTurnNotification("Not your turn!");
        setTimeout(() => {
          setTurnNotification(null);
        }, 3000);
        return;
      }

      const dailyDoubleClue = localStorage.getItem("dailyDoubleClue");

      if (question.question === dailyDoubleClue) {
        // It's the daily double
        setDailyDoubleExpandingBox({ question, value, isOtherUser: false });
      } else {
        setExpandingBox({ question, value });
      }

      const updatedDisabledQuestions = [...disabledQuestions, question];
      setDisabledQuestions(updatedDisabledQuestions);

      setAnsweredAlready(false);

      window.sendMessage({
        action: "clickQuestion",
        content: {
          question,
          disabledQuestions: updatedDisabledQuestions,
          clickedByUser: localStorage.getItem("displayName"),
        },
      });

      setTimeout(() => {
        // Process the question content to extract image link
        const { processedText, imageLink, mediaLink } = parseQuestionContent(
          question.question
        );
        setSelectedQuestion({
          ...question,
          isDailyDouble: question.question === dailyDoubleClue,
          processedText,
          imageLink,
          mediaLink,
        });
        setCurrentClueAnswer(question.answer); // Set the current clue answer
      }, 500);
      setAnswerFeedback("");
    },
    [disabledQuestions, lastPlayerCorrect]
  );

  const socketClickMe = useCallback(
    (question, value, updatedDisabledQuestions, clickedByUser) => {
      const dailyDoubleClue = localStorage.getItem("dailyDoubleClue");
      const currentUser = localStorage.getItem("displayName");
      if (question.question === dailyDoubleClue) {
        if (clickedByUser === currentUser) {
          // It's us who clicked the daily double
          setDailyDoubleExpandingBox({ question, value, isOtherUser: false });
        } else {
          // Another user has clicked on the daily double clue
          setDailyDoubleExpandingBox({
            question,
            value,
            isOtherUser: true,
            clickedByUser,
          });
        }
      } else {
        setExpandingBox({ question, value });
      }

      setDisabledQuestions(updatedDisabledQuestions);
      setTimeout(() => {
        // Process the question content to extract image link
        const { processedText, imageLink, mediaLink } = parseQuestionContent(
          question.question
        );
        setSelectedQuestion({
          ...question,
          isDailyDouble: question.question === dailyDoubleClue,
          processedText,
          imageLink,
          mediaLink,
        });
        setCurrentClueAnswer(question.answer); // Set the current clue answer
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
      content: { clueAnswer: currentClueAnswer },
    });
    // Display the notification locally
    setClueAnswerNotification(`The correct answer was: ${currentClueAnswer}`);
    setTimeout(() => {
      setClueAnswerNotification(null);
    }, 3000);
    setTimeout(() => {
      setExpandingBox(null);
      setDailyDoubleExpandingBox(null);
    }, 500);
    setCurrentClueAnswer(null); // Clear the current clue answer
  }, [currentClueAnswer]);

  // Triggering nextRound message function
  const calledNextRound = useCallback(() => {
    console.log("triggered calledNextRound");
    window.sendMessage({
      action: "calledNextRound",
      content: "",
    });
  }, []);

  // Receiving nextRound message function
  const socketNextRound = useCallback(() => {
    updateRound();
  }, []);

  const socketCloseQuestion = useCallback((clueAnswer) => {
    setSelectedQuestion(null);
    // Display the notification
    setClueAnswerNotification(`The correct answer was: ${clueAnswer}`);
    setTimeout(() => {
      setClueAnswerNotification(null);
    }, 3000);
    setTimeout(() => {
      setExpandingBox(null);
      setDailyDoubleExpandingBox(null);
    }, 500);
    setCurrentClueAnswer(null); // Clear the current clue answer
  }, []);

  const handleServerMessage = useCallback(
    (message) => {
      const action = message["action"];
      if (action === "clickQuestion") {
        const {
          question,
          disabledQuestions: updatedDisabledQuestions,
          clickedByUser,
        } = message["content"];
        console.log(
          "Received clickQuestion:",
          question,
          updatedDisabledQuestions
        );
        socketClickMe(
          question,
          question.value,
          updatedDisabledQuestions,
          clickedByUser
        );
      } else if (action === "closeQuestion") {
        const { clueAnswer } = message["content"];
        socketCloseQuestion(clueAnswer);
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
      } else if (action === "updateLastPlayerCorrect") {
        setLastPlayerCorrect(message["content"]["lastPlayerCorrect"]);
      }
    },
    [socketClickMe, socketCloseQuestion, socketNextRound]
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

  // Function that returns the desired question according to the category and value
  const fetchQuestion = (category, value) => {
    // Fetch the question data
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
          console.log("Question fetched:", data);
          clickMe(data, value);
        } else {
          console.error("No question found for the given category and value.");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch question:", error);
      });
  };

  // Reintroduce greyed-out styling for used clues and detect clicks even when it's not the player's turn
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
                }`}
                onClick={() => {
                  if (isDisabled) {
                    // Do nothing if the clue is already used
                    return;
                  }
                  const isCurrentPlayerTurn = localStorage.getItem("displayName") === lastPlayerCorrect;
                  if (!isCurrentPlayerTurn) {
                    console.log("Not your turn!");
                    setTurnNotification("Not your turn!");
                    setTimeout(() => {
                      setTurnNotification(null);
                    }, 3000);
                    return;
                  }
                  fetchQuestion(category, value);
                }}
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
  
      if (answeredAlready) {
        setAnswerFeedback("Sorry, you can't answer again!");
        return;
      }
  
      const userAnswer = e.target.elements.answer.value.trim().toLowerCase();
      const correctAnswer = selectedQuestion?.answer?.toLowerCase();
      const currentDisplayName = localStorage.getItem("displayName");
      const currentMoney = Number(localStorage.getItem("money")) || 0;
  
      // Determine the amount to adjust based on question type
      let adjustAmount = Number(
        selectedQuestion.value.substring(1).replace(/,/g, "")
      );
  
      if (selectedQuestion.isDailyDouble) {
        adjustAmount = Number(wagerAmount);
  
        // Validate the wager amount
        if (isNaN(adjustAmount) || adjustAmount <= 0) {
          setAnswerFeedback("Invalid wager amount!");
          return;
        }
  
        const maxWager = currentMoney > 0 ? currentMoney : 1000;
        if (adjustAmount > maxWager) {
          setAnswerFeedback(`Wager cannot exceed $${maxWager}`);
          return;
        }
      }
  
      const correct = await isCorrectAnswer(
        correctAnswer,
        userAnswer,
        selectedQuestion.question
      );
      if (correct) {
        const newMoney = currentMoney + adjustAmount;
        localStorage.setItem("money", Number(newMoney));
        window.setMoneyAmount(newMoney);
        setAnswerFeedback("Correct!");
        setPlayerScores((prevScores) => ({
          ...prevScores,
          [currentDisplayName]: {
            ...prevScores[currentDisplayName],
            money: newMoney,
          },
        }));
        window.sendMessage({
          action: "notifyOthersAboutCorrect",
          content: { name: localStorage.getItem("displayName") },
        });
        setLastPlayerCorrect(currentDisplayName);
        window.sendMessage({
          action: "updateLastPlayerCorrect",
          content: { lastPlayerCorrect: currentDisplayName },
        });
        setTimeout(() => {
          closeQuestion();
        }, 1000);
      } else {
        window.sendMessage({
          action: "notifyOthersAboutIncorrect",
          content: { name: localStorage.getItem("displayName") },
        });
        const newMoney = currentMoney - adjustAmount;
        localStorage.setItem("money", Number(newMoney));
        window.setMoneyAmount(newMoney);
        setAnswerFeedback("Wrong!");
        setPlayerScores((prevScores) => ({
          ...prevScores,
          [currentDisplayName]: {
            ...prevScores[currentDisplayName],
            money: newMoney,
          },
        }));
      }
  
      setAnsweredAlready(true);
    },
    [selectedQuestion, answeredAlready, closeQuestion, wagerAmount]
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

  return {
    round,
    roundInfo,
    selectedQuestion,
    expandingBox,
    dailyDoubleExpandingBox,
    answerFeedback,
    incorrectNotification,
    correctNotification,
    turnNotification,
    clueAnswerNotification,
    playerScores,
    lastPlayerCorrect,
    disabledQuestions,
    renderCategories,
    renderRows,
    nextRound,
    closeQuestion,
    handleSubmit,
    questionRef,
    setWagerAmount,
  };
}
