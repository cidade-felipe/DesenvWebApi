import { useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const formatIsoDateToDisplay = (value) => {
  if (!isoDatePattern.test(String(value || ''))) {
    return '';
  }

  const [year, month, day] = String(value).split('-');
  return `${day}/${month}/${year}`;
};

const formatDateDigitsToDisplay = (value) => {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 8);

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join('/');
};

const parseDisplayDateToIso = (value) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value ?? '').trim());
  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);

  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    return null;
  }

  return `${yearValue}-${monthValue}-${dayValue}`;
};

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
  buttonAriaLabel,
  allowManualInput = false,
  placeholder = 'dd/mm/aaaa'
}) {
  const inputRef = useRef(null);
  const pickerInputRef = useRef(null);
  const [manualValue, setManualValue] = useState('');
  const [isManualEditing, setIsManualEditing] = useState(false);
  const displayManualValue = isManualEditing
    ? manualValue
    : formatIsoDateToDisplay(value);

  const emitChange = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue
      }
    });
  };

  const handleOpenPicker = () => {
    const pickerTarget = allowManualInput ? pickerInputRef.current : inputRef.current;

    if (disabled || !pickerTarget) {
      return;
    }

    if (typeof pickerTarget.showPicker === 'function') {
      pickerTarget.showPicker();
      return;
    }

    pickerTarget.focus();
  };

  const handleNativeChange = (event) => {
    if (allowManualInput) {
      setManualValue(formatIsoDateToDisplay(event.target.value));
      setIsManualEditing(false);
    }

    onChange?.(event);
  };

  const handleManualFocus = () => {
    setManualValue(formatIsoDateToDisplay(value));
    setIsManualEditing(true);
  };

  const handleManualChange = (event) => {
    const formattedValue = formatDateDigitsToDisplay(event.target.value);
    setManualValue(formattedValue);

    if (!formattedValue) {
      emitChange('');
      return;
    }

    const isoValue = parseDisplayDateToIso(formattedValue);
    if (isoValue) {
      emitChange(isoValue);
      return;
    }

    emitChange('');
  };

  const handleManualBlur = () => {
    if (!manualValue.trim()) {
      emitChange('');
      setIsManualEditing(false);
      return;
    }

    const isoValue = parseDisplayDateToIso(manualValue);
    if (!isoValue) {
      emitChange('');
      setIsManualEditing(false);
      return;
    }

    setManualValue(formatIsoDateToDisplay(isoValue));
    setIsManualEditing(false);
    emitChange(isoValue);
  };

  return (
    <div className={containerClassName} style={containerStyle}>
      <label className={`input-label ${labelClassName}`.trim()}>{label}</label>
      <div className={`date-input-shell ${shellClassName}`.trim()}>
        {allowManualInput ? (
          <>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              className={`input-field date-input-field date-input-field-compact ${inputClassName}`.trim()}
              value={displayManualValue}
              onFocus={handleManualFocus}
              onChange={handleManualChange}
              onBlur={handleManualBlur}
              required={required}
              disabled={disabled}
              placeholder={placeholder}
            />
            <input
              ref={pickerInputRef}
              type="date"
              className="date-picker-native-input"
              value={value}
              onChange={handleNativeChange}
              disabled={disabled}
              max={max}
              min={min}
              tabIndex={-1}
              aria-hidden="true"
            />
          </>
        ) : (
          <input
            ref={inputRef}
            type="date"
            className={`input-field date-input-field ${buttonMode === 'icon' ? 'date-input-field-compact' : ''} ${inputClassName}`.trim()}
            value={value}
            onChange={handleNativeChange}
            required={required}
            disabled={disabled}
            max={max}
            min={min}
          />
        )}
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
