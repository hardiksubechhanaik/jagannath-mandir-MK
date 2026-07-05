import { useEffect, useRef, useState } from 'react';

const SYMBOLS = [
  { id: 'jagannath', label: 'Jagannath', image: '/mela-memory/jagannath.png', labelColor: '#3a1009' },
  { id: 'balabhadra', label: 'Balabhadra', image: '/mela-memory/balabhadra.png', labelColor: '#1B3A6B' },
  { id: 'subhadra', label: 'Subhadra', image: '/mela-memory/subhadra.png', labelColor: '#7A1F1F' },
  { id: 'shankh', label: 'Shankh', image: '/mela-memory/shankh.png', labelColor: '#4A6670' },
  { id: 'chakra', label: 'Sudarshan Chakra', image: '/mela-memory/chakra.png', labelColor: '#8A5A00' },
  { id: 'tulsi', label: 'Tulsi', image: '/mela-memory/tulsi.png', labelColor: '#1F6B3A' },
];

const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));
const MAX_MOVES = 13;
const TOTAL_PAIRS = SYMBOLS.length;
const MEMORY_WIN_SOUND = '/mela-memory-win.mp3';

function playMemoryWinSound(winSoundRef) {
  const audio = new Audio(MEMORY_WIN_SOUND);
  winSoundRef.current = audio;
  audio.play().catch(() => {});
}

function countMatchedPairs(cards) {
  return cards.filter((c) => c.matched).length / 2;
}

function MemoryCard({ card, onFlip, disabled }) {
  const symbol = SYMBOL_BY_ID[card.symKey];
  if (!symbol) return null;

  return (
    <div style={{ perspective: '900px', aspectRatio: '0.74' }}>
      <div
        onClick={() => { if (!disabled) onFlip(card.idx); }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip(card.idx);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={card.flipped || card.matched ? symbol.label : 'Face-down card'}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          cursor: disabled ? 'default' : 'pointer',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s cubic-bezier(.2,.8,.3,1)',
          transform: (card.flipped || card.matched) ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 10,
            background: 'linear-gradient(135deg,#8A63F0,#5B3E9E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
          }}
          aria-hidden="true"
        >
          🕉️
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 10,
            background: '#FFF8ED',
            border: card.matched ? '2px solid #1F8A5B' : '2px solid rgba(194, 138, 30, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            gap: 3,
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
            padding: 3,
            overflow: 'hidden',
          }}
        >
          <img
            src={symbol.image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              flex: 1,
              minHeight: 0,
              objectFit: 'cover',
              borderRadius: 7,
              display: 'block',
            }}
          />
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: symbol.label.length > 10 ? 7 : 8.5,
              fontWeight: 700,
              color: symbol.labelColor,
              textAlign: 'center',
              lineHeight: 1.15,
              padding: '0 2px 2px',
            }}
          >
            {symbol.label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemoryMatch({ onWin, onCelebrate, onCelebrateStop }) {
  const [cards, setCards] = useState([]);
  const [flippedIdx, setFlippedIdx] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const winTrackedRef = useRef(false);
  const winSoundRef = useRef(null);

  const matchedPairs = countMatchedPairs(cards);
  const won = matchedPairs === TOTAL_PAIRS;
  const lost = moves >= MAX_MOVES && matchedPairs < TOTAL_PAIRS && !locked && flippedIdx.length === 0;
  const finished = won || lost;

  function initGame() {
    const deck = [];
    SYMBOLS.forEach((s) => {
      deck.push(s.id);
      deck.push(s.id);
    });
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck.map((symKey, idx) => ({ idx, symKey, flipped: false, matched: false })));
    setFlippedIdx([]);
    setMoves(0);
    setLocked(false);
    winTrackedRef.current = false;
    onCelebrateStop?.();
  }

  function onFlip(i) {
    if (locked || finished) return;
    if (moves >= MAX_MOVES) return;
    const card = cards[i];
    if (!card || card.flipped || card.matched) return;

    const nextFlipped = [...flippedIdx, i];
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    if (nextFlipped.length < 2) {
      setFlippedIdx(nextFlipped);
      return;
    }

    setFlippedIdx(nextFlipped);
    setLocked(true);
    setMoves((m) => m + 1);
    const [a, b] = nextFlipped;
    window.setTimeout(() => {
      setCards((cs) => {
        const match = cs[a].symKey === cs[b].symKey;
        return cs.map((c, idx) => {
          if (idx === a || idx === b) {
            return match ? { ...c, matched: true, flipped: true } : { ...c, flipped: false };
          }
          return c;
        });
      });
      setFlippedIdx([]);
      setLocked(false);
    }, 750);
  }

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => () => {
    if (winSoundRef.current) {
      winSoundRef.current.pause();
      winSoundRef.current.currentTime = 0;
      winSoundRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (won && !winTrackedRef.current) {
      winTrackedRef.current = true;
      playMemoryWinSound(winSoundRef);
      onWin?.();
      onCelebrate?.();
    }
  }, [won, onWin, onCelebrate]);

  return (
    <div
      style={{
        background: '#FFF8ED',
        padding: 26,
        borderRadius: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          fontFamily: 'monospace',
          fontSize: 11.5,
          color: '#6B5A4A',
        }}
      >
        <span>Moves: {moves} / {MAX_MOVES}</span>
        <span>{matchedPairs} / {TOTAL_PAIRS} pairs found</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 9,
        }}
      >
        {cards.map((card) => (
          <MemoryCard key={card.idx} card={card} onFlip={onFlip} disabled={finished} />
        ))}
      </div>

      {won ? (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <p
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 19,
              color: '#5B3E9E',
              margin: '0 0 14px',
            }}
          >
            🎉 All matched, {moves} moves!
          </p>
          <button
            type="button"
            onClick={initGame}
            style={{
              background: '#7C5CFF',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '10px 22px',
              fontFamily: 'Mukta, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Play again
          </button>
        </div>
      ) : null}

      {lost ? (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <p
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 19,
              color: '#8A3A3A',
              margin: '0 0 14px',
            }}
          >
            Out of moves! You found {matchedPairs} / {TOTAL_PAIRS} pairs.
          </p>
          <button
            type="button"
            onClick={initGame}
            style={{
              background: '#7C5CFF',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '10px 22px',
              fontFamily: 'Mukta, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
