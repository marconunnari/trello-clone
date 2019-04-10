import "./App.css";

import React, { Component } from "react";
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

  deleteCard = id => {
    const { cards } = this.state;
    const index = cards.findIndex(tmpCard => tmpCard.id === id);
    cards.splice(index, 1);
    this.setState({ cards });
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
      onUpdateCard: this.updateCard,
      onDeleteCard: this.delete("cards")
    });

    this.setState({ lists, cards });
  }

  toggleAddingList = () =>
    this.setState({ addingList: !this.state.addingList });

  render() {
    const { lists, cards, addingList } = this.state;

    return (
      <div className="App">
        <div className="Header">Trello Clone</div>

        <div className="Board">
          {lists.map(list => {
            const listCards = cards.filter(card => card.listId === list.id);
            return <List list={list} cards={listCards} key={list.id} />;
          })}

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
