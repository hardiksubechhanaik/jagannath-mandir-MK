import { MANDIR_GOOGLE_EMBED } from '../data/mandirLocation';

export default function TempleMapEmbed({ className, title = 'Shree Jagannath Mandir, Maruti Kunj' }) {
  return (
    <iframe
      src={MANDIR_GOOGLE_EMBED}
      className={className}
      title={title}
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
