"use client";
import React, { useEffect, useState } from "react";
import styles from "./game-search.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedData } from "../redux/data";
import { useRouter } from "next/navigation";

export default function GameSearchingPage() {
  const [jeopardies, setJeopardies] = useState([]);
  const selectedData = useSelector((state) => state.selectedData.value);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/jeopardy")
      .then((response) => response.json())
      .then((data) => {
        setJeopardies(data);
        console.log("Fetched Data:", data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const fetchShowData = (showNumber) => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/jeopardy/${showNumber}`)
      .then((response) => response.json())
      .then((data) => {
        const organizedData = organizeJeopardyData(data);
        dispatch(setSelectedData(organizedData));
        console.log("Fetched and Organized Show Data:", organizedData);
        router.push("../game-board/");
      })
      .catch((error) => {
        console.error("Error fetching show data:", error);
      });
  };

  const organizeJeopardyData = (data) => {
    // Group questions by category and remove duplicates
    const questionsByCategory = data.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = new Map();
      }
      if (!acc[question.category].has(question.question)) {
        acc[question.category].set(question.question, question);
      }
      return acc;
    }, {});

    // Convert to array and sort by number of distinct questions
    const sortedCategories = Object.entries(questionsByCategory)
      .map(([category, questionsMap]) => [
        category,
        Array.from(questionsMap.values()),
      ])
      .sort((a, b) => b[1].length - a[1].length);

    // Select categories
    const selectedCategories = [];
    let remainingSlots = 6;

    // First, add categories with 5 or more questions
    for (const [category, questions] of sortedCategories) {
      if (questions.length >= 5 && remainingSlots > 0) {
        selectedCategories.push([category, questions.slice(0, 5)]);
        remainingSlots--;
      }
      if (remainingSlots === 0) break;
    }

    // If there are still slots, fill with categories that have at least one question
    if (remainingSlots > 0) {
      for (const [category, questions] of sortedCategories) {
        if (
          !selectedCategories.some(([c, _]) => c === category) &&
          questions.length > 0
        ) {
          selectedCategories.push([category, questions]);
          remainingSlots--;
        }
        if (remainingSlots === 0) break;
      }
    }

    // Organize the questions, keeping original values
    const organizedQuestions = selectedCategories.map(
      ([category, questions]) => {
        return questions.map((question) => ({
          ...question,
          value: question.value,
        }));
      }
    );

    return organizedQuestions;
  };

  useEffect(() => {
    console.log("Selected Data Updated:", selectedData);
  }, [selectedData]);

  return (
    <div>
      <h1>Jeopardy Show Numbers</h1>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {jeopardies.map((Jeopardies, index) => (
          <button
            className={styles.button}
            key={index}
            onClick={() => fetchShowData(Jeopardies.show_number)}
          >
            Show Number: {Jeopardies.show_number}
          </button>
        ))}
      </div>
    </div>
  );
}
