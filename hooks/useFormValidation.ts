import { useState, useCallback, useRef } from 'react';

/**
 * Hook for Zod-based inline form validation.
 * Provides field-level validation on blur and full-form validation on submit.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {Object} [options]
 * @param {() => Object} [options.getFormData] - Function returning current form data (needed for cross-field refinements like password match)
 */
export function useFormValidation(schema: any, options: any = {}) {
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const touchedRef = useRef<any>({});

  const clearFieldError = useCallback((fieldName: any) => {
    setFieldErrors((prev: any) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    touchedRef.current = {};
  }, []);

  /**
   * Validate a single field. For schemas with .refine() (cross-field checks),
   * uses getFormData() to validate the full object and extract the specific field error.
   */
  const validateField = useCallback((fieldName: any, value: any) => {
    touchedRef.current[fieldName] = true;

    // For schemas with refinements, validate the full form data
    if (options.getFormData) {
      const formData = options.getFormData();
      const data = { ...formData, [fieldName]: value };
      const result = schema.safeParse(data);

      if (result.success) {
        clearFieldError(fieldName);
        return true;
      }

      const issues = result.error.issues || result.error.errors || [];
      const fieldError = issues.find(
        (e: any) => e.path[0] === fieldName
      );

      if (fieldError) {
        setFieldErrors((prev: any) => ({ ...prev, [fieldName]: fieldError.message }));
        return false;
      }

      clearFieldError(fieldName);
      return true;
    }

    // For simple schemas, try to validate just the field
    try {
      // Try picking just this field from the schema
      const partial = schema._def?.typeName === 'ZodObject'
        ? schema.shape?.[fieldName]
        : null;

      if (partial) {
        const result = partial.safeParse(value);
        if (result.success) {
          clearFieldError(fieldName);
          return true;
        }
        setFieldErrors((prev: any) => ({
          ...prev,
          [fieldName]: (result.error.issues || result.error.errors)?.[0]?.message || 'Invalid value',
        }));
        return false;
      }
    } catch {
      // Fallback: full validation
    }

    clearFieldError(fieldName);
    return true;
  }, [schema, options, clearFieldError]);

  /**
   * Validate all fields. Returns { success, data, errors }.
   */
  const validateAll = useCallback((data: any) => {
    const result = schema.safeParse(data);

    if (result.success) {
      setFieldErrors({});
      return { success: true, data: result.data };
    }

    const allIssues = result.error.issues || result.error.errors || [];
    const errors: any = {};
    for (const err of allIssues) {
      const field = err.path[0];
      if (field && !errors[field]) {
        errors[field] = err.message;
      }
    }

    setFieldErrors(errors);
    return {
      success: false,
      errors: allIssues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }, [schema]);

  /**
   * Convenience: returns props to spread on a field's container.
   */
  const getFieldProps = useCallback((fieldName: any, currentValue: any) => ({
    onBlur: () => validateField(fieldName, currentValue),
    error: fieldErrors[fieldName] || '',
    hasError: !!fieldErrors[fieldName],
    isTouched: !!touchedRef.current[fieldName],
  }), [fieldErrors, validateField]);

  return {
    fieldErrors,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
    getFieldProps,
  };
}
