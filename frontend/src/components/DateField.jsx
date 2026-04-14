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
  containerStyle,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  shellClassName = '',
  buttonClassName = '',
  buttonMode = 'full',
  buttonAriaLabel
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
    <div className={containerClassName} style={containerStyle}>
      <label className={`input-label ${labelClassName}`.trim()}>{label}</label>
      <div className={`date-input-shell ${shellClassName}`.trim()}>
        <input
          ref={inputRef}
          type="date"
          className={`input-field date-input-field ${inputClassName}`.trim()}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          max={max}
          min={min}
        />
        <button
          type="button"
          className={`date-picker-btn ${buttonMode === 'icon' ? 'date-picker-btn-icon' : ''} ${buttonClassName}`.trim()}
          onClick={handleOpenPicker}
          disabled={disabled}
          aria-label={buttonAriaLabel || `Abrir calendário para ${label}`}
        >
          <CalendarDays size={16} />
          {buttonMode !== 'icon' ? <span>Abrir calendário</span> : null}
        </button>
      </div>
      {helperText ? <div className="date-input-helper">{helperText}</div> : null}
    </div>
  );
}
