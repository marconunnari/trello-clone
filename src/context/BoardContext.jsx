import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { boardReducer, initialState } from "./boardReducer";
import { loadState, saveState, throttle } from "./persistence";
import createSeedState from "../seed";

const BoardStateContext = createContext(null);
const BoardDispatchContext = createContext(null);

function getInitialState() {
  const persisted = loadState();
  if (persisted?.board?.lists?.length) {
    return {
      board: persisted.board,
      listsById: persisted.listsById ?? initialState.listsById,
      cardsById: persisted.cardsById ?? initialState.cardsById,
    };
  }
  return createSeedState();
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, undefined, getInitialState);

  const throttledSave = useMemo(
    () => throttle((nextState) => saveState(nextState), 1000),
    []
  );

  useEffect(() => {
    throttledSave(state);
  }, [state, throttledSave]);

  return (
    <BoardStateContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardStateContext.Provider>
  );
}

export function useBoardState() {
  const context = useContext(BoardStateContext);
  if (!context) {
    throw new Error("useBoardState must be used within a BoardProvider");
  }
  return context;
}

export function useBoardDispatch() {
  const context = useContext(BoardDispatchContext);
  if (!context) {
    throw new Error("useBoardDispatch must be used within a BoardProvider");
  }
  return context;
}
