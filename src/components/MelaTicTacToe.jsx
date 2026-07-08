import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './MelaTicTacToe.module.css';

const P1 = '🙏';
const P2 = '🪔';
const WIN_SOUND = '/mela-memory-win.mp3';
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const EMPTY = () => Array(9).fill(null);

function getWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return { winner: null, line: [] };
}

function findBestMove(board) {
  let bestScore = -Infinity;
  let bestIndex = board.findIndex((cell) => !cell);

  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;
    board[i] = P2;
    const score = minimax(board, false);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function minimax(board, isMaximizing) {
  const { winner } = getWinner(board);
  if (winner === P2) return 1;
  if (winner === P1) return -1;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < board.length; i += 1) {
      if (board[i]) continue;
      board[i] = P2;
      best = Math.max(best, minimax(board, false));
      board[i] = null;
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) continue;
    board[i] = P1;
    best = Math.min(best, minimax(board, true));
    board[i] = null;
  }
  return best;
}

function statusForTurn(mode, turn) {
  if (mode === 'cpu') return 'Your turn — you are 🙏';
  return turn === P1 ? 'Player 1 turn 🙏' : 'Player 2 turn 🪔';
}

function statusForResult(winner, mode) {
  if (winner === P1) {
    return mode === 'cpu' ? 'Jai Jagannath! You win! 🎉' : 'Player 1 wins! 🎉';
  }
  if (winner === P2) {
    return mode === 'cpu' ? 'The diyas take this round 🪔' : 'Player 2 wins! 🎉';
  }
  return 'A peaceful tie — play again! ✨';
}

