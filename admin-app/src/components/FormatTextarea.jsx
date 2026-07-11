import { useLayoutEffect, useRef } from 'react';
import { formatRichText, htmlToRichText } from '../lib/richText.js';

export default function FormatTextarea({
  value,
  onChange,
  rows = 6,
  placeholder,
  className = '',
  style,
}) {
  const editorRef = useRef(null);
  const skipExternalSync = useRef(false);

  const minHeight = `${Math.max(rows * 26, 120)}px`;

  function syncFromEditor() {
    const editor = editorRef.current;
    if (!editor) return;
    skipExternalSync.current = true;
    onChange(htmlToRichText(editor.innerHTML));
  }

  function applyFormat(command) {
    const editor = editorRef.current;
    if (!editor) return;

    const scrollTop = editor.scrollTop;
    editor.focus();
    document.execCommand(command, false);
    syncFromEditor();

    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.scrollTop = scrollTop;
      }
    });
  }

  useLayoutEffect(() => {
    if (skipExternalSync.current) {
      skipExternalSync.current = false;
      return;
    }

    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;

    const scrollTop = editor.scrollTop;
    editor.innerHTML = value ? formatRichText(value) : '';
    editor.scrollTop = scrollTop;
  }, [value]);

  return (
    <div className={`format-editor ${className}`.trim()} style={style}>
      <div className="format-toolbar" role="toolbar" aria-label="Text formatting">
        <button
          type="button"
          className="format-btn"
          title="Bold"
          aria-label="Bold"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat('bold')}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="format-btn"
          title="Italic"
          aria-label="Italic"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyFormat('italic')}
        >
          <em>I</em>
        </button>
      </div>
      <div
        ref={editorRef}
        className="textarea format-textarea format-editor-surface rich-text"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={syncFromEditor}
        onPaste={() => requestAnimationFrame(syncFromEditor)}
      />
    </div>
  );
}
