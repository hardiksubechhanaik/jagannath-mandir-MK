import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrollNavigate } from '../lib/scrollNavigate';

const ScrollLink = forwardRef(function ScrollLink({ to, onClick, ...props }, ref) {
  const navigate = useNavigate();
  const href = typeof to === 'string' ? to : to?.pathname ?? '/';

  return (
    <a
      ref={ref}
      href={href}
      {...props}
      onClick={(event) => {
        scrollNavigate(navigate, to, event);
        onClick?.(event);
      }}
    />
  );
});

export default ScrollLink;