export default function MelaTicTacToe({ onGameComplete, onCelebrate, onCelebrateStop }) {
  const [mode, setMode] = useState('cpu');
  const [board, setBoard] = useState(EMPTY);
  const [turn, setTurn] = useState(P1);
  const [winLine, setWinLine] = useState([]);
  const [status, setStatus] = useState(statusForTurn('cpu', P1));
  const [scores, setScores] = useState({ p1: 0, p2: 0, draw: 0 });
  const [thinking, setThinking] = useState(false);
  const [roundOver, setRoundOver] = useState(false);

  const onGameCompleteRef = useRef(onGameComplete);
  const roundFinalizedRef = useRef(false);
  const cpuTimerRef = useRef(null);
  const winSoundRef = useRef(null);

  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
  }, [onGameComplete]);

  const stopWinFx = useCallback(() => {
    if (winSoundRef.current) {
      winSoundRef.current.pause();
      winSoundRef.current = null;
    }
    onCelebrateStop?.();
  }, [onCelebrateStop]);

  useEffect(() => () => {
    if (cpuTimerRef.current) window.clearTimeout(cpuTimerRef.current);
    stopWinFx();
  }, [stopWinFx]);

  const finalizeRound = useCallback((winner, line) => {
    if (roundFinalizedRef.current) return;
    roundFinalizedRef.current = true;
    setRoundOver(true);
    setWinLine(line);
    setStatus(statusForResult(winner, mode));
    setThinking(false);

    if (winner === P1) {
      setScores((s) => ({ ...s, p1: s.p1 + 1 }));
    } else if (winner === P2) {
      setScores((s) => ({ ...s, p2: s.p2 + 1 }));
    } else {
      setScores((s) => ({ ...s, draw: s.draw + 1 }));
    }

    if (winner !== 'draw') {
      const audio = new Audio(WIN_SOUND);
      winSoundRef.current = audio;
      audio.play().catch(() => {});
      onCelebrate?.();
    }

    onGameCompleteRef.current?.();
  }, [mode, onCelebrate]);

  useEffect(() => {
    const { winner, line } = getWinner(board);
    if (!winner || roundFinalizedRef.current) return;
    finalizeRound(winner, line);
  }, [board, finalizeRound]);

  const resetRound = useCallback(() => {
    if (cpuTimerRef.current) {
      window.clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }
    stopWinFx();
    setBoard(EMPTY());
    setTurn(P1);
    setWinLine([]);
    setThinking(false);
    roundFinalizedRef.current = false;
    setRoundOver(false);
    setStatus(statusForTurn(mode, P1));
  }, [mode, stopWinFx]);

  const switchMode = useCallback((nextMode) => {
    if (cpuTimerRef.current) {
      window.clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }
    stopWinFx();
    setMode(nextMode);
    setBoard(EMPTY());
    setTurn(P1);
    setWinLine([]);
    setThinking(false);
    roundFinalizedRef.current = false;
    setRoundOver(false);
    setStatus(statusForTurn(nextMode, P1));
  }, [stopWinFx]);

  function handleCellClick(index) {
    if (board[index] || roundFinalizedRef.current) return;
    if (mode === 'cpu' && (thinking || turn !== P1)) return;

    const mark = mode === 'cpu' ? P1 : turn;
    const next = [...board];
    next[index] = mark;
    setBoard(next);

    if (getWinner(next).winner) return;

    if (mode === 'local') {
      const nextTurn = turn === P1 ? P2 : P1;
      setTurn(nextTurn);
      setStatus(statusForTurn('local', nextTurn));
      return;
    }

    setThinking(true);
    setStatus('Diya is thinking…');

    cpuTimerRef.current = window.setTimeout(() => {
      cpuTimerRef.current = null;
      setBoard((current) => {
        if (roundFinalizedRef.current || getWinner(current).winner) {
          setThinking(false);
          return current;
        }
        const afterCpu = [...current];
        const move = findBestMove(afterCpu);
        if (move >= 0) afterCpu[move] = P2;
        setThinking(false);
        if (!getWinner(afterCpu).winner) {
          setStatus(statusForTurn('cpu', P1));
        }
        return afterCpu;
      });
    }, 450);
  }

  const gameOver = roundOver;
  const p1Label = mode === 'cpu' ? 'You' : 'P1';
  const p2Label = mode === 'cpu' ? 'Diya' : 'P2';

  return (
    <div className={styles.wrap}>
      <div className={styles.modeRow} role="group" aria-label="Game mode">
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'cpu' ? styles.modeBtnActive : ''}`}
          onClick={() => switchMode('cpu')}
        >
          🤖 vs Computer
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'local' ? styles.modeBtnActive : ''}`}
          onClick={() => switchMode('local')}
        >
          👥 2 Players
        </button>
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        {status}
      </p>

      <div className={styles.scoreRow} aria-label="Score">
        <span className={styles.scorePill}>🙏 {p1Label} {scores.p1}</span>
        <span className={styles.scorePill}>🪔 {p2Label} {scores.p2}</span>
        <span className={styles.scorePill}>✨ Tie {scores.draw}</span>
      </div>

      <div className={styles.board} role="grid" aria-label="Tic tac toe board">
        {board.map((cell, index) => {
          const isWinCell = winLine.includes(index);
          const dimEmpty = thinking && !cell && !gameOver;
          return (
            <button
              key={index}
              type="button"
              className={`${styles.cell} ${cell ? styles.cellFilled : ''} ${isWinCell ? styles.cellWin : ''} ${dimEmpty ? styles.cellWaiting : ''}`}
              onClick={() => handleCellClick(index)}
              disabled={Boolean(cell) || (mode === 'cpu' && thinking) || gameOver}
              role="gridcell"
              aria-label={cell ? `Cell ${index + 1}: ${cell}` : `Empty cell ${index + 1}`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}><span aria-hidden="true">🙏</span> {mode === 'cpu' ? 'You' : 'Player 1'}</span>
        <span className={styles.legendItem}><span aria-hidden="true">🪔</span> {mode === 'cpu' ? 'Temple diya' : 'Player 2'}</span>
      </div>

      {gameOver ? (
        <button type="button" className={styles.replayBtn} onClick={resetRound}>
          Play again
        </button>
      ) : null}
    </div>
  );
}
