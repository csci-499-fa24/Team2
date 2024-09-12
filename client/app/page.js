'use client'

import styles from "./page.module.css";
import React, {useEffect, useState} from 'react'

export default function Home() {
  
  const [message, setMessage] = useState("Loading")

  console.log(process.env.NEXT_PUBLIC_SERVER_URL + "/api/home")
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/home").then(
      response => response.json()
    ).then(
      data => {
        console.log(data)
        setMessage(data.message)
      }
    )
  }, [])
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>Return message from server</div>
        <div>{message}</div>
      </main>
    </div>
  );
}
