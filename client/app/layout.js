"use client";
import React, {useEffect} from "react";
import localFont from "next/font/local";
import "./globals.css";
import ReduxProvider from "./ReduxProvider";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store";
import { monitorAuthState } from "./redux/authSlice";

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

export default function RootLayout({ children }) {
  return ( 
    <Provider store={store}>
      <DispatchEffect />
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <ReduxProvider>
              {children}
            </ReduxProvider>
        </body>
      </html>
    </Provider>
  );
}

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };
