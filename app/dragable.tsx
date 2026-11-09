"use client";
import Draggable from "react-draggable";

const DraggableItem = ({
  children,
  x,
  y,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
}) => {
  return (
    <Draggable defaultPosition={{ x, y }}>
      <div className="absolute cursor-move">
        {children}
      </div>
    </Draggable>
  );
};

export default DraggableItem;
