"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
import { logoutUser } from "../redux/authSlice";

const inactivityTimeout = 1000 * 60 * 60; // 1 hour
let inactivityTimer;

function AppLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const resetInactivityTimer = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutOnInactivity, inactivityTimeout);
  };

  const logoutOnInactivity = () => {
    console.log("Logging out due to inactivity...");
    if (user) {
      console.log(`updating ${user.displayName}, ${user.uid} status to offline from logoutOnInactivity`);
      dispatch(logoutUser());
      alert("You have been logged out due to inactivity.");
      router.push("/");
    }
  };

  const checkInactivityOnLoad = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeElapsed = Date.now() - parseInt(lastActivity);
      if (timeElapsed > inactivityTimeout && user) {
        logoutOnInactivity();
      }
    }
  };

  useEffect(() => {
    checkInactivityOnLoad();
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      clearTimeout(inactivityTimer);
    };
  }, [user]);

  return <>{children}</>;
}

export default AppLayout;
