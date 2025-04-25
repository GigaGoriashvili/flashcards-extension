import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types";

// --- Sample Flashcards Setup ---
const flashcardList: Flashcard[] = [
  new Flashcard("der Tisch", "the table", "Starts with T", ["noun", "german"]),
  new Flashcard("la silla", "the chair", "Starts with S", ["noun", "spanish"]),
  new Flashcard("bonjour", "hello", "Greeting", ["phrase", "french"]),
  new Flashcard("arigato", "thank you", "Expression of gratitude", ["phrase", "japanese"]),
  new Flashcard("der Hund", "the dog", "Common pet", ["noun", "german"]),
  new Flashcard("el gato", "the cat", "Common pet", ["noun", "spanish"]),
];

// --- Core State Variables ---
let buckets: BucketMap = new Map();
const baseCardSet = new Set(flashcardList);
buckets.set(0, baseCardSet);

let historyRecords: PracticeRecord[] = [];

let simulationDay: number = 0;

// --- State Functions ---
export const getBucketMap = (): BucketMap => buckets;

export const updateBuckets = (updated: BucketMap): void => {
  buckets = updated;
};

export const getPracticeHistory = (): PracticeRecord[] => historyRecords;

export const recordPractice = (entry: PracticeRecord): void => {
  historyRecords.push(entry);
};

export const getDay = (): number => simulationDay;

export const nextDay = (): void => {
  simulationDay++;
};

// --- Flashcard Utilities ---
export const locateCard = (front: string, back: string): Flashcard | undefined => {
  for (const [, cards] of buckets) {
    for (const card of cards) {
      if (card.front === front && card.back === back) {
        return card;
      }
    }
  }

  // Also check initial set as fallback
  return flashcardList.find(
    (card) => card.front === front && card.back === back
  );
};

export const getCardBucket = (card: Flashcard): number | undefined => {
  for (const [bucketId, cards] of buckets) {
    if (cards.has(card)) {
      return bucketId;
    }
  }
  return undefined;
};

console.log("Initial configuration complete:", buckets);
