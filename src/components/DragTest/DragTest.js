import React, { useState } from 'react';

const DragTest = () => {
  const [arrayList, setArrayList] = useState([
    'alan',
    'bernard',
    'sally',
    'kevin',
    'clive',
    'what',
    'this',
    'is',
    'silly',
  ]);
  const [dragging, setDragging] = useState();
  const [dropTarget, setDropTarget] = useState();

  const dragHandler = (event) => {
    event.target.classList.add('dragging');
    setDragging(parseInt(event.target.id.split('bar-')[1]));
    console.log(`Dragging ${event.target.id}`);
    console.log(event);
  };

  const dragEndHandler = (event) => {
    event.target.classList.remove('dragging');
    if (dropTarget === dragging) return;
    const newList = arrayList.filter((item, index) => index !== dragging);
    newList.splice(dropTarget, 0, arrayList[dragging]);
    setArrayList([...newList]);
  };

  const dragOverHandler = (event) => {
    event.preventDefault();
    // console.log(`Dragging over ${event.target.id}`);
    // console.log(event.target.getBoundingClientRect());
    const overId = parseInt(event.target.id.split('bar-')[1]);
    const { height: targetBarHeight, y: targetBarY } =
      event.target.getBoundingClientRect();
    const mouseY = event.clientY;
    if (mouseY <= targetBarY + targetBarHeight / 2) {
      // inserting above
      event.target.classList.remove('insert-below');
      event.target.classList.add('insert-above');
      setDropTarget(overId);
    } else if (mouseY > targetBarY + targetBarHeight / 2) {
      // inserting below
      event.target.classList.remove('insert-above');
      event.target.classList.add('insert-below');
      setDropTarget(
        overId < arrayList.length - 1 ? overId + 1 : arrayList.length - 1,
      );
    }
  };

  const dragLeaveHandler = (event) => {
    event.target.classList.remove('insert-above');
    event.target.classList.remove('insert-below');
  };

  return (
    <div>
      Drag Test Dragging: {dragging}, Drop Target {dropTarget}
      {arrayList.map((item, index) => (
        <div
          draggable
          id={`bar-${index}`}
          onDragStart={dragHandler}
          onDragEnd={dragEndHandler}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
          className="bar"
          key={item}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default DragTest;
