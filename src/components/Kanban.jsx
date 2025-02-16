import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useState } from "react";

const Kanban = () => {
  const defaultCards = [
    { id: "0", listName: "a" },
    { id: "1", listName: "b" },
    { id: "2", listName: "c" },
    { id: "3", listName: "a" },
    { id: "4", listName: "b" },
    { id: "5", listName: "c" },
  ];
  const [cards, setCards] = useState(defaultCards);
  console.log(cards);

  return (
    <div className="h-screen w-full flex">
      <List cards={cards} setCards={setCards} title="a" listName="a" />
      <List cards={cards} setCards={setCards} title="b" listName="b" />
      <List cards={cards} setCards={setCards} title="c" listName="c" />
    </div>
  );
};

const List = ({ cards, title, setCards, listName }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const handleDrop = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];
      let cardToTransfer = copy.find((card) => {
        console.log(card.id, cardId);
        return card.id === cardId;
      });

      if (!cardToTransfer) return;

      cardToTransfer = { ...cardToTransfer, listName };

      copy = copy.filter((card) => card.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };
  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-list="${listName}"]`));
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  return (
    <div
      className={`w-40 h-full border border-black flex flex-col items-center gap-1 p-1 ${
        active ? "bg-neutral-800/50" : "bg-neutral-800/0"
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <h2>{title}</h2>
      {cards
        .filter((card) => card.listName === listName)
        .map((card) => (
          <Card key={card.id} card={card} handleDragStart={handleDragStart} />
        ))}
      <DropIndicator beforeId={null} listName={listName} />
    </div>
  );
};

List.propTypes = {
  cards: PropTypes.array.isRequired,
  setCards: PropTypes.func.isRequired,

  title: PropTypes.string.isRequired,
  listName: PropTypes.string.isRequired,
};

const DropIndicator = ({ beforeId, listName }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-list={listName}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

DropIndicator.propTypes = {
  beforeId: PropTypes.number,
  listName: PropTypes.string.isRequired,
};

const Card = ({ card, handleDragStart }) => {
  return (
    <>
      <DropIndicator beforeId={card.id} listName={card.listName} />
      <motion.div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, card)}
        layout
        layoutId={card.id}
        className="w-full h-10 border border-black bg-red-400 cursor-grab active:cursor-grabbing items-center flex justify-center"
      >
        {card.id}
      </motion.div>
    </>
  );
};

Card.propTypes = {
  card: PropTypes.object.isRequired,
  handleDragStart: PropTypes.func.isRequired,
};

export default Kanban;
