import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

type Position = {
  row: number;
  col: number;
};

type Piece = {
  type: string;
  isWhite: boolean;
};

const initialBoard: (Piece | null)[][] = [
  [
    { type: '♜', isWhite: false }, { type: '♞', isWhite: false }, { type: '♝', isWhite: false }, { type: '♛', isWhite: false },
    { type: '♚', isWhite: false }, { type: '♝', isWhite: false }, { type: '♞', isWhite: false }, { type: '♜', isWhite: false }
  ],
  Array(8).fill(null).map(() => ({ type: '♟', isWhite: false })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: '♟', isWhite: true })),
  [
    { type: '♜', isWhite: true }, { type: '♞', isWhite: true }, { type: '♝', isWhite: true }, { type: '♛', isWhite: true },
    { type: '♚', isWhite: true }, { type: '♝', isWhite: true }, { type: '♞', isWhite: true }, { type: '♜', isWhite: true }
  ]
];

export default function ChessBoard() {
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoard);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [pieceAnimation] = useState(new Animated.Value(0));

  const animatePieceMovement = useCallback(() => {
    Animated.sequence([
      Animated.timing(pieceAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pieceAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pieceAnimation]);

  const movePiece = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (piece) {
      animatePieceMovement();
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      setBoard(newBoard);
      setIsWhiteTurn(!isWhiteTurn);
    }
    
    setSelectedPosition(null);
  };

  const handleSquarePress = (row: number, col: number) => {
    if (!selectedPosition) {
      const piece = board[row][col];
      if (piece && piece.isWhite === isWhiteTurn) {
        setSelectedPosition({ row, col });
      }
    } else {
      if (row === selectedPosition.row && col === selectedPosition.col) {
        setSelectedPosition(null);
      } else {
        movePiece(selectedPosition, { row, col });
      }
    }
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = isSquareSelected(row, col);

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.square,
          isLight ? styles.lightSquare : styles.darkSquare,
          isSelected && styles.selectedSquare,
        ]}
        onPress={() => handleSquarePress(row, col)}>
        {piece && (
          <Animated.Text
            style={[
              styles.piece,
              { color: piece.isWhite ? '#FFFFFF' : '#000000' },
              {
                transform: [
                  {
                    scale: pieceAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}>
            {piece.type}
          </Animated.Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.turnIndicator}>
        {isWhiteTurn ? "White's Turn" : "Black's Turn"}
      </Text>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  turnIndicator: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '500',
    color: '#333',
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  square: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightSquare: {
    backgroundColor: '#EEEED2',
  },
  darkSquare: {
    backgroundColor: '#769656',
  },
  selectedSquare: {
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
  },
  piece: {
    fontSize: 32,
    fontWeight: '600',
  },
});