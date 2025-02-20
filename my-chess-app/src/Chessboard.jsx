import React, { useState, useEffect, useRef } from 'react';
import './Chessboard.css'; // Import your CSS file

const Chessboard = () => {
  const [board, setBoard] = useState(getInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const boardRef = useRef(null);

  useEffect(() => {
    // This effect handles animations. It uses requestAnimationFrame for smoother animations
    const animateMove = (from, to) => {
      const fromSquare = boardRef.current.querySelector(`.square[data-row="${from.row}"][data-col="${from.col}"]`);
      const toSquare = boardRef.current.querySelector(`.square[data-row="${to.row}"][data-col="${to.col}"]`);
      const piece = fromSquare.querySelector('.piece');

      if (!piece) return; // No piece to animate

      const fromRect = fromSquare.getBoundingClientRect();
      const toRect = toSquare.getBoundingClientRect();
      const pieceRect = piece.getBoundingClientRect();

      const offsetX = toRect.left - fromRect.left;
      const offsetY = toRect.top - fromRect.top;

      piece.style.transition = 'none'; // Disable initial transitions
      piece.style.position = 'absolute';
      piece.style.top = `${pieceRect.top - boardRef.current.getBoundingClientRect().top}px`;
      piece.style.left = `${pieceRect.left - boardRef.current.getBoundingClientRect().left}px`;


      requestAnimationFrame(() => { // First frame to allow positioning
        piece.style.transition = 'transform 0.3s ease'; // Enable transition for the move
        piece.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

        piece.addEventListener('transitionend', () => {
            piece.style.transition = ''; // Reset transition
            piece.style.transform = ''; // Reset transform
            setBoard(updateBoardAfterMove(board, from, to)); // Update board state *after* animation
            setSelectedPiece(null);
            setValidMoves([]);
          }, {once:true});
      });
    };

    if (selectedPiece && validMoves.length > 0) {
      const targetSquare = validMoves.find(move => move.row === selectedPiece.row && move.col === selectedPiece.col);
      if(targetSquare){
          animateMove(selectedPiece, targetSquare);
      }
    }
  }, [selectedPiece, validMoves]);



  const handleSquareClick = (row, col) => {
    const clickedSquare = board[row][col];

    if (selectedPiece) {
      const move = validMoves.find(move => move.row === row && move.col === col);
      if (move) {
        setSelectedPiece(move); // Trigger useEffect for animation
      } else if (clickedSquare.piece && clickedSquare.piece.color === selectedPiece.piece.color) { // Select new piece if same color
        setSelectedPiece(clickedSquare);
        setValidMoves(getValidMoves(board, clickedSquare));
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (clickedSquare.piece) {
      setSelectedPiece(clickedSquare);
      setValidMoves(getValidMoves(board, clickedSquare));
    }
  };

  const getValidMoves = (currentBoard, piece) => {
    // (Simplified logic - replace with actual chess rules)
    if (!piece || !piece.piece) return [];
    const moves = [];

    // Example: King can move one square in any direction
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of directions) {
      const nr = piece.row + dr;
      const nc = piece.col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        moves.push({ row: nr, col: nc });
      }
    }

    return moves;
  };

  const updateBoardAfterMove = (currentBoard, from, to) => {
    const newBoard = currentBoard.map(row => [...row]); // Deep copy

    const piece = newBoard[from.row][from.col].piece;
    newBoard[from.row][from.col].piece = null;
    newBoard[to.row][to.col].piece = piece;

    return newBoard;
  };

  const renderPiece = (piece) => {
    if (!piece) return null;
    const pieceStyle = {
      // Modern minimal design
      fontSize: '24px', // Adjust size as needed
      textAlign: 'center',
      lineHeight: '1',
      fontFamily: 'serif' // or any minimal font
    };

    return <span className="piece" style={pieceStyle}>{piece.type}</span>; // Use piece type as character
  };

  const renderSquare = (row, col) => {
    const squareColor = (row + col) % 2 === 0 ? 'light' : 'dark';
    const isHighlighted = validMoves.some(move => move.row === row && move.col === col);

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${squareColor} ${isHighlighted ? 'highlight' : ''}`}
        data-row={row}
        data-col={col}
        onClick={() => handleSquareClick(row, col)}
      >
        {renderPiece(board[row][col].piece)}
      </div>
    );
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="board-row">
        {row.map((col, colIndex) => renderSquare(rowIndex, colIndex))}
      </div>
    ));
  };

  return (
    <div className="chessboard" ref={boardRef}>
      {renderBoard()}
    </div>
  );
};

const getInitialBoard = () => {
  // Simplified initial board setup (replace with full setup)
  const initialBoard = [];
  for (let i = 0; i < 8; i++) {
    initialBoard[i] = [];
    for (let j = 0; j < 8; j++) {
      initialBoard[i][j] = {
        piece: null // Initially no pieces
      };
    }
  }

  // Example: Add a King
  initialBoard[0][0].piece = { type: 'K', color: 'w' }; // White King
  initialBoard[7][7].piece = { type: 'K', color: 'b' }; // Black King
  initialBoard[1][1].piece = { type: 'P', color: 'w' }; // White pawn
  initialBoard[6][6].piece = { type: 'P', color: 'b' }; // Black pawn


  return initialBoard;
};

export default Chessboard;