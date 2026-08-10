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
