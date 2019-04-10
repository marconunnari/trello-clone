import React, { Component } from "react";
import TextareaAutosize from "react-textarea-autosize";

class CardEditor extends Component {
  state = {
    text: this.props.text || ""
  };

  handleChangeText = event => this.setState({ text: event.target.value });

  onEnter = e => {
    const { text } = this.state;

    if (e.keyCode === 13) {
      e.preventDefault();
      this.props.onSave(text);
    }
  };

  render() {
    const { text } = this.state;
    const { onSave, onCancel, onDelete, adding } = this.props;

    return (
      <div className="Edit-Card">
        <div className="Card">
          <TextareaAutosize
            autoFocus
            className="Edit-Card-Textarea"
            placeholder="Enter the text for this card..."
            value={text}
            onChange={this.handleChangeText}
            onKeyDown={this.onEnter}
          />
        </div>
        <div className="Edit-Buttons">
          <div
            tabIndex="0"
            className="Edit-Button"
            style={{ backgroundColor: "#5aac44" }}
            onClick={() => onSave(text)}
          >
            {adding ? "Add card" : "Save"}
          </div>
          {onDelete && (
            <div
              tabIndex="0"
              className="Edit-Button"
              style={{ backgroundColor: "#EA2525", marginLeft: 0 }}
              onClick={onDelete}
            >
              Delete
            </div>
          )}
          <div tabIndex="0" className="Edit-Button-Cancel" onClick={onCancel}>
            <ion-icon name="close" />
          </div>
        </div>
      </div>
    );
  }
}

export default CardEditor;
