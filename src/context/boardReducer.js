const initialState = {
  board: { lists: [] },
  listsById: {},
  cardsById: {},
};

function boardReducer(state, action) {
  switch (action.type) {
    case "ADD_LIST": {
      const { listId, listTitle } = action.payload;
      return {
        ...state,
        board: { lists: [...state.board.lists, listId] },
        listsById: {
          ...state.listsById,
          [listId]: { _id: listId, title: listTitle, cards: [] },
        },
      };
    }
    case "MOVE_LIST": {
      const { oldListIndex, newListIndex } = action.payload;
      const newLists = Array.from(state.board.lists);
      const [removedList] = newLists.splice(oldListIndex, 1);
      newLists.splice(newListIndex, 0, removedList);
      return {
        ...state,
        board: { lists: newLists },
      };
    }
    case "DELETE_LIST": {
      const { listId, cards: cardIds } = action.payload;
      const { [listId]: _deletedList, ...restOfLists } = state.listsById;
      const cardsById = Object.fromEntries(
        Object.entries(state.cardsById).filter(
          ([cardId]) => !cardIds.includes(cardId)
        )
      );
      return {
        ...state,
        board: {
          lists: state.board.lists.filter((id) => id !== listId),
        },
        listsById: restOfLists,
        cardsById,
      };
    }
    case "CHANGE_LIST_TITLE": {
      const { listId, listTitle } = action.payload;
      return {
        ...state,
        listsById: {
          ...state.listsById,
          [listId]: { ...state.listsById[listId], title: listTitle },
        },
      };
    }
    case "ADD_CARD": {
      const { listId, cardId, cardText } = action.payload;
      return {
        ...state,
        listsById: {
          ...state.listsById,
          [listId]: {
            ...state.listsById[listId],
            cards: [...state.listsById[listId].cards, cardId],
          },
        },
        cardsById: {
          ...state.cardsById,
          [cardId]: { text: cardText, _id: cardId },
        },
      };
    }
    case "MOVE_CARD": {
      const { oldCardIndex, newCardIndex, sourceListId, destListId } =
        action.payload;

      if (sourceListId === destListId) {
        const newCards = Array.from(state.listsById[sourceListId].cards);
        const [removedCard] = newCards.splice(oldCardIndex, 1);
        newCards.splice(newCardIndex, 0, removedCard);
        return {
          ...state,
          listsById: {
            ...state.listsById,
            [sourceListId]: {
              ...state.listsById[sourceListId],
              cards: newCards,
            },
          },
        };
      }

      const sourceCards = Array.from(state.listsById[sourceListId].cards);
      const [removedCard] = sourceCards.splice(oldCardIndex, 1);
      const destinationCards = Array.from(state.listsById[destListId].cards);
      destinationCards.splice(newCardIndex, 0, removedCard);

      return {
        ...state,
        listsById: {
          ...state.listsById,
          [sourceListId]: {
            ...state.listsById[sourceListId],
            cards: sourceCards,
          },
          [destListId]: {
            ...state.listsById[destListId],
            cards: destinationCards,
          },
        },
      };
    }
    case "CHANGE_CARD_TEXT": {
      const { cardId, cardText } = action.payload;
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          [cardId]: { ...state.cardsById[cardId], text: cardText },
        },
      };
    }
    case "DELETE_CARD": {
      const { cardId, listId } = action.payload;
      const { [cardId]: _deletedCard, ...restOfCards } = state.cardsById;
      return {
        ...state,
        listsById: {
          ...state.listsById,
          [listId]: {
            ...state.listsById[listId],
            cards: state.listsById[listId].cards.filter((id) => id !== cardId),
          },
        },
        cardsById: restOfCards,
      };
    }
    default:
      return state;
  }
}

export { initialState, boardReducer };
