import { nanoid } from "nanoid";

export default function createSeedState() {
  const firstListId = nanoid();
  const secondListId = nanoid();
  const cardIds = [nanoid(), nanoid(), nanoid(), nanoid()];

  return {
    board: { lists: [firstListId, secondListId] },
    listsById: {
      [firstListId]: {
        _id: firstListId,
        title: "First list",
        cards: [cardIds[0], cardIds[1]],
      },
      [secondListId]: {
        _id: secondListId,
        title: "Second list",
        cards: [cardIds[2], cardIds[3]],
      },
    },
    cardsById: {
      [cardIds[0]]: { text: "First card", _id: cardIds[0] },
      [cardIds[1]]: { text: "Second card", _id: cardIds[1] },
      [cardIds[2]]: { text: "Card 1", _id: cardIds[2] },
      [cardIds[3]]: { text: "Card 2", _id: cardIds[3] },
    },
  };
}
