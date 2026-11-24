import { useId } from 'react';
import type { ReactNode } from 'react';

type FieldControlProps = {
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  id: string;
  name?: string;
  required?: boolean;
};

type FormFieldProps = {
  children: (controlProps: FieldControlProps) => ReactNode;
  error?: string;
  hint?: string;
  id?: string;
  label: string;
  name?: string;
  required?: boolean;
};

function FormField({
  children,
  error,
  hint,
  id,
  label,
  name,
  required = false,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const hintId = hint === undefined ? undefined : `${fieldId}-hint`;
  const errorId = error === undefined ? undefined : `${fieldId}-error`;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="qf-field">
      <label className="qf-field__label" htmlFor={fieldId}>
        <span>{label}</span>
        {required ? <span aria-hidden="true">*</span> : null}
      </label>
      {children({
        'aria-describedby': describedBy,
        'aria-invalid': error === undefined ? undefined : true,
        id: fieldId,
        name,
        required,
      })}
      {hint === undefined ? null : (
        <p className="qf-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error === undefined ? null : (
        <p className="qf-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export type { FieldControlProps, FormFieldProps };
export default FormField;
