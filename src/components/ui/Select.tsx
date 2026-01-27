import { SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, helperText, options, placeholder, className = "", id, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-neutral-900 
            transition-all duration-200 appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20"}
            ${className}
          `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.75rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.25em 1.25em",
          paddingRight: "2.5rem",
        }}
        {...props}
      >
        {placeholder && (
          <option value="" selected>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = "Select";
