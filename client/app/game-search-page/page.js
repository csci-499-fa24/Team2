"use client";
import React, { useEffect, useState } from "react";
import styles from './game-search.module.css'
import { useDispatch, useSelector } from "react-redux";
import { setSelectedData } from "../redux/data";
import { useRouter } from 'next/navigation';

export default function GameSearchingPage() {
    const [jeopardies, setJeopardies] = useState([]);
    const selectedData = useSelector((state) => state.selectedData.value);
    const dispatch  = useDispatch();
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
                dispatch(setSelectedData(data));
                console.log("Fetched Show Data:", data);
                router.push('../game-board/')
            })
            .catch((error) => {
                console.error("Error fetching show data:", error);
            });
    };

    useEffect(() => {
        console.log("Selected Data Updated:", selectedData); // Log selected data changes
    }, [selectedData]);

    return (
        <div>
            <h1>Jeopardy Show Numbers</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {jeopardies.map((jeopardy, index) => (
                    <button
                        className={styles.button}
                        key={index}
                        onClick={() => fetchShowData(jeopardy.show_number)}
                    >
                        Show Number: {jeopardy.show_number}
                    </button>
                ))}
            </div>
        </div>
    );
}
