import express, { Request, Response } from "express";
import cors from "cors";
import * as coreLogic from "./logic/algorithm";
import { Flashcard, AnswerDifficulty } from "./logic/flashcards";
import * as dataStore from "./state";
import { UpdateRequest, ProgressStats, PracticeRecord } from "./types";

const app = express();
const DEFAULT_PORT = process.env.PORT || 3001;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- Endpoint Definitions ---

// GET /api/practice - Retrieve cards slated for today's review session
app.get("/api/practice", (req: Request, res: Response) => {
  try {
    const currentDay = dataStore.getCurrentDay();
    const currentBucketsData = dataStore.getBuckets();
    // Prepare bucket data for the core algorithm
    const bucketCollections = coreLogic.toBucketSets(currentBucketsData);
    const cardsForReviewSet = coreLogic.practice(bucketCollections, currentDay);

    // Convert review card set to an array for the response payload
    const cardsForReviewArray = Array.from(cardsForReviewSet);

    console.log(`Day ${currentDay}: Preparing ${cardsForReviewArray.length} cards for practice.`);
    res.json({ cards: cardsForReviewArray, currentDay });
  } catch (error) {
    console.error("Issue encountered retrieving practice cards:", error);
    res.status(500).json({ message: "Failed to retrieve practice cards" });
  }
});

// POST /api/update - Adjust a card's knowledge level based on user feedback
app.post("/api/update", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack, difficulty } = req.body as UpdateRequest;

    // Ensure a valid difficulty level was provided
    if (!(difficulty in AnswerDifficulty)) {
      res.status(400).json({ message: "Provided difficulty level is invalid" });
      return;
    }

    const targetCard = dataStore.findCard(cardFront, cardBack);
    if (!targetCard) {
      res.status(404).json({ message: "Requested card could not be found" });
      return;
    }

    const initialBuckets = dataStore.getBuckets();
    const startingBucket = dataStore.findCardBucket(targetCard);

    // Apply the difficulty feedback using the update function
    const revisedBuckets = coreLogic.update(initialBuckets, targetCard, difficulty);
    dataStore.setBuckets(revisedBuckets);

    // Log the interaction in the history
    const finalBucket = dataStore.findCardBucket(targetCard);
    const historicalEntry: PracticeRecord = {
      cardFront: targetCard.front,
      cardBack: targetCard.back,
      timestamp: Date.now(),
      difficulty,
      previousBucket: startingBucket ?? -1,
      newBucket: finalBucket ?? -1,
    };
    dataStore.addHistoryRecord(historicalEntry);

    console.log(
      `Card "${targetCard.front}" updated: Feedback ${AnswerDifficulty[difficulty]}, Moved to Bucket ${finalBucket}`
    );
    res.status(200).json({ message: "Card knowledge level updated successfully" });
  } catch (error) {
    console.error("Issue encountered updating card:", error);
    res.status(500).json({ message: "Failed to update card knowledge level" });
  }
});

// GET /api/hint - Provide a supportive hint for a given card
app.get("/api/hint", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack } = req.query;

    if (typeof cardFront !== "string" || typeof cardBack !== "string") {
      res
        .status(400)
        .json({ message: "Both 'cardFront' and 'cardBack' query parameters are required" });
      return;
    }

    const requestedCard = dataStore.findCard(cardFront, cardBack);
    if (!requestedCard) {
      res.status(404).json({ message: "The specified card was not found" });
      return;
    }

    // Retrieve the hint using the relevant logic function
    const cardHint = coreLogic.getHint(requestedCard);
    console.log(`Hint requested for card "${requestedCard.front}".`);
    res.json({ hint: cardHint });
  } catch (error) {
    console.error("Issue encountered retrieving hint:", error);
    res.status(500).json({ message: "Failed to retrieve hint for the card" });
  }
});

// GET /api/progress - Report current learning statistics and advancement
app.get("/api/progress", (req: Request, res: Response) => {
  try {
    const currentBucketsState = dataStore.getBuckets();
    const practiceHistory = dataStore.getHistory();

    // Calculate progress insights
    const learningStats: ProgressStats = coreLogic.computeProgress(currentBucketsState, practiceHistory);

    res.json(learningStats);
  } catch (error) {
    console.error("Issue encountered calculating progress:", error);
    res.status(500).json({ message: "Failed to compute learning progress" });
  }
});

// POST /api/day/next - Advance the simulation to the subsequent day
app.post("/api/day/next", (req: Request, res: Response) => {
  dataStore.incrementDay();
  const theNextDay = dataStore.getCurrentDay();
  console.log(`Simulation advanced to Day ${theNextDay}`);
  res
    .status(200)
    .json({ message: `Simulation is now on day ${theNextDay}`, currentDay: theNextDay });
});

// --- Initialize Server ---
app.listen(DEFAULT_PORT, () => {
  console.log(`Review backend server running on http://localhost:${DEFAULT_PORT}`);
  console.log(`Current simulation day: ${dataStore.getCurrentDay()}`);
});