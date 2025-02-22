import {
  closestCorners,
  DndContext,
  PointerSensor,
  useSensors,
  useSensor,
  KeyboardSensor,
  TouchSensor,
  useDroppable,
} from "@dnd-kit/core";

import { nanoid } from "nanoid";

import { useState } from "react";

import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DEFAULT_CARDS = [
  { id: nanoid(), column: "toBuy", content: "Buy milk" },
  { id: nanoid(), column: "inCart", content: "Buy eggs" },
  { id: nanoid(), column: "stocked", content: "Buy bread" },
  { id: nanoid(), column: "toBuy", content: "Buy cheese" },
  { id: nanoid(), column: "inCart", content: "Buy butter" },
  { id: nanoid(), column: "stocked", content: "Buy jam" },
];

const ShoppingList = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);

  const getCardIndex = (id) => {
    return cards.findIndex((card) => card.id === id);
  };

  const handleDragEnd = ({ active, over }) => {
    if (active.id === over.id) {
      return;
    }

    setCards((prev) => {
      const oldIndex = getCardIndex(active.id);
      const newIndex = getCardIndex(over.id);

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleDragOver = ({ active, over }) => {
    if (active.id === over.id) {
      return;
    }
    const isOverCard = over.data.current?.type === "card";
    const isOverColumn = over.data.current?.type === "column";

    if (isOverCard) {
      setCards((prev) => {
        const activeIndex = getCardIndex(active.id);
        const overIndex = getCardIndex(over.id);

        prev[activeIndex].column = prev[overIndex].column;

        return arrayMove(prev, activeIndex, overIndex);
      });
    } else if (isOverColumn) {
      setCards((prev) => {
        const activeIndex = getCardIndex(active.id);
        prev[activeIndex].column = over.data.current.column;

        return arrayMove(prev, activeIndex, activeIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="h-dvh w-full grid grid-cols-12">
        <Column column="toBuy" cards={cards} className="col-span-4" />
        <Column column="inCart" cards={cards} className="col-span-4" />
        <Column column="stocked" cards={cards} className="col-span-4" />
      </div>
    </DndContext>
  );
};

const Column = ({ column, cards, className }) => {
  const filteredCards = cards.filter((card) => card.column === column);

  const { setNodeRef } = useDroppable({
    id: column,
    data: { type: "column", column },
  });

  return (
    <div ref={setNodeRef} className={twMerge("", className)}>
      <SortableContext
        items={filteredCards}
        strategy={verticalListSortingStrategy}
      >
        {filteredCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </SortableContext>
    </div>
  );
};

Column.propTypes = {
  column: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  className: PropTypes.string,
};

const Card = ({ card }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id, data: { type: "card", card } });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };
  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={styles}
        className="w-full h-10 border border-black bg-stone-200 cursor-grab active:cursor-grabbing items-center flex justify-center"
      >
        {card.content}
      </div>
    </>
  );
};

Card.propTypes = {
  card: PropTypes.object.isRequired,
};

export default ShoppingList;
