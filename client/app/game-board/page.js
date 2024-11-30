"use client";
import React from "react";
import styles from "./game-board.module.css";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useGameBoardLogic } from "./useGameBoardLogic";

function ExpandingBox(props) {
  const {
    expandingBox,
    selectedQuestion,
    closeQuestion,
    handleSubmit,
    answerFeedback,
    questionRef,
    isDailyDouble,
    setWagerAmount,
  } = props;

  return (
    <div
      className={`${styles.expandingBox} ${
        selectedQuestion ? styles.expanded : ""
      }`}
    >
      {selectedQuestion ? (
        <div className={styles.questionContent}>
          {selectedQuestion.imageLink && (
            <img
              src={selectedQuestion.imageLink}
              alt="Clue image"
              className={styles.clueImage}
            />
          )}
          {selectedQuestion.mediaLink && (
            <div className={styles.mediaLinkContainer}>
              <a
                href={selectedQuestion.mediaLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link to Media
              </a>
            </div>
          )}
          {isDailyDouble && (
            <h2 className={styles.dailyDoubleHeader}>DAILY DOUBLE!</h2>
          )}
          <h2 className={styles.questionHeader}>
            {selectedQuestion.category}
          </h2>
          <p className={styles.questionText}>
            {selectedQuestion.processedText}
          </p>
          <form onSubmit={handleSubmit}>
            {isDailyDouble && (
              <input
                type="number"
                name="wager"
                required
                className={`${styles.wagerInput} ${styles.dailyDouble}`}
                placeholder=" Your wager"
                min="0"
                max={
                  Number(localStorage.getItem("money")) > 0
                    ? Number(localStorage.getItem("money"))
                    : 1000
                }
                onChange={(e) => setWagerAmount(e.target.value)}
              />
            )}
            <input
              type="text"
              name="answer"
              required
              ref={questionRef}
              className={`${styles.answerInput} ${
                isDailyDouble ? styles.dailyDouble : ""
              }`}
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
        `${expandingBox.value}`
      )}
    </div>
  );
}

function PlayerScores({
  playerScores,
  lastPlayerCorrect,
  selectedQuestion,
  nextRound,
  round,
}) {
  return (
    <div className={styles.playerScores}>
      <h2>Player Scores</h2>
      {Object.entries(playerScores).map(([player, score]) => (
        <div key={player} className={styles.playerScore}>
          {player}: ${score.money}
        </div>
      ))}
      <div className={styles.playerSelectingNext}>
        <h2>Player Selecting Next:</h2>
        <p>{lastPlayerCorrect}</p>
      </div>
      <div className={styles.nextRoundButtonContainer}>
        {!selectedQuestion && (
          <button onClick={nextRound} className={styles.nextRoundButton}>
            {round === "Final Jeopardy!" ? "End Game" : "Next Round!"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function GameBoardPage() {
  const selectedData = useSelector((state) => state.selectedData.value);
  const router = useRouter();

  const {
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
  } = useGameBoardLogic(selectedData, router);

  return (
    <div className={styles.page}>
      <div className={styles.gameBoard}>
        <div className={styles.firstbuttonrow}>{renderCategories()}</div>
        {renderRows()}
      </div>
      <PlayerScores
        playerScores={playerScores}
        lastPlayerCorrect={lastPlayerCorrect}
        selectedQuestion={selectedQuestion}
        nextRound={nextRound}
        round={round}
      />
      {expandingBox && (
        <ExpandingBox
          expandingBox={expandingBox}
          selectedQuestion={selectedQuestion}
          closeQuestion={closeQuestion}
          handleSubmit={handleSubmit}
          answerFeedback={answerFeedback}
          questionRef={questionRef}
          setWagerAmount={setWagerAmount}
        />
      )}
      {dailyDoubleExpandingBox && (
        <ExpandingBox
          expandingBox={dailyDoubleExpandingBox}
          selectedQuestion={selectedQuestion}
          closeQuestion={closeQuestion}
          handleSubmit={handleSubmit}
          answerFeedback={answerFeedback}
          questionRef={questionRef}
          isDailyDouble={true}
          setWagerAmount={setWagerAmount}
        />
      )}
      {incorrectNotification && (
        <div className={styles.incorrectNotification}>
          {incorrectNotification}
        </div>
      )}
      {correctNotification && (
        <div className={styles.correctNotification}>{correctNotification}</div>
      )}
      {turnNotification && (
        <div className={styles.turnNotification}>{turnNotification}</div>
      )}
      {clueAnswerNotification && (
        <div className={styles.clueAnswerNotification}>
          {clueAnswerNotification}
        </div>
      )}
      <div>
        {!selectedQuestion && (
          <button onClick={nextRound} className={styles.nextRoundButton}>
            {round === "Final Jeopardy!" ? "End Game" : "Next Round!"}
          </button>
        )}
      </div>
    </div>
  );
}
