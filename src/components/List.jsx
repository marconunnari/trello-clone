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
