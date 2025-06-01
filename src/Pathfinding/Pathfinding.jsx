import React, { Component } from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import './Pathfinding.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      movingNodeType: null,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }

  handleMouseDown(row, col, type) {
    if (type === 'start' || type === 'finish') {
      this.setState({ movingNodeType: type, mouseIsPressed: true });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    const { mouseIsPressed, movingNodeType, grid } = this.state;
    if (!mouseIsPressed) return;

    if (movingNodeType === 'start' || movingNodeType === 'finish') {
      const node = grid[row][col];
      if (node.isWall || (movingNodeType === 'start' && node.isFinish) || (movingNodeType === 'finish' && node.isStart)) return;

      const newGrid = grid.map(rowArr =>
        rowArr.map(n => {
          if (movingNodeType === 'start') {
            if (n.isStart) return { ...n, isStart: false };
            if (n.row === row && n.col === col) return { ...n, isStart: true };
          }
          if (movingNodeType === 'finish') {
            if (n.isFinish) return { ...n, isFinish: false };
            if (n.row === row && n.col === col) return { ...n, isFinish: true };
          }
          return n;
        })
      );
      this.setState({ grid: newGrid });
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false, movingNodeType: null });
  }

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = getStartNode(grid);
    const finishNode = getFinishNode(grid);
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeEl = document.getElementById(`node-${node.row}-${node.col}`);
        if (
          nodeEl &&
          !nodeEl.classList.contains('node-start') &&
          !nodeEl.classList.contains('node-finish')
        ) {
          nodeEl.className = 'node node-visited';
        }
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const nodeEl = document.getElementById(`node-${node.row}-${node.col}`);
        if (
          nodeEl &&
          !nodeEl.classList.contains('node-start') &&
          !nodeEl.classList.contains('node-finish')
        ) {
          nodeEl.className = 'node node-shortest-path';
        }
      }, 50 * i);
    }
  }

  resetGrid() {
    const newGrid = getInitialGrid();

    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[0].length; col++) {
        const node = newGrid[row][col];
        const nodeEl = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeEl) {
          nodeEl.className = 'node';
          if (node.isStart) nodeEl.classList.add('node-start');
          if (node.isFinish) nodeEl.classList.add('node-finish');
        }
      }
    }

    this.setState({ grid: newGrid });
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <>
        <div className="controls">
          <button onClick={() => this.visualizeDijkstra()}>
            Visualize Dijkstra's Algorithm
          </button>
          <button onClick={() => this.resetGrid()}>
            Reset Grid
          </button>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx}>
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col, type) =>
                      this.handleMouseDown(row, col, type)
                    }
                    onMouseEnter={(row, col) =>
                      this.handleMouseEnter(row, col)
                    }
                    onMouseUp={() => this.handleMouseUp()}
                    row={row}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </>
    );
  }
}

function getStartNode(grid) {
  for (const row of grid) {
    for (const node of row) {
      if (node.isStart) return node;
    }
  }
  return null;
}

function getFinishNode(grid) {
  for (const row of grid) {
    for (const node of row) {
      if (node.isFinish) return node;
    }
  }
  return null;
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (node.isStart || node.isFinish) return newGrid;
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
