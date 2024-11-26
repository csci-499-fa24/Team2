import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export const useSocket = (onMessageReceivedCallback) => {
  const socketRef = useRef(null);
  const [roomKey, setRoomKey] = useState("");
  const [socketDisplayName, setSocketDisplayName] = useState("");
  const user = useSelector((state) => state.auth.user);
  const [socketMessage, setSocketMessage] = useState("");
  const [roomsData, setRoomsData] = useState(null);
  const [playersInRoom, setPlayersInRoom] = useState([]);
  const [money, setMoney] = useState(0);
  const socketDisplayNameRef = useRef("");

  // New function to manage participant endpoints
  const manageParticipant = async (action, gameId) => {
    const userId = user?.uid;
    const displayName = socketDisplayNameRef.current;

    if (!userId || !displayName || !gameId) {
      console.log(
        "[Client-side Error] Missing required parameters for participant management"
      );
      return;
    }

    try {
      const endpoint =
        action === "add" ? "add-participant" : "remove-participant";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games/${endpoint}/${gameId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            displayName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} participant`);
      }

      console.log(
        `[Client-side Acknowledgement] Successfully ${action}${
          action === "add" ? "ed" : "d"
        } participant`
      );
    } catch (error) {
      console.error(
        `[Client-side Error] Failed to ${action} participant:`,
        error
      );
    }
  };

  // setting socket displayName from logged in user
  useEffect(() => {
    if (user && window.location.pathname != "/") {
      setDisplayName(user.displayName);
      setSocketDisplayName(user.displayName);
      socketDisplayNameRef.current = user.displayName;
    } else if (window.location.pathname != "/") {
      const storedDisplayName = localStorage.getItem("displayName");
      if (storedDisplayName) {
        setSocketDisplayName(storedDisplayName);
        socketDisplayNameRef.current = storedDisplayName;
        console.log(
          `[Client-side Acknowledgement] Retrieved display name from localStorage: ${storedDisplayName}`
        );
      }
    }
  }, [user]);

  // Change localStorage based on the current route
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const gameId = localStorage.getItem("roomKey");

      if (currentPath === "/") {
        if (gameId) {
          manageParticipant("remove", gameId);
        }
        localStorage.removeItem("displayName");
        localStorage.removeItem("roomKey");
        localStorage.removeItem("money");
        setSocketDisplayName("");
        setRoomKey("");
        setMoney(0);
        socketDisplayNameRef.current = "";
        console.log("[Client-side Acknowledgement] localStorage cleared.");
      } else {
        (async () => {
          const storedDisplayName = localStorage.getItem("displayName");
          if (storedDisplayName) {
            await new Promise((resolve) => {
              setSocketDisplayName(storedDisplayName);
              socketDisplayNameRef.current = storedDisplayName;
              console.log(
                `[Client-side Acknowledgement] Retrieved display name from localStorage: ${storedDisplayName}`
              );
              resolve();
            });
          }

          const storedRoomKey = localStorage.getItem("roomKey");
          if (storedRoomKey) {
            setRoomKey(storedRoomKey);
            console.log(
              `[Client-side Acknowledgement] Retrieved room key from localStorage: ${storedRoomKey}`
            );
            await manageParticipant("add", storedRoomKey);
          }

          if (storedRoomKey && socketRef.current) {
            console.log(
              "[Client-side Acknowledgement] Requesting players in the current room..."
            );
            socketRef.current.emit("getPlayersInRoom", {
              roomKey: storedRoomKey,
            });
            console.log(
              `[Client-side Acknowledgement] Requesting players in room ${storedRoomKey}...`
            );
          }

          const storedMoney = localStorage.getItem("money");
          if (storedMoney) {
            setMoney(Number(storedMoney));
            console.log(
              `[Client-side Acknowledgement] Retrieved money from localStorage: ${storedMoney}`
            );
          }
        })();
      }
    }
  }, []);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SERVER_URL);

    socketRef.current = socketInstance;

    console.log(
      "[Client-side Acknowledgement] Socket initialized. Attaching listeners and emitting events..."
    );

    socketInstance.on("confirmReceivedRoom", (message) => {
      console.log("[From Server] - ", message);
    });

    socketInstance.on("promptDisplayName", (message) => {
      console.log("[From Server: Display Name Error] - ", message);
    });

    socketInstance.on("newPlayerJoined", (message) => {
      console.log("[From Server: New player joined] -", message);
    });

    socketInstance.on("player_joined", (message) => {
      console.log("[From Server: Player joined] -", message);
    });

    socketInstance.on("playersInRoom", (players) => {
      const playerList = Object.entries(players).map(([name, attributes]) => ({
        name,
        ...attributes,
      }));

      setPlayersInRoom(playerList);
      console.log("[From Server: Players in room] -", playerList);
    });

    socketInstance.on("receivedCustomMessage", (message) => {
      console.log(
        "[From Server: Custom message received] -",
        message["action"],
        message["content"]
      );
      if (onMessageReceivedCallback) {
        onMessageReceivedCallback(message);
      }
    });

    socketInstance.on("receiveRooms", (rooms) => {
      setRoomsData(rooms);
    });

    return () => {
      if (socketRef.current) {
        const gameId = localStorage.getItem("roomKey");
        if (gameId) {
          manageParticipant("remove", gameId);
        }
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && socketDisplayName) {
      socketRef.current.emit("displayName", socketDisplayName);
      localStorage.setItem("displayName", socketDisplayName);
      console.log(
        `[Client-side Acknowledgement] Display name set automatically to ${socketDisplayName}`
      );
    }
  }, [socketDisplayName]);

  useEffect(() => {
    if (socketRef.current && roomKey) {
      socketRef.current.emit("roomKey", roomKey);
      localStorage.setItem("roomKey", roomKey);
      console.log(
        `[Client-side Acknowledgement] Room key set automatically to ${roomKey}`
      );
      socketRef.current.emit("getPlayersInRoom", { roomKey });
    }
  }, [roomKey]);

  useEffect(() => {
    if (socketRef.current) {
      console.log(
        "[Client-side Acknowledgement] Listening for updated player list..."
      );
      socketRef.current.on("playersInRoom", (players) => {
        setPlayersInRoom(players);
        console.log("[From Server: Players in room] -", players);
      });
    }
  }, []);

  useEffect(() => {
    const storedMoney = localStorage.getItem("money");
    if (storedMoney) {
      setMoney(Number(storedMoney));
      console.log(
        "[Client-side Acknowledgement] Loaded money from localStorage."
      );
    }
  }, []);

  useEffect(() => {
    if (money !== null) {
      localStorage.setItem("money", money);
    }
  }, [money]);

  useEffect(() => {
    if (socketRef.current && socketMessage) {
      socketRef.current.emit("customMessage", {
        roomKey: roomKey,
        displayName: socketDisplayName,
        message: socketMessage,
      });
    }
  }, [socketMessage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.setDisplayName = (name) => {
        if (name === "" || name === null || name === "null") {
          console.log(
            "[Client-side Acknowledgement] Display name cannot be empty."
          );
          return;
        }

        setSocketDisplayName(name);
        socketDisplayNameRef.current = name;
        localStorage.setItem("displayName", name);
        console.log(
          `[Client-side Acknowledgement] Display name set to: "${name}"`
        );
      };

      window.addPlayerToRoom = (roomKey, displayName) => {
        if (socketRef.current) {
          console.log(
            `[Client-side Acknowledgement] Adding player "${displayName}" to room "${roomKey}"...`
          );
          socketRef.current.emit("setPlayersInRoom", {
            roomKey: roomKey,
            displayName: displayName,
          });
        }

        setPlayersInRoom((prevPlayers) => {
          return [...prevPlayers, { name: displayName }];
        });

        localStorage.setItem("players", JSON.stringify(playersInRoom));

        console.log(
          `[Client-side Acknowledgement] Player "${displayName}" added to room "${roomKey}"`
        );
      };

      window.setRoomKey = (key) => {
        if (socketDisplayNameRef.current) {
          setRoomKey(key);
          localStorage.setItem("roomKey", key);
          console.log(`[Client-side Acknowledgement] Room key set to: ${key}`);
        } else {
          console.log(
            "[Client-side Acknowledgement] Cannot set room key before setting display name."
          );
        }
      };

      window.togglePlayerStatus = (roomKey, displayName) => {
        if (socketRef.current && roomKey && displayName) {
          console.log(
            `[Client-side Acknowledgement] Toggling player status for ${displayName} in ${roomKey}`
          );
          socketRef.current.emit("player_ready", {
            roomKey: roomKey,
            displayName: displayName,
          });
        }
      };

      window.setMoneyAmount = (amount) => {
        if (typeof amount === "number") {
          setMoney(amount);
          if (socketRef.current) {
            socketRef.current.emit("setMoneyAmount", {
              displayName: localStorage.getItem("displayName"),
              roomKey: localStorage.getItem("roomKey"),
              money: amount,
            });
          }
        }
      };

      window.sendMessage = (msg) => {
        setSocketMessage(msg);
        console.log(`[Client-side Acknowledgement] Message sent: "${msg}"`);
      };

      window.getRooms = () => {
        if (socketRef.current) {
          socketRef.current.emit("getRooms");
        } else {
          console.log(
            "[Client-side Acknowledgement] Socket is not initialized."
          );
        }
      };

      window.getPlayersInRoom = () => {
        if (socketRef.current) {
          console.log(
            "[Client-side Acknowledgement] Requesting players in the current room..."
          );
          socketRef.current.emit("getPlayersInRoom");
        }
      };

      // Add new functions for participant management
      window.addParticipant = async (gameId) => {
        await manageParticipant("add", gameId);
      };

      window.removeParticipant = async (gameId) => {
        await manageParticipant("remove", gameId);
      };

      // Modified endGame function to use completeRoomInfo
      window.endGame = async () => {
        const completeRoomInfo = localStorage.getItem("completeRoomInfo");
        if (completeRoomInfo && socketRef.current) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_URL}/endGame`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: completeRoomInfo,
              }
            );

            if (!response.ok) {
              throw new Error("Failed to end game");
            }

            console.log(
              "[Client-side Acknowledgement] Game ended successfully"
            );
          } catch (error) {
            console.error("[Client-side Error] Failed to end game:", error);
          }
        }
      };
    }
  }, []);

  return socketRef.current;
};
