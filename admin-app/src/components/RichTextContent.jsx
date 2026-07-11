import { formatRichText } from '../lib/richText.js';

export default function RichTextContent({ text, className = '' }) {
  if (!text) return null;
  return (
    <div
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: formatRichText(text) }}
    />
  );
}
