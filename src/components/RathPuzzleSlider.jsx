import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PUZZLE_IMAGE,
  canMoveTile,
  formatPuzzleTime,
  isSolved,
  moveTile,
  shuffleBoard,
  tileBackgroundStyle,
} from '../lib/slidingPuzzle';
import styles from './RathPuzzleSlider.module.css';

const SHARE_PATH = '/rath-playground';
const WIN_SOUND = '/mela-memory-win.mp3';

function buildShareText(size, moves, seconds) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}${SHARE_PATH}` : SHARE_PATH;
  return `I solved the Rath Yatra Puzzle (${size}×${size}) in ${moves} moves and ${formatPuzzleTime(seconds)}! 🙏🛕\nCan you beat me? Play here: ${url}`;
}

export default function RathPuzzleSlider({ onSolve, onCelebrate, onCelebrateStop }) {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(() => shuffleBoard(3));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shareNote, setShareNote] = useState('');
  const timerRef = useRef(null);
  const reportedRef = useRef(false);
  const winSoundRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopWinFx = useCallback(() => {
    if (winSoundRef.current) {
      winSoundRef.current.pause();
      winSoundRef.current = null;
    }
    onCelebrateStop?.();
  }, [onCelebrateStop]);

  const startNewGame = useCallback((nextSize = size) => {
    stopTimer();
    stopWinFx();
    setBoard(shuffleBoard(nextSize));
    setMoves(0);
    setSeconds(0);
    setSolved(false);
    setShareNote('');
    reportedRef.current = false;
  }, [size, stopTimer, stopWinFx]);

  const switchSize = useCallback((nextSize) => {
    setSize(nextSize);
    startNewGame(nextSize);
  }, [startNewGame]);

  useEffect(() => () => {
    stopTimer();
    stopWinFx();
  }, [stopTimer, stopWinFx]);

  useEffect(() => {
    if (solved) {
      stopTimer();
      return undefined;
    }
    if (moves === 0) return undefined;
    if (timerRef.current) return undefined;

    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => stopTimer();
  }, [moves, solved, stopTimer]);

  useEffect(() => {
    if (!isSolved(board, size) || reportedRef.current) return;
    reportedRef.current = true;
    setSolved(true);
    stopTimer();

    const audio = new Audio(WIN_SOUND);
    winSoundRef.current = audio;
    audio.play().catch(() => {});
    onCelebrate?.();
    onSolve?.();
  }, [board, size, onSolve, onCelebrate, stopTimer]);

  function handleTileClick(index) {
    if (solved || !canMoveTile(board, index, size)) return;
    setBoard((current) => moveTile(current, index, size));
    setMoves((m) => m + 1);
  }

  async function handleShare() {
    const text = buildShareText(size, moves, seconds);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Rath Yatra Puzzle',
          text,
          url: `${window.location.origin}${SHARE_PATH}`,
        });
        setShareNote('Shared — Jai Jagannath!');
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareNote('Score copied! Paste and challenge friends 🙏');
    } catch {
      setShareNote('Could not share — try again');
    }
  }

  const boardClass = size === 4
    ? `${styles.board} ${styles.boardSize4}`
    : `${styles.board} ${styles.boardSize3}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.modeRow} role="group" aria-label="Puzzle size">
        <button
          type="button"
          className={`${styles.modeBtn} ${size === 3 ? styles.modeBtnActive : ''}`}
          onClick={() => switchSize(3)}
        >
          3×3
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${size === 4 ? styles.modeBtnActive : ''}`}
          onClick={() => switchSize(4)}
        >
          4×4
        </button>
      </div>

      <div className={styles.topMeta}>
        <p className={styles.status} role="status">
          {solved ? 'Puzzle complete!' : moves === 0 ? 'Restore Lord Jagannath' : 'Keep sliding…'}
        </p>
        <div className={styles.statsRow} aria-label="Score">
          <span className={styles.statPill}>⏱ {formatPuzzleTime(seconds)}</span>
          <span className={styles.statPill}>👆 {moves}</span>
        </div>
      </div>

      <div className={styles.playArea}>
        <div
          className={boardClass}
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          role="grid"
          aria-label={`${size} by ${size} sliding puzzle`}
        >
          {board.map((tile, index) => {
            if (tile === 0) {
              return <div key={index} className={styles.empty} role="gridcell" aria-label="Empty space" />;
            }
            const movable = !solved && canMoveTile(board, index, size);
            return (
              <button
                key={index}
                type="button"
                className={`${styles.tile} ${movable ? styles.tileMovable : ''}`}
                style={tileBackgroundStyle(tile, size, PUZZLE_IMAGE)}
                onClick={() => handleTileClick(index)}
                disabled={solved}
                role="gridcell"
                aria-label={`Tile ${tile}${movable ? ', can move' : ''}`}
              />
            );
          })}
        </div>

        <div className={styles.preview} title="Goal image">
          <img src={PUZZLE_IMAGE} alt="Completed puzzle reference" />
          <span className={styles.previewLabel}>Goal</span>
        </div>
      </div>

      {solved ? (
        <div className={styles.winBanner}>
          Jai Jagannath! {moves} moves · {formatPuzzleTime(seconds)}
        </div>
      ) : null}

      <div className={styles.actions}>
        {!solved ? (
          <button type="button" className={`${styles.actionBtn} ${styles.secondaryBtn}`} onClick={() => startNewGame(size)}>
            Shuffle
          </button>
        ) : (
          <>
            <button type="button" className={`${styles.actionBtn} ${styles.shareBtn}`} onClick={handleShare}>
              Share
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={() => startNewGame(size)}>
              Again
            </button>
          </>
        )}
      </div>

      {shareNote ? <p className={styles.toast}>{shareNote}</p> : null}
    </div>
  );
}
