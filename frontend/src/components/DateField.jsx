import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';

export function DateField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  max,
  min,
  helperText,
  containerStyle
}) {
  const inputRef = useRef(null);

  const handleOpenPicker = () => {
    if (disabled || !inputRef.current) {
      return;
    }

    if (typeof inputRef.current.showPicker === 'function') {
      inputRef.current.showPicker();
      return;
    }

    inputRef.current.focus();
  };

  return (
    <div style={containerStyle}>
      <label className="input-label">{label}</label>
      <div className="date-input-shell">
        <input
          ref={inputRef}
          type="date"
          className="input-field date-input-field"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          max={max}
          min={min}
        />
        <button
          type="button"
          className="date-picker-btn"
          onClick={handleOpenPicker}
          disabled={disabled}
          aria-label={`Abrir calendário para ${label}`}
        >
          <CalendarDays size={16} />
          <span>Abrir calendário</span>
        </button>
      </div>
      {helperText ? <div className="date-input-helper">{helperText}</div> : null}
    </div>
  );
}
