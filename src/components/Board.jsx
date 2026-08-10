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
                <div onClick={toggleAddingList} className="Add-List-Button">
                  <ion-icon name="add-outline" /> Add a list
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
