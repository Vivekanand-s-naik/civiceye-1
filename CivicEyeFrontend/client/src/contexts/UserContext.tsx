// // src/contexts/UserContext.tsx
// import React, { createContext, useContext, useState, ReactNode } from "react";

// export interface CurrentUser {
//   id: number;
//   email: string;
//   fullName: string;
//   role: string;
//   aadharNumber?: string;
//   phoneNumber?: string;
// }

// interface UserContextType {
//   currentUser: CurrentUser | null;
//   setCurrentUser: (user: CurrentUser | null) => void;
//   logout: () => void;
//   isLoggedIn: boolean;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: ReactNode }) {
//   const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(() => {
//     // Restore from localStorage on app load
//     const stored = localStorage.getItem("currentUser");
//     return stored ? JSON.parse(stored) : null;
//   });

//   const setCurrentUser = (user: CurrentUser | null) => {
//     setCurrentUserState(user);
//     if (user) {
//       localStorage.setItem("currentUser", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("currentUser");
//     }
//   };

//   const logout = () => {
//     setCurrentUser(null);
//     localStorage.removeItem("userId");
//     localStorage.removeItem("currentUser");
//   };

//   return (
//     <UserContext.Provider
//       value={{
//         currentUser,
//         setCurrentUser,
//         logout,
//         isLoggedIn: !!currentUser,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUser() {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within UserProvider");
//   }
//   return context;
// }

// src/contexts/UserContext.tsx
// import React, { createContext, useContext, useState, ReactNode } from "react";

// export interface CurrentUser {
//   id: number;
//   email: string;
//   fullName: string;
//   role: string;
//   aadharNumber?: string;
//   phoneNumber?: string;
// }

// interface UserContextType {
//   currentUser: CurrentUser | null;
//   setCurrentUser: (user: CurrentUser | null) => void;
//   logout: () => void;
//   isLoggedIn: boolean;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: ReactNode }) {
//   const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
//     // Restore from localStorage on app load
//     const stored = localStorage.getItem("currentUser");
//     return stored ? JSON.parse(stored) : null;
//   });

//   const handleSetCurrentUser = (user: CurrentUser | null) => {
//     setCurrentUser(user);
//     if (user) {
//       localStorage.setItem("currentUser", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("currentUser");
//     }
//   };

//   const logout = () => {
//     handleSetCurrentUser(null);
//     localStorage.removeItem("userId");
//     localStorage.removeItem("currentUser");
//   };

//   return (
//     <UserContext.Provider
//       value={{
//         currentUser,
//         setCurrentUser: handleSetCurrentUser,
//         logout,
//         isLoggedIn: !!currentUser,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUser() {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within UserProvider");
//   }
//   return context;
// }

// Save this as: D:\ProjectFInal\CivicEye\CivicEyeFrontend\client\src\contexts\UserContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  aadharNumber?: string;
  phoneNumber?: string;
}

interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoggedIn: false,
  setCurrentUser: () => {},
  logout: () => {},
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    // ✅ Initialize from localStorage on mount
    try {
      const stored = localStorage.getItem('civiceye_user');
      if (stored) {
        const user = JSON.parse(stored);
        console.log("✅ Restored user from localStorage:", user);
        return user;
      }
    } catch (error) {
      console.error("Failed to restore user from localStorage:", error);
    }
    return null;
  });

  // ✅ Wrapper to sync with localStorage
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    
    if (user) {
      localStorage.setItem('civiceye_user', JSON.stringify(user));
      console.log("✅ User saved to localStorage:", user);
    } else {
      localStorage.removeItem('civiceye_user');
      console.log("🗑️ User removed from localStorage");
    }
  };

  // ✅ Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civiceye_user');
    localStorage.removeItem('userRole');
    console.log("👋 User logged out");
  };

  const isLoggedIn = !!currentUser;

  // ✅ Log current state for debugging
  useEffect(() => {
    console.log("🔐 UserContext State:", {
      isLoggedIn,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
    });
  }, [currentUser, isLoggedIn]);

  const value: UserContextType = {
    currentUser,
    isLoggedIn,
    setCurrentUser,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};