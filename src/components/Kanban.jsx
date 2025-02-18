import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import {
  FaFire,
  FaShoppingCart,
  FaCartArrowDown,
  FaClipboardCheck,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";

const DEFAULT_CARDS = [
  { id: nanoid(), listName: "toBuy", content: "Buy milk" },
  { id: nanoid(), listName: "inCart", content: "Buy eggs" },
  { id: nanoid(), listName: "stocked", content: "Buy bread" },
  { id: nanoid(), listName: "toBuy", content: "Buy cheese" },
  { id: nanoid(), listName: "inCart", content: "Buy butter" },
  { id: nanoid(), listName: "stocked", content: "Buy jam" },
];

const Kanban = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [currentList, setCurrentList] = useState("toBuy");
  const currentTitle =
    currentList === "toBuy"
      ? "To Buy"
      : currentList === "inCart"
      ? "In Cart"
      : "Stocked";
  console.log(cards);

  let leftList;
  let rightList;

  switch (currentList) {
    case "toBuy":
      leftList = "burnBarrel";
      rightList = "inCart";
      break;
    case "inCart":
      leftList = "toBuy";
      rightList = "stocked";
      break;
    case "stocked":
      leftList = "burnBarrel";
      rightList = "inCart";
      break;
    default:
      leftList = "burnBarrel";
      rightList = "inCart";
      break;
  }

  return (
    <div className="h-dvh w-full grid grid-cols-12">
      <MoveCard
        cards={cards}
        setCards={setCards}
        listName={leftList}
        className="col-span-1"
      />
      <div className="col-span-10 grid grid-rows-12">
        <div className="row-span-11 p-5 ">
          <div className="relative w-full h-full">
            <List
              cards={cards}
              setCards={setCards}
              title={currentTitle}
              listName={currentList}
            />
            <AddCard
              listName={currentList}
              setCards={setCards}
              className="absolute bottom-0 right-0"
            />
          </div>
        </div>
        <div className="row-span-1 grid grid-cols-3">
          <button
            onClick={() => setCurrentList("toBuy")}
            className={twMerge(
              "border-t border-r border-black px-4 py-2",
              currentList === "toBuy" && "bg-gray-300 font-bold"
            )}
          >
            To Buy
          </button>
          <button
            onClick={() => setCurrentList("inCart")}
            className={twMerge(
              "border-t border-r border-black px-4 py-2",
              currentList === "inCart" && "bg-gray-300 font-bold"
            )}
          >
            In Cart
          </button>
          <button
            onClick={() => setCurrentList("stocked")}
            className={twMerge(
              "border-t border-black px-4 py-2",
              currentList === "stocked" && "bg-gray-300 font-bold"
            )}
          >
            Stocked
          </button>
        </div>
      </div>
      <MoveCard
        cards={cards}
        setCards={setCards}
        listName={rightList}
        className="col-span-1"
      />
    </div>
  );
};

const List = ({ cards, title, setCards, listName, className }) => {
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
      className={twMerge(
        className,
        "w-full h-full flex flex-col items-center gap-1 p-1 overflow-y-auto",
        active ? "bg-neutral-800/50" : "bg-neutral-800/0"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <h1>{title}</h1>
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
  className: PropTypes.string,
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
        className="w-full h-10 border border-black bg-stone-200 cursor-grab active:cursor-grabbing items-center flex justify-center"
      >
        {card.content}
      </motion.div>
    </>
  );
};

Card.propTypes = {
  card: PropTypes.object.isRequired,
  handleDragStart: PropTypes.func.isRequired,
};

const AddCard = ({ listName, setCards, className }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim().length) return;

    const newCard = {
      listName,
      content: text.trim(),
      id: nanoid(),
    };

    setCards((pv) => [...pv, newCard]);

    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form
          layout
          onSubmit={handleSubmit}
          className={twMerge(className, "w-full")}
        >
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new item..."
            className="w-full h-[20vh] rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-800 placeholder-violet-300 focus:outline-0 resize-none"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className={twMerge(
            className,
            "bg-purple-400 grid place-items-center p-5 transition-color rounded-full"
          )}
        >
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

AddCard.propTypes = {
  listName: PropTypes.string.isRequired,
  setCards: PropTypes.func.isRequired,
  className: PropTypes.string,
};

const MoveCard = ({ cards, setCards, listName, className }) => {
  const [active, setActive] = useState(false);

  const styles = {
    toBuy: {
      activeIcon: FaCheckCircle,
      inactiveIcon: FaShoppingCart,
      activeStyle: "border-blue-800 bg-blue-800/20 text-blue-500",
      inactiveStyle: "border-neutral-500 bg-neutral-500/20 text-neutral-500",
    },
    inCart: {
      activeIcon: FaClipboardCheck,
      inactiveIcon: FaCartArrowDown,
      activeStyle: "border-green-800 bg-green-800/20 text-green-500",
      inactiveStyle: "border-neutral-500 bg-neutral-500/20 text-neutral-500",
    },
    stocked: {
      activeIcon: FaCheckCircle,
      inactiveIcon: FaBoxOpen,
      activeStyle: "border-yellow-800 bg-yellow-800/20 text-yellow-500",
      inactiveStyle: "border-neutral-500 bg-neutral-500/20 text-neutral-500",
    },
    burnBarrel: {
      activeIcon: FaFire,
      inactiveIcon: FiTrash,
      activeStyle: "border-red-800 bg-red-800/20 text-red-500",
      inactiveStyle: "border-neutral-500 bg-neutral-500/20 text-neutral-500",
    },
  };

  const {
    activeIcon: ActiveIcon,
    inactiveIcon: InactiveIcon,
    activeStyle,
    inactiveStyle,
  } = styles[listName] || {};

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDrop = (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    if (listName === "burnBarrel") {
      setCards((pv) => pv.filter((c) => c.id !== cardId));
      setActive(false);
      return;
    }

    let copy = [...cards];
    let cardToTransfer = copy.find((card) => {
      console.log(card.id, cardId);
      return card.id === cardId;
    });

    if (!cardToTransfer) return;

    cardToTransfer = { ...cardToTransfer, listName };

    copy = copy.filter((card) => card.id !== cardId);
    copy.push(cardToTransfer);

    setCards(copy);

    setActive(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={twMerge(
        className,
        "h-full w-full grid place-content-center border text-3xl",
        active ? activeStyle : inactiveStyle
      )}
    >
      {active ? <ActiveIcon className="animate-bounce" /> : <InactiveIcon />}
    </div>
  );
};

MoveCard.propTypes = {
  cards: PropTypes.array.isRequired,
  setCards: PropTypes.func.isRequired,
  listName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Kanban;
