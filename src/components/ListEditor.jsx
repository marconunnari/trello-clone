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

    document.addEventListener("click", handleClick, false);
    return () => document.removeEventListener("click", handleClick, false);
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
