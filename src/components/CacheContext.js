import React, { createContext, useContext, useState } from "react";

const CacheContext = createContext();

export const useCache = () => useContext(CacheContext);

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  const setCacheData = (key, data) => {
    setCache(prev => ({ ...prev, [key]: data }));
  };

  const getCacheData = (key) => cache[key];

  return (
    <CacheContext.Provider value={{ getCacheData, setCacheData }}>
      {children}
    </CacheContext.Provider>
  );
}; 