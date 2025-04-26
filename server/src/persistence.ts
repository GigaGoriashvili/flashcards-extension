import { BucketMap, Flashcard } from "./logic/flashcards";
import { PracticeRecord } from "./types";

export interface SerializedState {
  buckets: {
    [bucket: number]: Flashcard[];
  };
  history: PracticeRecord[];
  currentDay: number;
}

// --- Serialization ---

export function serializeState(
  buckets: BucketMap,
  history: PracticeRecord[],
  currentDay: number
): SerializedState | null{
  return null;
}

// Deserialization (future-proofing) ---
export function deserializeState(state: SerializedState): {
  buckets: BucketMap;
  history: PracticeRecord[];
  currentDay: number;
}  {
    return {
        buckets: {} as BucketMap,
        history: [],
        currentDay: 0
    };
}