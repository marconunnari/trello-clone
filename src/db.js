import Dexie from "dexie";

const database = new Dexie("Trello");

database.version(1).stores({
  lists: "++id,title",
  cards: "++id,listId,content,position,updatedAt"
});

async function seedDatabase() {
  const numberOfLists = 3;
  const cardsForList = 4;
  for (let i = 0; i < numberOfLists; i++) {
    const listId = await database.lists.add({ title: `List ${i}` });
    for (let j = 0; j < cardsForList; j++) {
      await database.cards.add({
        listId: listId,
        position: j,
        updatedAt: new Date().getTime(),
        content: `List ${i} Card ${j}`
      });
    }
  }
}

async function getData() {
  if ((await database.lists.count()) === 0) {
    await seedDatabase();
  }

  const lists = await database.lists.toArray();
  const cards = await database.cards.toArray();
  return { lists, cards };
}

function setUpDataHooks({
  onCreateList,
  onDeleteList,
  onCreateCard,
  onUpdateCard,
  onDeleteCard
}) {
  database.lists.hook("creating", function(_, list) {
    this.onsuccess = function(id) {
      onCreateList({ ...list, id });
    };
  });

  database.lists.hook("updating", function(list, id) {
    console.log(list, id);
  });

  database.lists.hook("deleting", function(id) {
    this.onsuccess = function(_) {
      onDeleteList(id);
    };
  });

  database.cards.hook("creating", function(_, card) {
    this.onsuccess = function(id) {
      onCreateCard({ ...card, id });
    };
  });

  database.cards.hook("updating", function(card, id) {
    this.onsuccess = function(_) {
      onUpdateCard(id, card);
    };
  });

  database.cards.hook("deleting", function(id) {
    this.onsuccess = function(_) {
      onDeleteCard(id);
    };
  });
}

export default { database, getData, setUpDataHooks };
