import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (onMessageReceivedCallback) => {
  const socketRef = useRef(null);
  const [roomKey, setRoomKey] = useState("");
  const [socketDisplayName, setSocketDisplayName] = useState("");
  const [socketMessage, setSocketMessage] = useState("");
  const [roomsData, setRoomsData] = useState(null);

  // Create a ref to store socketDisplayName synchronously, as diplayName then setting roomKey timing matters
  const socketDisplayNameRef = useRef("");

  // Change localStorage based on the current route, this is how we handle persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      if (currentPath === "/") {
        // On route '/' meaning user starts fresh, clear localStorage, otherwise we assume user wants to persist connection
        localStorage.removeItem("displayName");
        localStorage.removeItem("roomKey");
        setSocketDisplayName("");
        setRoomKey("");
        socketDisplayNameRef.current = "";
        console.log("[Client-side Acknowledgement] localStorage cleared.");
      } else {
        // On other routes like changing game-board view, get roomKey and displayName from localStorage
        const storedDisplayName = localStorage.getItem("displayName");
        const storedRoomKey = localStorage.getItem("roomKey");

        if (storedDisplayName) {
          setSocketDisplayName(storedDisplayName);
          socketDisplayNameRef.current = storedDisplayName; 
          console.log(
            `[Client-side Acknowledgement] Retrieved display name from localStorage: ${storedDisplayName}`
          );
        }

        if (storedRoomKey) {
          setRoomKey(storedRoomKey);
          console.log(
            `[Client-side Acknowledgement] Retrieved room key from localStorage: ${storedRoomKey}`
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    const socketInstance = io("http://localhost:8080/");  // Ensure the URL is correct (e.g. localhost for testing)
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

    socketInstance.on("receivedCustomMessage", (message) => {
      console.log("[From Server: Custom message received] -", message["action"], message["content"]);
      if (onMessageReceivedCallback) {
        onMessageReceivedCallback(message); // Trigger the callback when a message is received
      }
    });

    // Receive rooms object from server and we opt to store it 
    socketInstance.on("receiveRooms", (rooms) => {
      setRoomsData(rooms); 
      console.log("[From Server: Rooms data received from server] -", rooms);
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
    }
  }, [socketDisplayName]);

  useEffect(() => {
    if (socketRef.current && roomKey) {
      socketRef.current.emit("roomKey", roomKey);
    }
  }, [roomKey]);

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
        console.log(
          "[Client-side Acknowledgement] Requesting rooms data from server..."
        );
        socketRef.current.emit("getRooms"); // here we make the actual request for the rooms object from server
      };
    } else {
      window.getRooms = () => {
        console.log(
          "[Client-side Acknowledgement] Socket is not initialized."
        );
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.setDisplayName = (name) => {
        setSocketDisplayName(name);
        socketDisplayNameRef.current = name; // Update ref
        localStorage.setItem("displayName", name);
        console.log(
          `[Client-side Acknowledgement] Display name set to: "${name}"`
        );
      };

      window.setRoomKey = (key) => {
        if (socketDisplayNameRef.current) {
          setRoomKey(key);
          localStorage.setItem("roomKey", key);
          console.log(
            `[Client-side Acknowledgement] Room key set to: ${key}`
          );
        } else {
          console.log(
            "[Client-side Acknowledgement] Cannot set room key before setting display name."
          );
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