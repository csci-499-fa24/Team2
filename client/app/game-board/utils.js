import axios from "axios";
import Fuse from "fuse.js";

export function parseQuestionContent(questionText) {
  let imageLink = null;
  let mediaLink = null;
  let processedText = questionText;

  // Use a regular expression to find the <a href="..."> tag
  const linkRegex = /<a href="(.*?)"[^>]*>(.*?)<\/a>/i;
  const match = linkRegex.exec(questionText);

  if (match) {
    const href = match[1]; // The href link
    const linkText = match[2]; // The text inside the <a> tag (e.g., "here")
    // Determine if the link is an image or media
    const extension = href.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      imageLink = href;
      // Replace the <a> tag with "above" or "above " if needed
      processedText = questionText.replace(match[0], "above");
    } else if (["mp3", "mp4"].includes(extension)) {
      mediaLink = href;
      // Replace the <a> tag with "Link to Media"
      processedText = questionText.replace(match[0], "[Content Linked Above]");
    } else {
      // Other types of links, treat as media link
      mediaLink = href;
      processedText = questionText.replace(match[0], "[Content Linked Above]");
    }
  }

  // Remove any other HTML tags except <a>
  processedText = processedText.replace(/<\/?(?!a)([^>]+)>/gi, "");

  return { processedText, imageLink, mediaLink };
}

export function formatQuestion(question) {
  const cleanedQuestion = question.replace(/[;:&[\]]|q\[\w+\]=/g, "").trim();
  return cleanedQuestion;
}

export async function getAnswerFromGoogle(question) {
  try {
    const formattedQuestion = formatQuestion(question);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const cxId = process.env.NEXT_PUBLIC_GOOGLE_ENGINE_ID;
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: apiKey,
          cx: cxId,
          q: formattedQuestion,
        },
      }
    );

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].snippet;
    }
    return "";
  } catch (error) {
    console.error("Error fetching answer from Google Custom Search:", error);
    return "";
  }
}

export async function isCorrectAnswer(
  correctAnswer = "",
  playerResponse = "",
  question = ""
) {
  let usedGoogle = false;
  if (!correctAnswer && question) {
    correctAnswer = await getAnswerFromGoogle(question);
    usedGoogle = true;
  }
  if (!correctAnswer || !playerResponse) {
    console.log("No correct answer or player response provided.");
    return false;
  }

  const cleanText = (text) =>
    text.replace(/[^a-zA-Z\s]/g, "").toLowerCase().trim();
  const cleanCorrectAnswer = cleanText(correctAnswer);
  const cleanPlayerResponse = cleanText(playerResponse);

  if (!cleanCorrectAnswer || !cleanPlayerResponse) {
    console.log("One of the cleaned answers is empty.");
    return false;
  }
  if (usedGoogle && cleanCorrectAnswer.includes(cleanPlayerResponse)) {
    return true;
  }

  const options = {
    includeScore: true,
    threshold: 0.3,
    keys: [],
  };
  const fuse = new Fuse([cleanCorrectAnswer], options);
  const result = fuse.search(cleanPlayerResponse);
  const isMatch =
    result.length > 0 && result[0].score < options.threshold;
  return isMatch;
}
