import { useState, useEffect, useRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  autoResize = false,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [props.value, autoResize]);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={textareaId}
        className={`
          w-full rounded-lg border bg-white px-4 py-2.5 text-neutral-900 
          placeholder:text-neutral-400 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[100px]
          disabled:bg-neutral-100 disabled:cursor-not-allowed resize-y
          ${
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
