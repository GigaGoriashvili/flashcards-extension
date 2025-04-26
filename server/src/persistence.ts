// server/src/persistence.ts
import { BucketMap, Flashcard } from "./logic/flashcards";
import { PracticeRecord } from "./types";
import * as fs from "fs";

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
): SerializedState {
  const serializedBuckets: { [bucket: number]: Flashcard[] } = {};

  for (const [bucketNumber, flashcardSet] of buckets.entries()) {
    serializedBuckets[bucketNumber] = Array.from(flashcardSet).map((card) => ({
      front: card.front,
      back: card.back,
      hint: card.hint,
      tags: [...card.tags],
    }));
  }

  return {
    buckets: serializedBuckets,
    history: history,
    currentDay: currentDay,
  };
}

// Deserialization (future-proofing) ---
export function deserializeState(state: SerializedState): {
  buckets: BucketMap;
  history: PracticeRecord[];
  currentDay: number;
} {
  const buckets: BucketMap = new Map();

  for (const [bucketStr, flashcards] of Object.entries(state.buckets)) {
    const bucketNum = parseInt(bucketStr, 10);
    const flashcardSet = new Set<Flashcard>();

    for (const cardData of flashcards) {
      flashcardSet.add(
        new Flashcard(cardData.front, cardData.back, cardData.hint, cardData.tags)
      );
    }

    buckets.set(bucketNum, flashcardSet);
  }

  return {
    buckets,
    history: state.history,
    currentDay: state.currentDay,
  };
}


export function saveState(
    buckets: BucketMap,
    history: PracticeRecord[],
    currentDay: number,
    filePath: string
  ): void {
    const serialized = serializeState(buckets, history, currentDay);
    const jsonData = JSON.stringify(serialized, null, 2);
    fs.writeFileSync(filePath, jsonData, "utf-8");
  }


  export function loadState(filePath: string): {
    buckets: BucketMap;
    history: PracticeRecord[];
    currentDay: number;
  } {
    if (!fs.existsSync(filePath)) {
      throw new Error(`State file not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContent) as SerializedState;
    return deserializeState(parsed);
  }