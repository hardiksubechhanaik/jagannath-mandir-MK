import { useCallback, useEffect, useRef, useState } from 'react';
import { getWallPosition, saveWallPosition } from '../../lib/rathWallPositions';

const BOUNDS = { minLeft: 0, maxLeft: 90, minTop: 0, maxTop: 85 };

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function DraggableWallItem({
  boardRef,
  itemType,
  itemId,
  leftPct,
  topPct,
  rot = 0,
  z = 1,
  className = '',
  draggingClassName = '',
  style: extraStyle,
  suppressTransform = false,
  children,
}) {
  const [pos, setPos] = useState(() => getWallPosition(itemType, itemId) ?? { leftPct, topPct });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    if (dragging) return;
    const saved = getWallPosition(itemType, itemId);
    setPos(saved ?? { leftPct, topPct });
  }, [leftPct, topPct, itemType, itemId, dragging]);

  const finishDrag = useCallback((pointerId) => {
    if (!dragRef.current || dragRef.current.pointerId !== pointerId) return;
    dragRef.current = null;
    setDragging(false);
    saveWallPosition(itemType, itemId, posRef.current);
  }, [itemType, itemId]);

  const onPointerDown = useCallback((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const board = boardRef.current;
    if (!board) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = board.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: posRef.current.leftPct,
      originTop: posRef.current.topPct,
      boardW: rect.width,
      boardH: rect.height,
    };
    setDragging(true);
  }, [boardRef]);

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();

    const deltaLeft = ((event.clientX - drag.startX) / drag.boardW) * 100;
    const deltaTop = ((event.clientY - drag.startY) / drag.boardH) * 100;

    setPos({
      leftPct: clamp(drag.originLeft + deltaLeft, BOUNDS.minLeft, BOUNDS.maxLeft),
      topPct: clamp(drag.originTop + deltaTop, BOUNDS.minTop, BOUNDS.maxTop),
    });
  }, []);

  const onPointerUp = useCallback((event) => {
    finishDrag(event.pointerId);
  }, [finishDrag]);

  const onPointerCancel = useCallback((event) => {
    finishDrag(event.pointerId);
  }, [finishDrag]);

  const showTransform = dragging || !suppressTransform;

  return (
    <div
      className={`${className} ${dragging ? draggingClassName : ''}`.trim()}
      style={{
        left: `${pos.leftPct}%`,
        top: `${pos.topPct}%`,
        zIndex: dragging ? 980 : z,
        transform: showTransform ? `rotate(${rot}deg)` : undefined,
        touchAction: 'none',
        ...extraStyle,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children}
    </div>
  );
}
