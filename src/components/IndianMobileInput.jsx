import { sanitizeIndianMobileInput } from '../lib/indianMobile';

export default function IndianMobileInput({
  id,
  name,
  value,
  onChange,
  className = '',
  hasError = false,
  errorClassName = '',
  required = false,
  placeholder,
  autoComplete = 'tel',
  disabled = false,
  'aria-label': ariaLabel,
}) {
  function handleChange(event) {
    const sanitized = sanitizeIndianMobileInput(event.target.value);
    onChange({
      ...event,
      target: {
        ...event.target,
        name: name ?? event.target.name,
        value: sanitized,
      },
    });
  }

  const classes = [className, hasError && errorClassName].filter(Boolean).join(' ');

  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="numeric"
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={classes}
      maxLength={10}
      pattern="[5-9][0-9]{9}"
      aria-label={ariaLabel}
      aria-invalid={hasError || undefined}
      required={required}
      disabled={disabled}
    />
  );
}
