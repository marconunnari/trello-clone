# Build a Trello clone with React and Context

In this tutorial we'll build a Trello clone with React, Context, and `useReducer`. No Redux or other global state library — just React's own tools.

You can try an older version of this project at [https://react-trello-clone.netlify.app/](https://react-trello-clone.netlify.app/).

------

## Scaffold with Vite

Create the project with [Vite](https://vite.dev/) and the React template:

```bash
npm create vite@latest trello-clone -- --template react
cd trello-clone
npm install
```

Open the folder in your editor.

------

## Dependencies

We'll use:

- [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd): drag and drop (maintained fork of `react-beautiful-dnd`)
- [`react-textarea-autosize`](https://github.com/Andarist/react-textarea-autosize): textareas that grow with their content
- [`nanoid`](https://github.com/ai/nanoid): short unique ids

```bash
npm install @hello-pangea/dnd react-textarea-autosize nanoid
```

------

## Start

```bash
npm run dev
```

Vite reloads the app as you edit files.

------

## index.html

Replace `index.html` at the project root with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#4bbf6b" />
    <link rel="manifest" href="/manifest.json" />
    <title>React Trello Clone</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.js"></script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

The Ionicons scripts give us free icons via `<ion-icon>` elements.

Move the Vite default `public/vite.svg` aside if you like, and keep (or add) `public/favicon.ico` and `public/manifest.json`.

------

## Cleanup and structure

Create folders and tidy the default Vite files:

```bash
mkdir -p src/components src/styles src/context
rm -f src/App.css src/App.jsx src/assets/react.svg
```

Your structure should look like:

```
.
├── index.html
├── package.json
├── public
│   ├── favicon.ico
│   └── manifest.json
├── src
│   ├── components
│   ├── context
│   ├── styles
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

------

## App shell

Create `src/components/App.jsx`:

```jsx
import "../styles/App.css";
import Board from "./Board";

export default function App() {
  return (
    <div className="App">
      <div className="Header">React Trello Clone</div>
      <Board />
    </div>
  );
}
```

Create `src/styles/App.css`:

```css
.App {
  background: rgb(75, 191, 107);
  height: 100vh;
}

.Header {
  background: rgba(0, 0, 0, 0.15);
  color: white;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: center;
  font-size: 40px;
  font-weight: 200;
}
```

Update `src/main.jsx` to render the app (we'll wrap it with a provider in a later step):

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

For now, create a temporary `src/components/Board.jsx` that returns `null` so the app compiles, or skip ahead to the Board section after the context is ready.

------

## Board reducer

We'll keep board state in a normalized shape:

- `board.lists` — ordered list ids
- `listsById` — list objects keyed by id (each has `cards: cardId[]`)
- `cardsById` — card objects keyed by id

Create `src/context/boardReducer.js`:

```js
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
```

One reducer handles the whole board. Actions are plain objects with a `type` and `payload`.

------

## Persist to localStorage

Create `src/context/persistence.js`:

```js
const STORAGE_KEY = "state";

export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

export function throttle(fn, wait) {
  let lastCall = 0;
  let timeoutId = null;
  let lastArgs = null;

  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    lastArgs = args;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...lastArgs);
      return;
    }

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...lastArgs);
      }, remaining);
    }
  };
}
```

------

## Seed data

Create `src/seed.js` so a first visit isn't an empty board:

```js
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
```

------

## Board context

Create `src/context/BoardContext.jsx`:

```jsx
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
```

Splitting state and dispatch into two contexts avoids re-rendering every consumer when only dispatch is needed (dispatch is stable).

Wrap the app in `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { BoardProvider } from "./context/BoardContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </StrictMode>
);
```

------

## Board component

Create `src/styles/Board.css` (copy from this repo's `src/styles/Board.css`) and `src/components/Board.jsx`:

```jsx
import "../styles/Board.css";
import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useBoardDispatch, useBoardState } from "../context/BoardContext";
import List from "./List";
import AddList from "./AddList";

