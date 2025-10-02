import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import './FormSelect.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  required,
  multiple = false,
  searchable = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : [value];
  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const displayValue = selectedOptions.length > 0
    ? selectedOptions.map((opt) => opt.label).join(', ')
    : placeholder;

  const containerClasses = [
    'armora-form-select__wrapper',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const selectClasses = [
    'armora-form-select',
    error && 'armora-form-select--error',
    isOpen && 'armora-form-select--open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      {label && (
        <label className="armora-form-select__label">
          {label}
          {required && <span className="armora-form-select__required">*</span>}
        </label>
      )}
      <div className={selectClasses}>
        <button
          type="button"
          className="armora-form-select__trigger"
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`armora-form-select__value ${!selectedOptions.length ? 'armora-form-select__value--placeholder' : ''}`}>
            {displayValue}
          </span>
          <FaChevronDown className="armora-form-select__icon" />
        </button>
        {isOpen && (
          <div className="armora-form-select__dropdown" role="listbox">
            {searchable && (
              <div className="armora-form-select__search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="armora-form-select__search-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="armora-form-select__options">
              {filteredOptions.length === 0 ? (
                <div className="armora-form-select__no-options">No options found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`armora-form-select__option ${isSelected ? 'armora-form-select__option--selected' : ''}`}
                      onClick={() => handleSelect(option.value)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {option.label}
                      {multiple && isSelected && <FaCheck className="armora-form-select__check" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="armora-form-select__error">{error}</p>}
    </div>
  );
};
