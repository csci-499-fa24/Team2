import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (roomKey, socketMessage) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomKey) return;

    const socketInstance = io("https://team2-server.onrender.com/");
    setSocket(socketInstance);

    console.log("Emitting roomkey...");
    socketInstance.emit("roomKey", roomKey);

    socketInstance.on("confirmReceivedRoom", (message) => {
      console.log(message);
    });
    
    socketInstance.on("newPlayerJoined", (message) => {
      console.log(message);
    });

    socketInstance.on("receivedCustomMessage", (message) => {
      console.log(message);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomKey]);

  useEffect(() => {
    if (socket && socketMessage) {
      socket.emit("customMessage", socketMessage);
    }
  }, [socketMessage, socket]);
  
  return socket;
};