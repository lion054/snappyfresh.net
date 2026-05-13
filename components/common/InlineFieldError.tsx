/**
 * Inline field validation error display.
 * Renders below form inputs to show field-specific errors.
 */
interface InlineFieldErrorProps {
  error?: string | null;
}

export default function InlineFieldError({ error }: InlineFieldErrorProps) {
  if (!error) return null;

  return (
    <span className="field-error-inline" role="alert" aria-live="polite">
      {error}
    </span>
  );
}
