import React, { Component } from "react";
import db from "./db";
import CardEditor from "./CardEditor";

class Card extends Component {
  state = {
    hover: false,
    editing: false
  };

  startHover = () => this.setState({ hover: true });
  endHover = () => this.setState({ hover: false });

  startEditing = () =>
    this.setState({
      hover: false,
      editing: true,
      content: this.props.card.content
    });

  endEditing = () => this.setState({ hover: false, editing: false });

  editCard = async content => {
    const { card } = this.props;
    await db.database.cards.update(card.id, { content });

    this.endEditing();
  };

  deleteCard = async () => {
    const { card } = this.props;
    await db.database.cards.delete(card.id);
  };

  render() {
    const { card } = this.props;
    const { hover, editing } = this.state;

    if (!editing) {
      return (
        <div
          className="Card"
          onMouseEnter={this.startHover}
          onMouseLeave={this.endHover}
        >
          {hover && (
            <div className="Card-Icons">
              <div className="Card-Icon" onClick={this.startEditing}>
                <ion-icon name="create" />
              </div>
            </div>
          )}

          {card.content}
        </div>
      );
    } else {
      return (
        <CardEditor
          content={card.content}
          onSave={this.editCard}
          onDelete={this.deleteCard}
          onCancel={this.endEditing}
        />
      );
    }
  }
}

export default Card;
