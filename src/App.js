import "./App.css";

import React, { Component } from "react";
import { DragDropContext } from "react-beautiful-dnd";

import db from "./db";
import List from "./List";
import AddList from "./AddList";

class App extends Component {
  state = {
    lists: [],
    cards: [],
    addingList: false
  };

  create = bucketName => object =>
    this.setState({ [bucketName]: [...this.state[bucketName], object] });

  updateCard = (id, card) => {
    const { cards } = this.state;
    const index = cards.findIndex(tmpCard => tmpCard.id === id);
    cards[index] = { ...cards[index], ...card };
    this.setState({ cards });
  };

  update = bucketName => (id, object) => {
    const bucket = this.state[bucketName];
    const index = bucket.findIndex(tmp => tmp.id === id);
    bucket[index] = { ...bucket[index], ...object };
    this.setState({ [bucketName]: bucket });
  };

  delete = bucketName => id => {
    const bucket = this.state[bucketName];
    const index = bucket.findIndex(tmp => tmp.id === id);
    bucket.splice(index, 1);
    this.setState({ [bucketName]: bucket });
  };

  async componentDidMount() {
    const { lists, cards } = await db.getData();

    db.setUpDataHooks({
      onCreateList: this.create("lists"),
      onDeleteList: this.delete("lists"),
      onCreateCard: this.create("cards"),
      onUpdateCard: this.update("cards"),
      onDeleteCard: this.delete("cards")
    });

    this.setState({ lists, cards });
  }

  toggleAddingList = () =>
    this.setState({ addingList: !this.state.addingList });

  getList = id => {
    const { lists } = this.state;

    return lists.find(list => list.id === id);
  };

  onDragEnd = ({ draggableId, destination }) => {
    // dropped outside the list
    if (!destination) {
      return;
    }

    const [cardId, newListId, newPosition] = [
      draggableId,
      destination.droppableId,
      destination.index
    ];

    db.database.cards.update(cardId, {
      listId: newListId,
      position: newPosition,
      updatedAt: new Date().getTime()
    });
  };

  sortCards = (card1, card2) => {
    const positionDelta = card1.position - card2.position;
    if (positionDelta !== 0) return positionDelta;

    const updateDelta = card2.updatedAt - card1.updatedAt;
    return updateDelta;
  };

  render() {
    const { lists, cards, addingList } = this.state;

    return (
      <div className="App">
        <div className="Header">Trello Clone</div>

        <div className="Board">
          <DragDropContext onDragEnd={this.onDragEnd}>
            {lists.map(list => {
              const listCards = cards
                .filter(card => card.listId === list.id)
                .sort(this.sortCards);

              return <List list={list} cards={listCards} key={list.id} />;
            })}
          </DragDropContext>

          <div className="Add-List">
            {addingList ? (
              <AddList toggleAddingList={this.toggleAddingList} />
            ) : (
              <div onClick={this.toggleAddingList} className="Add-List-Button">
                <ion-icon name="add" /> Add another list
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
