"use client";
import React, { useState, useEffect, CSSProperties } from "react";

// Types
type Board = number[][];

// Generate a full valid Sudoku solution using backtracking
function generateSolution(): Board {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isSafe(row: number, col: number, num: number): boolean {
    // check row & col
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    // check 3x3 block
    const r0 = Math.floor(row / 3) * 3;
    const c0 = Math.floor(col / 3) * 3;
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        if (board[r0 + dr][c0 + dc] === num) return false;
      }
    }
    return true;
  }

  function fillCell(idx: number = 0): boolean {
    if (idx === 81) return true;
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    const nums = [...Array(9)].map((_, i) => i + 1).sort(() => Math.random() - 0.5);
    for (const num of nums) {
      if (isSafe(row, col, num)) {
        board[row][col] = num;
        if (fillCell(idx + 1)) {
          return true;
        }
        board[row][col] = 0;
      }
    }
    return false;
  }

  fillCell();
  return board;
}

// Generate puzzle from solution by removing cells
function generatePuzzle(full: Board, removeCount = 40): Board {
  const puzzle = full.map((row) => row.slice());
  let removed = 0;
  while (removed < removeCount) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return puzzle;
}

// Styles
const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(9, 2.5rem)",
  gap: "2px",
  backgroundColor: "#000",
  padding: "2px",
};
const cellStyle: CSSProperties = {
  width: "2.5rem",
  height: "2.5rem",
  textAlign: "center",
  fontSize: "1.2rem",
  border: "none",
  outline: "none",
};
const accent = "#0070f3";

export default function Page() {
  const [solution, setSolution] = useState<Board>([]);
  const [puzzle, setPuzzle] = useState<Board>([]);
  const [input, setInput] = useState<string[][]>([]);
  const [errors, setErrors] = useState<boolean[][]>([]);

  // Initialize board
  useEffect(() => {
    const full = generateSolution();
    setSolution(full);
    const pz = generatePuzzle(full, 40);
    setPuzzle(pz);
    setInput(pz.map((row) => row.map((v) => (v > 0 ? String(v) : ""))));
    setErrors(Array.from({ length: 9 }, () => Array(9).fill(false)));
  }, []);

  const handleChange = (r: number, c: number, val: string) => {
    if (!/^[1-9]?$/.test(val)) return;
    const newInput = input.map((row) => row.slice());
    newInput[r][c] = val;
    setInput(newInput);

    // Validate
    const newErr = errors.map((row) => row.slice());
    newErr[r][c] = false;
    if (val) {
      const num = parseInt(val, 10);
      // Check row & col & block
      for (let i = 0; i < 9; i++) {
        if ((i !== c && newInput[r][i] === val) || (i !== r && newInput[i][c] === val)) {
          newErr[r][c] = true;
        }
      }
      const r0 = Math.floor(r / 3) * 3;
      const c0 = Math.floor(c / 3) * 3;
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          if ((r0 + dr !== r || c0 + dc !== c) && newInput[r0 + dr][c0 + dc] === val) {
            newErr[r][c] = true;
          }
        }
      }
    }
    setErrors(newErr);
  };

  const regenerate = () => {
    const full = generateSolution();
    const pz = generatePuzzle(full, 40);
    setSolution(full);
    setPuzzle(pz);
    setInput(pz.map((row) => row.map((v) => (v > 0 ? String(v) : ""))));
    setErrors(Array.from({ length: 9 }, () => Array(9).fill(false)));
  };

  return (
    <main style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Sudoku Game</h1>
      <div style={gridStyle}>
        {input.map((row, r) =>
          row.map((val, c) => {
            const fixed = puzzle[r][c] !== 0;
            return (
              <input
                key={`${r}-${c}`}
                style={{
                  ...cellStyle,
                  backgroundColor: fixed ? "#ddd" : "#fff",
                  color: fixed ? "#000" : errors[r][c] ? accent : "#000",
                  fontWeight: fixed ? "bold" : "normal",
                  border: errors[r][c] ? `2px solid ${accent}` : "1px solid #999",
                }}
                value={val}
                disabled={fixed}
                onChange={(e) => handleChange(r, c, e.target.value)}
              />
            );
          })
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          onClick={regenerate}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: accent,
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Generate New Puzzle
        </button>
      </div>
    </main>
  );
}
