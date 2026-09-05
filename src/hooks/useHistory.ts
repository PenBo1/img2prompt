/**
 * History management hook
 */

import { storage } from "#imports";
import type { PromptGeneratedPayload } from "~/types";
import { STORAGE_KEYS } from "~/types";

// History entry with ID
export interface HistoryEntry extends PromptGeneratedPayload {
  id: string;
  imageData: string; // Thumbnail or full image
}

// Define typed storage item
const historyItem = storage.defineItem<HistoryEntry[]>(
  `local:${STORAGE_KEYS.HISTORY}`,
  {
    defaultValue: [],
  }
);

const MAX_HISTORY_ENTRIES = 50;

/**
 * Hook to manage prompt generation history
 */
export function useHistory() {
  // Get all history
  const getHistory = async (): Promise<HistoryEntry[]> =>
    await historyItem.getValue();

  // Add new entry
  const addEntry = async (entry: Omit<HistoryEntry, "id">): Promise<void> => {
    const history = await getHistory();

    // Create entry with ID
    const newEntry: HistoryEntry = {
      ...entry,
      id: generateId(),
    };

    // Add to beginning, limit size
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);

    await historyItem.setValue(updated);
  };

  // Remove entry
  const removeEntry = async (id: string): Promise<void> => {
    const history = await getHistory();
    const updated = history.filter((entry) => entry.id !== id);
    await historyItem.setValue(updated);
  };

  // Clear all history
  const clearHistory = async (): Promise<void> => {
    await historyItem.setValue([]);
  };

  // Get single entry
  const getEntry = async (id: string): Promise<HistoryEntry | undefined> => {
    const history = await getHistory();
    return history.find((entry) => entry.id === id);
  };

  // Watch for changes
  const watchHistory = (
    callback: (newValue: HistoryEntry[], oldValue: HistoryEntry[]) => void
  ) => storage.watch<HistoryEntry[]>(`local:${STORAGE_KEYS.HISTORY}`, callback);

  return {
    addEntry,
    clearHistory,
    getEntry,
    getHistory,
    removeEntry,
    watchHistory,
  };
}

// Helper to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
