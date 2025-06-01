import React from 'react';
import './Node.css';

export default function Node(props) {
  const {
    col,
    row,
    isFinish,
    isStart,
    isWall,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
  } = props;

  const extraClassName = isFinish
    ? 'node-finish'
    : isStart
    ? 'node-start'
    : isWall
    ? 'node-wall'
    : '';

  let nodeType = null;
  if (isStart) nodeType = 'start';
  else if (isFinish) nodeType = 'finish';

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col, nodeType)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
    ></div>
  );
}
