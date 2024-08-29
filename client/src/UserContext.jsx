import { createContext, useState } from "react";

export const UserContext = createContext({});

/**
 * The function `UserContextProvider` creates a context provider in React to manage user information.
 * @returns The `UserContextProvider` component is being returned. It is a functional component that
 * provides the `UserContext` value with `userInfo` and `setUserInfo` as context values to its children
 * components.
 */
export function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState({});
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}
