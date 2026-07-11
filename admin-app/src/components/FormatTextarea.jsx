import { useRef } from 'react';
import { wrapTextareaSelection } from '../lib/richText.js';

export default function FormatTextarea({
  value,
  onChange,
  rows = 6,
  placeholder,
  className = '',
  style,
}) {
  const textareaRef = useRef(null);

  function applyFormat(before, after) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { value: nextValue, selectionStart, selectionEnd } = wrapTextareaSelection(
      textarea,
      before,
      after,
    );
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  return (
    <div className={`format-editor ${className}`.trim()} style={style}>
      <div className="format-toolbar" role="toolbar" aria-label="Text formatting">
        <button
          type="button"
          className="format-btn"
          title="Bold"
          aria-label="Bold"
          onClick={() => applyFormat('**', '**')}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="format-btn"
          title="Italic"
          aria-label="Italic"
          onClick={() => applyFormat('*', '*')}
        >
          <em>I</em>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="textarea format-textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
