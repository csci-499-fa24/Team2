"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateDisplayName, updateUserEmail } from "../../redux/authSlice";
import styles from "./profile.module.css";
import Navbar from "@/app/components/navbar";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const MOCK_GAME_HISTORY = [
  {
    id: 1,
    show_number: "8765",
    points: 600,
    date: "2024-03-15",
    win: true,
  },
  {
    id: 2,
    show_number: "8764",
    points: 400,
    date: "2024-03-14",
    win: false,
  },
  {
    id: 3,
    show_number: "8762",
    points: 2100,
    date: "2024-03-12",
    win: true,
  },
  {
    id: 4,
    show_number: "8761",
    points: 800,
    date: "2024-03-11",
    win: false,
  },
  {
    id: 5,
    show_number: "8758",
    points: 900,
    date: "2024-03-08",
    win: true,
  },
  {
    id: 6,
    show_number: "8757",
    points: 2300,
    date: "2024-03-07",
    win: true,
  },
];

const ProfilePage = () => {
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);
  const [userid, setUserid] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [gameHistory, setGameHistory] = useState(MOCK_GAME_HISTORY);
  const [activeTab, setActiveTab] = useState("profile");
  const dispatch = useDispatch();

  useEffect(() => {
    const mockUser = {
      email: "test@example.com",
      displayName: "Test User",
      uid: "123456",
    };

    if (!user && !loading) {
      setUserEmail(mockUser.email);
      setDisplayName(mockUser.displayName);
      setUserid(mockUser.uid);
    } else if (user) {
      setUserEmail(user.email);
      setDisplayName(user.displayName);
      setUserid(user.uid);
    }
  }, [user]);

  const handleForm = async (e) => {
    e.preventDefault();
    const emailToUpdate = newEmail === "" ? userEmail : newEmail;
    const displayNameToUpdate =
      newDisplayName === "" ? displayName : newDisplayName;
    let updatedName = false;
    let updatedEmail = false;

    if (displayNameToUpdate !== displayName || emailToUpdate !== userEmail) {
      if (displayNameToUpdate !== displayName) {
        try {
          console.log("update in progress");
          console.log("userid: ", userid);
          const isDisplayNameUpdated = await dispatch(
            updateDisplayName(userid, displayNameToUpdate)
          );
          console.log("updatedDisplayName:", isDisplayNameUpdated);
          if (isDisplayNameUpdated) {
            window.setDisplayName(newDisplayName);
            updatedName = true;
          } else {
            updatedName = false;
          }
        } catch (error) {
          alert("Error updating profile. Please try again.");
        }
      }

      if (emailToUpdate !== userEmail) {
        try {
          const isEmailUpdated = await dispatch(
            updateUserEmail(userid, emailToUpdate)
          );
          if (isEmailUpdated) {
            updatedEmail = true;
          } else {
            updatedEmail = false;
          }
        } catch (error) {
          alert("Error updating profile. Please try again.");
        }
      }

      if (updatedName || updatedEmail) {
        alert("Profile updated successfully.");
      } else if (!updatedName) {
        alert("Display name already exists. Please choose another one.");
      } else if (!updatedEmail) {
        alert("Email already exists. Please choose another one.");
      }
    } else {
      alert("No changes made.");
    }
  };
  const ProfileTab = () => (
    <div className={styles.contentWrapper}>
      <h2 className={styles.profileGreeting}>Hello, {displayName}!</h2>
      <div className={styles.formWrapper}>
        <form className={styles.formContainer}>
          <label htmlFor="email" className={styles.inputLabel}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            disabled
            className={`${styles.inputField} ${styles.disabledInput}`}
            placeholder={userEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <label htmlFor="displayName" className={styles.inputLabel}>
            Display Name:
          </label>
          <input
            type="text"
            name="displayName"
            id="displayName"
            className={styles.inputField}
            value={newDisplayName}
            placeholder={displayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />
        </form>
        <div className={styles.buttonsContainer}>
          <button className={styles.buttons} onClick={handleForm}>
            Update Profile
          </button>
          <button
            className={styles.buttons}
            onClick={() => router.push(`/${userid}`)}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className={styles.contentWrapper}>
      <div className={styles.gameHistoryContainer}>
        <h3 className={styles.gameHistoryTitle}>Past Games</h3>
        <div className={styles.scrollableHistory}>
          <div className={styles.gameHistoryGrid}>
            {gameHistory && gameHistory.length > 0 ? (
              gameHistory.map((game) => (
                <div key={game.id} className={styles.gameHistoryCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.showNumber}>
                      Show #{game.show_number}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Points Earned</span>
                      <span className={styles.statValue}>
                        {game.points.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Date</span>
                      <span className={styles.statValue}>{game.date}</span>
                    </div>
                    <div className={styles.resultSection}>
                      <span className={styles.resultLabel}>
                        Result:{" "}
                        <span className={game.win ? styles.win : styles.loss}>
                          {game.win ? "Victory" : "Defeat"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No past games available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ChartsTab = () => {
    const wins = gameHistory.filter((game) => game.win).length;
    const losses = gameHistory.length - wins;
    const pieData = [
      { name: "Wins", value: wins, color: "#4ade80" },
      { name: "Losses", value: losses, color: "#f87171" },
    ];

    return (
      <div className={styles.chartsContainer}>
        <div className={styles.chartsGrid}>
          {/* Win/Loss Distribution */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Win/Loss Distribution</h3>
            </div>
            <div className={styles.chartContent}>
              <PieChart width={300} height={300}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* Points History */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Points History</h3>
            </div>
            <div className={styles.chartContent}>
              <LineChart
                width={400}
                height={300}
                data={[...gameHistory].reverse()}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  name="Points"
                />
              </LineChart>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <p className={styles.statNumber}>{wins}</p>
              <p className={styles.statLabel}>Total Wins</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <p className={styles.statNumber}>{losses}</p>
              <p className={styles.statLabel}>Total Losses</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <p className={styles.statNumber}>
                {Math.round((wins / gameHistory.length) * 100)}%
              </p>
              <p className={styles.statLabel}>Win Rate</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className={styles.profileContainer}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsWrapper}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "profile" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "history" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "charts" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("charts")}
            >
              Stats
            </button>
          </div>
        </div>
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "charts" && <ChartsTab />}
      </div>
    </div>
  );
};

export default ProfilePage;
