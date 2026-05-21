const validateData = (data, schema) => {
  const errors = [];
  const validatedData = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (rules.type) {
      switch (rules.type) {
        case 'varchar':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          } else if (rules.length && value.length > rules.length) {
            errors.push(`${field} must be at most ${rules.length} characters`);
          }
          break;
        case 'text':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          }
          break;
        case 'uuid':
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (typeof value !== 'string' || !uuidRegex.test(value)) {
            errors.push(`${field} must be a valid UUID`);
          }
          break;
        case 'timestamp':
          if (!(value instanceof Date) && isNaN(Date.parse(value))) {
            errors.push(`${field} must be a valid date`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field} must be a boolean`);
          }
          break;
        case 'integer':
          if (!Number.isInteger(Number(value))) {
            errors.push(`${field} must be an integer`);
          }
          break;
        case 'jsonb':
          // JSON validation - accept objects and arrays
          if (typeof value !== 'object') {
            errors.push(`${field} must be a valid JSON object or array`);
          }
          break;
      }
    }

    // If validation passed, add to validated data
    if (!errors.length || errors[errors.length - 1] !== `${field} is required`) {
      validatedData[field] = value;
    }
  }

  return { isValid: errors.length === 0, errors, data: validatedData };
};

module.exports = { validateData };