"use client";
import React, {useEffect} from "react";
import localFont from "next/font/local";
import "./globals.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./redux/store";
import { monitorAuthState, updateUserStatus } from "./redux/authSlice";
import AppLayout from "./components/AppLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Create a component to handle the dispatching
const DispatchEffect = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(monitorAuthState());
  }, [dispatch]);

  return null; // This component doesn't render anything
};

const StatusChecker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const setUserStatus = async(status) => {
      if (user.uid && user.displayName) {
        await dispatch(updateUserStatus(user.uid, user.displayName, status));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setUserStatus("offline");
      } else if (document.visibilityState === "visible") {
        setUserStatus("online");
      }
    };

    // Set offline status before closing the window
    window.addEventListener("beforeunload", () => setUserStatus("offline"));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", () => setUserStatus("offline"));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, dispatch]);

  return null;
};

export default function RootLayout({ children }) {
  return ( 
    <Provider store={store}>
      <DispatchEffect />
      <StatusChecker />
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <AppLayout>
              {children}
            </AppLayout>
        </body>
      </html>
    </Provider>
  );
}

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };
