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
