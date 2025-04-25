import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types";

// --- Starting Dataset ---
// Define an initial collection of flashcards for the application
const initialReviewItems: Flashcard[] = [
  new Flashcard("der Tisch", "the table", "Starts with T", ["noun", "german"]),
  new Flashcard("la silla", "the chair", "Starts with S", ["noun", "spanish"]),
  new Flashcard("bonjour", "hello", "Greeting", ["phrase", "french"]),
  new Flashcard("arigato", "thank you", "Expression of gratitude", [
    "phrase",
    "japanese",
  ]),
  new Flashcard("der Hund", "the dog", "Common pet", ["noun", "german"]),
  new Flashcard("el gato", "the cat", "Common pet", ["noun", "spanish"]),
];

// --- Application State ---
// Initialize the knowledge buckets. All new items start in bucket 0.
let reviewBuckets: BucketMap = new Map();
const initialItemSet = new Set(initialReviewItems);
reviewBuckets.set(0, initialItemSet);

// Initialize the log to record practice session outcomes
let reviewLog: PracticeRecord[] = [];

// Variable to track the current simulated day
let activeDay: number = 0;

// --- State Interface Methods ---

// Provides read access to the current state of the knowledge buckets
export const getBuckets = (): BucketMap => reviewBuckets;

// Allows updating the entire state of the knowledge buckets
export const setBuckets = (newBuckets: BucketMap): void => {
  reviewBuckets = newBuckets;
};

// Provides read access to the historical log of practice sessions
export const getHistory = (): PracticeRecord[] => reviewLog;

// Adds a new record to the practice history log
export const addHistoryRecord = (record: PracticeRecord): void => {
  reviewLog.push(record);
};

// Provides the current day number within the simulation
export const getCurrentDay = (): number => activeDay;

// Increments the simulated day count
export const incrementDay = (): void => {
  activeDay++;
};

// Utility function to find a specific flashcard by its front and back content
export const findCard = (
  front: string,
  back: string
): Flashcard | undefined => {
  // Iterate through all buckets to find the card
  for (const [, bucketSet] of reviewBuckets) {
    for (const card of bucketSet) {
      if (card.front === front && card.back === back) {
        return card;
      }
    }
  }
  // Also check the initial set as a fallback
  return initialReviewItems.find(
    (card) => card.front === front && card.back === back
  );
};

// Utility function to determine which bucket a given flashcard is currently in
export const findCardBucket = (cardToFind: Flashcard): number | undefined => {
  for (const [bucketNum, bucketSet] of reviewBuckets) {
    if (bucketSet.has(cardToFind)) {
      return bucketNum;
    }
  }
  // Return undefined if the card is not found in any bucket
  return undefined;
};

// Log the initial state when the module loads
console.log("State initialized with buckets:", reviewBuckets);