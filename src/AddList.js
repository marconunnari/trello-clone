import React, { Component } from "react";
import { connect } from "react-redux";
import ListEditor from "./ListEditor";
import shortid from "shortid";

class AddList extends Component {
  state = {
    title: ""
  };

  handleChangeTitle = e => this.setState({ title: e.target.value });

  createList = async () => {
    const { title } = this.state;
    const { dispatch } = this.props;

    this.props.toggleAddingList();

    dispatch({
      type: "ADD_LIST",
      payload: { listId: shortid.generate(), listTitle: title }
    });
  };

  render() {
    const { toggleAddingList } = this.props;
    const { title } = this.state;

    return (
      <div className="Add-List-Editor">
        <ListEditor
          title={title}
          handleChangeTitle={this.handleChangeTitle}
          onClickOutside={toggleAddingList}
          saveList={this.createList}
        />

        <div className="Edit-Buttons">
          <div
            tabIndex="0"
            className="Edit-Button"
            style={{ backgroundColor: "#5aac44" }}
            onClick={this.createList}
          >
            Add list
          </div>
          <div
            tabIndex="0"
            className="Edit-Button-Cancel"
            // onClick={onCancel}
          >
            <ion-icon name="close" />
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(AddList);
