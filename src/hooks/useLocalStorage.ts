
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent execution on server
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Only parse and set if item exists
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue: SetValue<T> = useCallback((value) => {
    // Prevent execution on server
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage key "${key}" from server.`);
      return; 
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Dispatch a custom event to notify other tabs/windows of the change
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent | Event) => {
      let eventKey: string | null = null;
      if (event instanceof StorageEvent) {
          eventKey = event.key;
      }

      // If it's a storage event, check if it's for our key. If custom, update always.
      if (eventKey === null || eventKey === key) {
        try {
          const item = window.localStorage.getItem(key);
          if (item !== null) {
            setStoredValue(JSON.parse(item));
          } else {
            // If the item was removed from localStorage, reset to initialValue
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.warn(`Error re-reading localStorage key "${key}" on event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, isLoaded];
}

export default useLocalStorage;
