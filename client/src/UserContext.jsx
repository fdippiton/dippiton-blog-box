import { createContext, useState } from "react";
import config from "./config.js";

export const UserContext = createContext({});

/**
 * The function `UserContextProvider` creates a context provider in React to manage user information.
 * @returns The `UserContextProvider` component is being returned. It is a functional component that
 * provides the `UserContext` value with `userInfo` and `setUserInfo` as context values to its children
 * components.
 */
export function UserContextProvider({ children }) {
  const baseUrl = config.BASE_URL;

  console.log(baseUrl);
  const [userInfo, setUserInfo] = useState({});

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, baseUrl }}>
      {children}
    </UserContext.Provider>
  );
}
