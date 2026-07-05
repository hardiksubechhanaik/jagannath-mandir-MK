import { MANDIR_LOGO } from '../data/mandirLogo';

export default function TempleLogo({ className, size = 46, alt = '', ...rest }) {
  return (
    <img
      src={MANDIR_LOGO}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
      {...rest}
    />
  );
}
