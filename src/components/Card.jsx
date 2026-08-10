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
