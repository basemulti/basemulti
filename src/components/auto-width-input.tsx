import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export default forwardRef(function AutoWidthInput({ defaultValue, className, onBlur, autoSelect }: {
  onBlur: Function;
  defaultValue?: string;
  autoSelect?: boolean;
  className?: string;
}, ref) {
  const [value, setValue] = useState(defaultValue ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  useEffect(() => {
    inputRef?.current?.focus();
    if (autoSelect === true) {
      inputRef?.current?.select();
    }
  }, []);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      const displayValue = value.replace(/ $/, '\u00A0');
      spanRef.current.textContent = displayValue;
      inputRef.current.style.width = `${spanRef.current.offsetWidth}px`;
    }
  }, [value]);

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleBlur = (e: any) => {
    e.preventDefault();
    onBlur && onBlur(defaultValue, e.target.value);
  }

  return (
    <div className='relative'>
      <input
        className={className}
        ref={inputRef} 
        type="text" 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
      />
      <span ref={spanRef} className="absolute top-0 left-0 whitespace-nowrap invisible">
        {value}
      </span>
    </div>
  );
})
