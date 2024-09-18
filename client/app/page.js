'use client'

import styles from "./page.module.css";
import React, {useEffect, useState} from 'react'

export default function Home() {
  
  const [message, setMessage] = useState("Loading")
  const [Jeopardies, setJeopardies] = useState([]);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/jeopardy")
      .then(response => response.json())
      .then(data => {
        setJeopardies(data);
        console.log("Fetched Data:", data);  // Log data here
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    if (Jeopardies) {
      console.log("Jeopardies state:", Jeopardies);
    }
  }, [Jeopardies]);
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>Return message from server</div>
        {Jeopardies.length > 0 ? (
          Jeopardies.map((item, index) => (
            <div key={index}>
              <h3>{item.show_number}</h3>  
              <p>{item.question}</p>
            </div>
          ))
        ) : (
          <p>{message}</p>
        )}
      </main>
    </div>
  );
}
