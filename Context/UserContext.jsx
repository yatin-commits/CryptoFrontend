import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { auth } from "../src/auth/firebase";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Helper to read cookie or fallback to default
  const getCookie = (key, defaultValue) => {
    try {
      const value = Cookies.get(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Cookie parse error for ${key}:`, error);
      return defaultValue;
    }
  };

  const [name, setName] = useState(getCookie("name", ""));
  const [email, setEmail] = useState(getCookie("email", ""));
  const [uid, setUid] = useState(getCookie("uid", ""));
  const [walletBalance, setWalletBalance] = useState(getCookie("walletBalance", 0));

  // Save to cookies when state changes
  useEffect(() => {
    Cookies.set("name", JSON.stringify(name), { expires: 7 });
    Cookies.set("email", JSON.stringify(email), { expires: 7 });
    Cookies.set("uid", JSON.stringify(uid), { expires: 7 });
    Cookies.set("walletBalance", JSON.stringify(walletBalance), { expires: 7 });
  }, [name, email, uid, walletBalance]);

  // Firebase login listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setName(user.displayName || "");
        setEmail(user.email || "");
        setUid(user.uid || "");
        // Wallet balance should come from an API
      } else {
        clearAll();
      }
    });

    return () => unsubscribe();
  }, []);

  const clearAll = () => {
    Cookies.remove("name");
    Cookies.remove("email");
    Cookies.remove("uid");
    
    Cookies.remove("walletBalance");

    setName("");
    setEmail("");
    setUid("");
    setWalletBalance(0);
  };

  const logout = async () => {
    try {
      await auth.signOut(); // for firebase
      clearAll(); //for cookies
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        name,
        email,
        uid,
        walletBalance,
        setName,
        setEmail,
        setUid,
        setWalletBalance,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
