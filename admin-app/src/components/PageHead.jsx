/* Small shared header for each page: eyebrow + title (+ optional right slot). */
export default function PageHead({ eyebrow, title, right }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
      </div>
      {right}
    </div>
  );
}
