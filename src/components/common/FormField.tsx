import React, { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

// Base field props
interface FieldBaseProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

// Input field props
interface InputFieldProps extends FieldBaseProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';
}

// Textarea field props
interface TextareaFieldProps extends FieldBaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  type: 'textarea';
}

// Select field props
interface SelectFieldProps extends FieldBaseProps {
  type: 'select';
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Checkbox field props
interface CheckboxFieldProps extends Omit<FieldBaseProps, 'required'>, InputHTMLAttributes<HTMLInputElement> {
  type: 'checkbox';
  checked?: boolean;
}

// Union type for all field types
type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps | CheckboxFieldProps;

const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, name, error, hint, required } = props;

  // Generate a unique ID for the input
  const id = `field-${name}`;

  // Common classes for all input types
  const baseInputClasses = `
    block w-full rounded-md shadow-sm 
    focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50
    disabled:bg-gray-100 disabled:cursor-not-allowed
  `;

  // Classes when there's an error
  const errorInputClasses = error
    ? 'border-error-300 text-error-900 placeholder-error-300'
    : 'border-gray-300 placeholder-gray-400';

  // Render different field types
  const renderField = () => {
    switch (props.type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            className={`${baseInputClasses} ${errorInputClasses} min-h-[100px]`}
            {...(props as TextareaFieldProps)}
          />
        );

      case 'select':
        const { options, value, onChange, placeholder, disabled } = props as SelectFieldProps;
        return (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseInputClasses} ${errorInputClasses}`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        const { checked, onChange: checkboxChange } = props as CheckboxFieldProps;
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={id}
              name={name}
              checked={checked}
              onChange={checkboxChange}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...(props as CheckboxFieldProps)}
            />
            <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
              {label}
            </label>
          </div>
        );

      default:
        // Default to text input
        return (
          <input
            id={id}
            name={name}
            className={`${baseInputClasses} ${errorInputClasses} h-10`}
            {...(props as InputFieldProps)}
          />
        );
    }
  };

  // Return checkbox layout for checkbox type
  if (props.type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderField()}
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }

  // Return standard layout for other field types
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
};

export default FormField;