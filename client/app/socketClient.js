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
    // Create a ref to store socketDisplayName synchronously, as diplayName then setting roomKey timing matters
    const socketDisplayNameRef = useRef("");

    // setting socket displayName from logged in user
    useEffect(() => {
      if (user && (window.location.pathname != "/")) {
        setDisplayName(user.displayName);
        socketDisplayNameRef.current = user.displayName;
      } 
      else if (window.location.pathname != "/") {
        const storedDisplayName = localStorage.getItem("displayName");
        if (storedDisplayName) {
          setSocketDisplayName(storedDisplayName);
          socketDisplayNameRef.current = storedDisplayName;
          console.log(`[Client-side Acknowledgement] Retrieved display name from localStorage: ${storedDisplayName}`);
        }
      }
    }, [user]);

    // Change localStorage based on the current route, this is how we handle persistence
    useEffect(() => {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        if (currentPath === "/") {
          // On route '/' meaning user starts fresh, clear localStorage, otherwise we assume user wants to persist connection
          localStorage.removeItem("displayName");
          localStorage.removeItem("roomKey");
          localStorage.removeItem("money"); // Clear money on fresh start
          setSocketDisplayName("");
          setRoomKey("");
          setMoney(0);
          socketDisplayNameRef.current = "";
          console.log("[Client-side Acknowledgement] localStorage cleared.");
        } else {
          (async () => {
            // First, retrieve and set displayName
            const storedDisplayName = localStorage.getItem("displayName");
            if (storedDisplayName) {
              await new Promise((resolve) => {
                setSocketDisplayName(storedDisplayName);
                socketDisplayNameRef.current = storedDisplayName;
                console.log(`[Client-side Acknowledgement] Retrieved display name from localStorage: ${storedDisplayName}`);
                resolve();
              });
            }
    
            // After displayName is set, retrieve and set roomKey
            const storedRoomKey = localStorage.getItem("roomKey");
            if (storedRoomKey) {
              setRoomKey(storedRoomKey);
              console.log(`[Client-side Acknowledgement] Retrieved room key from localStorage: ${storedRoomKey}`);
            }

            // After roomKey is set, retrieve and set playersInRoom
            if (storedRoomKey && socketRef.current) {
              console.log("[Client-side Acknowledgement] Requesting players in the current room...");
              socketRef.current.emit("getPlayersInRoom", { roomKey: storedRoomKey });
              console.log(`[Client-side Acknowledgement] Requesting players in room ${storedRoomKey}...`);
            }
    
            // Retrieve and set money independently
            const storedMoney = localStorage.getItem("money");
            if (storedMoney) {
              setMoney(Number(storedMoney));
              console.log(`[Client-side Acknowledgement] Retrieved money from localStorage: ${storedMoney}`);
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
        setPlayersInRoom(players);
        console.log("[From Server: Players in room] -", players);
      });

      socketInstance.on("receivedCustomMessage", (message) => {
        console.log(
          "[From Server: Custom message received] -",
          message["action"],
          message["content"]
        );
        if (onMessageReceivedCallback) {
          onMessageReceivedCallback(message); // Trigger the callback when a message is received
        }
      });

      // Receive rooms object from server and we opt to store it
      socketInstance.on("receiveRooms", (rooms) => {
        console.log("[From Server] - Rooms data received from server:", rooms);
        setRoomsData(rooms);
        // console.log("[From Server: Rooms data received from server] -", rooms);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }, []);

    // Start of our emit functions
    useEffect(() => {
      if (socketRef.current && socketDisplayName) {
        socketRef.current.emit("displayName", socketDisplayName);
        localStorage.setItem("displayName", socketDisplayName);
        console.log(`[Client-side Acknowledgement] Display name set automatically to ${socketDisplayName}` );
      }
    }, [socketDisplayName]);

    useEffect(() => {
      if (socketRef.current && roomKey) {
        socketRef.current.emit("roomKey", roomKey);
        localStorage.setItem("roomKey", roomKey);
        console.log(`[Client-side Acknowledgement] Room key set automatically to ${roomKey}`);
        socketRef.current.emit("getPlayersInRoom", { roomKey });
      }
    }, [roomKey]);

    // Listen for updated player list from the server
    useEffect(() => {
      if (socketRef.current) {
        console.log("[Client-side Acknowledgement] Listening for updated player list...");
        socketRef.current.on("playersInRoom", (players) => {
          setPlayersInRoom(players);  // Update the players in room state
          console.log("[From Server: Players in room] -", players);
        });
      }
    }, []);

    // Load money amount from localStorage on component mount
    useEffect(() => {
      const storedMoney = localStorage.getItem("money");
      if (storedMoney) {
        setMoney(Number(storedMoney));
        console.log("[Client-side Acknowledgement] Loaded money from localStorage.");
      }
    }, []);

    // Save money amount to localStorage whenever it updates
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

    // Ensure the getRooms function is initialized once the socket is ready
    useEffect(() => {
      if (socketRef.current) {
        window.getRooms = () => {
          socketRef.current.emit("getRooms"); // here we make the actual request for the rooms object from server
        };
      } else {
        window.getRooms = () => {
          console.log("[Client-side Acknowledgement] Socket is not initialized.");
        };
      }
    }, []);

    useEffect(() => {
      if (socketRef.current) {
        window.getPlayersInRoom = () => {
          console.log(
            "[Client-side Acknowledgement] Requesting players in the current room..."
          );
          socketRef.current.emit("getPlayersInRoom");
        };

        socketRef.current.on("playersInRoom", (players) => {
          console.log("[From Server: Players in room] -", players);
        });
      }
    }, []);

    useEffect(() => {
      if (typeof window !== "undefined") {
        window.setDisplayName = (name) => {
          if(name === "" || name === null || name === "null") {
            console.log("[Client-side Acknowledgement] Display name cannot be empty.");
            return;
          }

          setSocketDisplayName(name);
          socketDisplayNameRef.current = name; // Update ref
          localStorage.setItem("displayName", name);
          console.log(
            `[Client-side Acknowledgement] Display name set to: "${name}"`
          );
        };

        window.addPlayerToRoom = (roomKey, displayName) => {
          if (socketRef.current) {
            console.log(`[Client-side Acknowledgement] Adding player "${displayName}" to room "${roomKey}"...`);
            socketRef.current.emit("setPlayersInRoom", {
              roomKey: roomKey,
              displayName: displayName,
            });
          }

          setPlayersInRoom((prevPlayers) => {
            return [...prevPlayers, {name: displayName}];
          });

          localStorage.setItem("players", JSON.stringify(playersInRoom));

          console.log(`[Client-side Acknowledgement] Player "${displayName}" added to room "${roomKey}"`);
        }

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

        window.setMoneyAmount = (amount) => {
          if (typeof amount === "number") {
            setMoney(amount); // Update local money state
            if (socketRef.current) {
              socketRef.current.emit("setMoneyAmount", {
                displayName: localStorage.getItem("displayName"),
                roomKey: localStorage.getItem("roomKey"),
                money: amount,
              }); // Communicate the money amount to the server
            }
          }
        };

        window.sendMessage = (msg) => {
          setSocketMessage(msg);
          console.log(`[Client-side Acknowledgement] Message sent: "${msg}"`);
        };
      }
    }, []);

    return socketRef.current;
  };