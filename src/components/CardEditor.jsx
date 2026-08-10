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
