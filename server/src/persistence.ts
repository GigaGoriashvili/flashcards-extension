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

}


export function loadState(filePath: string): {
    buckets: BucketMap;
    history: PracticeRecord[];
    currentDay: number;
} {
    return {
        buckets: new Map(),
        history: [],
        currentDay: 0,
    };
}