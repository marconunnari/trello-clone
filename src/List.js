import React, { Component } from "react";
import db from "./db";

import CardEditor from "./CardEditor";
import Card from "./Card";
import ListEditor from "./ListEditor";

class List extends Component {
  state = {
    editingTitle: !this.props.list.title,
    title: this.props.list.title,
    addingCard: false
  };

  toggleEditingTitle = () =>
    this.setState({ editingTitle: !this.state.editingTitle });

  handleChangeTitle = e => this.setState({ title: e.target.value });

  editListTitle = async () => {
    const { list } = this.props;
    const { title } = this.state;

    await db.database.lists.update(list.id, { title });

    this.toggleEditingTitle();
  };

  deleteList = async () => {
    const { list } = this.props;
    await db.database.lists.delete(list.id);
  };

  toggleAddingCard = () =>
    this.setState({ addingCard: !this.state.addingCard });

  addCard = async content => {
    const { list, cards } = this.props;

    await db.database.cards.add({
      listId: list.id,
      position: cards.length,
      content
    });
    this.toggleAddingCard();
  };

  render() {
    const { list, cards } = this.props;
    const { editingTitle, addingCard, title } = this.state;

    return (
      <div className="List">
        {editingTitle ? (
          <ListEditor
            list={list}
            title={title}
            handleChangeTitle={this.handleChangeTitle}
            saveList={this.editListTitle}
            onClickOutside={this.editListTitle}
            deleteList={this.deleteList}
          />
        ) : (
          <div className="List-Title" onClick={this.toggleEditingTitle}>
            {title}
          </div>
        )}

        {cards
          .sort((card1, card2) => card1.position - card2.position)
          .map(card => (
            <Card key={card.id} card={card} />
          ))}

        {addingCard ? (
          <CardEditor
            onSave={this.addCard}
            onCancel={this.toggleAddingCard}
            adding
          />
        ) : (
          <div className="Toggle-Add-Card" onClick={this.toggleAddingCard}>
            <ion-icon name="add" /> Add another card
          </div>
        )}
      </div>
    );
  }
}

export default List;