export default function Board() {
  const { board } = useBoardState();
  const dispatch = useBoardDispatch();
  const [addingList, setAddingList] = useState(false);

  const toggleAddingList = () => setAddingList((value) => !value);

  const handleDragEnd = ({ source, destination, type }) => {
    if (!destination) return;

    if (type === "COLUMN") {
      if (source.index !== destination.index) {
        dispatch({
          type: "MOVE_LIST",
          payload: {
            oldListIndex: source.index,
            newListIndex: destination.index,
          },
        });
      }
      return;
    }

    if (
      source.index !== destination.index ||
      source.droppableId !== destination.droppableId
    ) {
      dispatch({
        type: "MOVE_CARD",
        payload: {
          sourceListId: source.droppableId,
          destListId: destination.droppableId,
          oldCardIndex: source.index,
          newCardIndex: destination.index,
        },
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div
            className="Board"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {board.lists.map((listId, index) => (
              <List listId={listId} key={listId} index={index} />
            ))}

            {provided.placeholder}

            <div className="Add-List">
              {addingList ? (
                <AddList toggleAddingList={toggleAddingList} />
              ) : (
                <button
                  type="button"
                  onClick={toggleAddingList}
                  className="Add-List-Button"
                >
                  <ion-icon name="add-outline" /> Add a list
                </button>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

------

## List component

Create `src/styles/List.css` and `src/components/List.jsx`:

```jsx
import "../styles/List.css";
import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { nanoid } from "nanoid";
import { useBoardDispatch, useBoardState } from "../context/BoardContext";
import Card from "./Card";
import CardEditor from "./CardEditor";
import ListEditor from "./ListEditor";

export default function List({ listId, index }) {
  const { listsById } = useBoardState();
  const dispatch = useBoardDispatch();
  const list = listsById[listId];

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [addingCard, setAddingCard] = useState(false);

  const toggleAddingCard = () => setAddingCard((value) => !value);
  const toggleEditingTitle = () => setEditingTitle((value) => !value);

  const addCard = (cardText) => {
    toggleAddingCard();
    dispatch({
      type: "ADD_CARD",
      payload: { cardText, cardId: nanoid(), listId },
    });
  };

  const handleChangeTitle = (e) => setTitle(e.target.value);

  const editListTitle = () => {
    toggleEditingTitle();
    dispatch({
      type: "CHANGE_LIST_TITLE",
      payload: { listId, listTitle: title },
    });
  };

  const deleteList = () => {
    if (window.confirm("Are you sure to delete this list?")) {
      dispatch({
        type: "DELETE_LIST",
        payload: { listId, cards: list.cards },
      });
    }
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="List"
        >
          {editingTitle ? (
            <ListEditor
              list={list}
              title={title}
              handleChangeTitle={handleChangeTitle}
              saveList={editListTitle}
              onClickOutside={editListTitle}
              deleteList={deleteList}
            />
          ) : (
            <div className="List-Title" onClick={toggleEditingTitle}>
              {list.title}
            </div>
          )}

          <Droppable droppableId={list._id}>
            {(droppableProvided) => (
              <div
                ref={droppableProvided.innerRef}
                className="Lists-Cards"
                {...droppableProvided.droppableProps}
              >
                {list.cards?.map((cardId, cardIndex) => (
                  <Card
                    key={cardId}
                    cardId={cardId}
                    index={cardIndex}
                    listId={list._id}
                  />
                ))}

                {droppableProvided.placeholder}

                {addingCard ? (
                  <CardEditor
                    onSave={addCard}
                    onCancel={toggleAddingCard}
                    adding
                  />
                ) : (
                  <div className="Toggle-Add-Card" onClick={toggleAddingCard}>
                    <ion-icon name="add-outline" /> Add a card
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
```

------

## Card component

Create `src/styles/Card.css` and `src/components/Card.jsx`:

```jsx
import "../styles/Card.css";
import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useBoardDispatch, useBoardState } from "../context/BoardContext";
import CardEditor from "./CardEditor";

export default function Card({ cardId, index, listId }) {
  const { cardsById } = useBoardState();
  const dispatch = useBoardDispatch();
  const card = cardsById[cardId];

  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);

  const startEditing = () => {
    setHover(false);
    setEditing(true);
  };

  const endEditing = () => {
    setHover(false);
    setEditing(false);
  };

  const editCard = (text) => {
    endEditing();
    dispatch({
      type: "CHANGE_CARD_TEXT",
      payload: { cardId: card._id, cardText: text },
    });
  };

  const deleteCard = () => {
    if (window.confirm("Are you sure to delete this card?")) {
      dispatch({
        type: "DELETE_CARD",
        payload: { cardId: card._id, listId },
      });
    }
  };

  if (editing) {
    return (
      <CardEditor
        text={card.text}
        onSave={editCard}
        onDelete={deleteCard}
        onCancel={endEditing}
      />
    );
  }

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="Card"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {hover && (
            <div className="Card-Icons">
              <div className="Card-Icon" onClick={startEditing}>
                <ion-icon name="create-outline" />
              </div>
            </div>
          )}

          {card.text}
        </div>
      )}
    </Draggable>
  );
}
```

------

## CardEditor and EditButtons

Create `src/styles/CardEditor.css`, `src/styles/EditButtons.css`, then:

`src/components/CardEditor.jsx`:

```jsx
import "../styles/CardEditor.css";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import EditButtons from "./EditButtons";

export default function CardEditor({
  text: initialText = "",
  onSave,
  onCancel,
  onDelete,
  adding,
}) {
  const [text, setText] = useState(initialText);

  const onEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(text);
    }
  };

  return (
    <div className="Edit-Card">
      <div className="Card">
        <TextareaAutosize
          autoFocus
          className="Edit-Card-Textarea"
          placeholder="Enter the text for this card..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onEnter}
        />
      </div>
      <EditButtons
        handleSave={() => onSave(text)}
        saveLabel={adding ? "Add card" : "Save"}
        handleDelete={onDelete}
        handleCancel={onCancel}
      />
    </div>
  );
}
```

`src/components/EditButtons.jsx`:

```jsx
import "../styles/EditButtons.css";

export default function EditButtons({
  handleSave,
  saveLabel,
  handleDelete,
  handleCancel,
}) {
  return (
    <div className="Edit-Buttons">
      <div
        tabIndex={0}
        className="Edit-Button"
        style={{ backgroundColor: "#5aac44" }}
        onClick={handleSave}
      >
        {saveLabel}
      </div>
      {handleDelete && (
        <div
          tabIndex={0}
          className="Edit-Button"
          style={{ backgroundColor: "#EA2525", marginLeft: 0 }}
          onClick={handleDelete}
        >
          Delete
        </div>
      )}
      <div tabIndex={0} className="Edit-Button-Cancel" onClick={handleCancel}>
        <ion-icon name="close-outline" />
      </div>
    </div>
  );
}
```

------

## ListEditor and AddList

Create `src/styles/ListEditor.css`, `src/styles/AddList.css`, then:

`src/components/ListEditor.jsx`:

```jsx
import "../styles/ListEditor.css";
import { useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function ListEditor({
  title,
  handleChangeTitle,
  deleteList,
  saveList,
  onClickOutside,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      const node = ref.current;
      if (node && node.contains(e.target)) {
        return;
      }
      onClickOutside();
    };

    // Defer so the click that opened the editor does not immediately close it
    const timeoutId = window.setTimeout(() => {
      document.addEventListener("click", handleClick, false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("click", handleClick, false);
    };
  }, [onClickOutside]);

  const onEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveList();
    }
  };

  return (
    <div className="List-Title-Edit" ref={ref}>
      <TextareaAutosize
        autoFocus
        className="List-Title-Textarea"
        placeholder="Enter list title..."
        value={title}
        onChange={handleChangeTitle}
        onKeyDown={onEnter}
        style={{ width: deleteList ? 220 : 245 }}
      />
      {deleteList && (
        <ion-icon name="trash-outline" onClick={deleteList} />
      )}
    </div>
  );
}
```

`src/components/AddList.jsx`:

```jsx
import "../styles/AddList.css";
import { useState } from "react";
import { nanoid } from "nanoid";
import { useBoardDispatch } from "../context/BoardContext";
import ListEditor from "./ListEditor";
import EditButtons from "./EditButtons";

export default function AddList({ toggleAddingList }) {
  const dispatch = useBoardDispatch();
  const [title, setTitle] = useState("");

  const handleChangeTitle = (e) => setTitle(e.target.value);

  const createList = () => {
    toggleAddingList();
    dispatch({
      type: "ADD_LIST",
      payload: { listId: nanoid(), listTitle: title },
    });
  };

  return (
    <div className="Add-List-Editor">
      <ListEditor
        title={title}
        handleChangeTitle={handleChangeTitle}
        onClickOutside={toggleAddingList}
        saveList={createList}
      />

      <EditButtons
        handleSave={createList}
        saveLabel="Add list"
        handleCancel={toggleAddingList}
      />
    </div>
  );
}
```

------

## Styles

Copy all CSS files from this repository's `src/styles/` directory into your project. They style the board, lists, cards, and editors to look like a simple Trello board.

------

## What you built

- **Vite + React 19** for a fast modern toolchain
- **Context + `useReducer`** instead of Redux for board state
- **localStorage** persistence with a small throttle helper
- **Drag and drop** for lists and cards via `@hello-pangea/dnd`
- **Function components and hooks** throughout

That's the end of the tutorial — enjoy building on it.
