import { serializeState, deserializeState } from "../src/persistence";
import { Flashcard } from "../src/logic/flashcards";
import { PracticeRecord } from "../src/types";

describe("State Serialization", () => {
  it("should serialize buckets, history, and currentDay correctly", () => {
    // Setup sample data
    const card1 = new Flashcard("front1", "back1", "hint1", ["tag1", "tag2"]);
    const card2 = new Flashcard("front2", "back2");

    const buckets = new Map<number, Set<Flashcard>>();
    buckets.set(0, new Set([card1]));
    buckets.set(1, new Set([card2]));

    const history: PracticeRecord[] = [
      {
        cardFront: "front1",
        cardBack: "back1",
        timestamp: 123456789,
        difficulty: 2,
        previousBucket: 0,
        newBucket: 1,
      },
    ];

    const currentDay = 5;

    // Serialize
    const serialized = serializeState(buckets, history, currentDay);

    // Check structure
    expect(serialized).toEqual({
      buckets: {
        0: [
          {
            front: "front1",
            back: "back1",
            hint: "hint1",
            tags: ["tag1", "tag2"],
          },
        ],
        1: [
          {
            front: "front2",
            back: "back2",
            hint: undefined,
            tags: [],
          },
        ],
      },
      history: history,
      currentDay: 5,
    });
  });

  it("should deserialize serialized state back to correct objects", () => {
    const serialized = {
      buckets: {
        0: [{ front: "front1", back: "back1", hint: "hint1", tags: ["tag1"] }],
        1: [{ front: "front2", back: "back2", hint: undefined, tags: [] }],
      },
      history: [
        {
          cardFront: "front1",
          cardBack: "back1",
          timestamp: 123456789,
          difficulty: 1,
          previousBucket: 0,
          newBucket: 1,
        },
      ],
      currentDay: 10,
    };

    const { buckets, history, currentDay } = deserializeState(serialized);

    expect(currentDay).toBe(10);
    expect(history.length).toBe(1);

    expect(buckets.get(0)).toBeDefined();
    expect(buckets.get(1)).toBeDefined();
    expect([...buckets.get(0)!][0]).toBeInstanceOf(Flashcard);
    expect([...buckets.get(1)!][0]).toBeInstanceOf(Flashcard);
    expect([...buckets.get(0)!][0].front).toBe("front1");
  });
});
