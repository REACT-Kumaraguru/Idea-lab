/**
 * Lightweight, zero-dependency schema validation engine.
 * Validates request body, query, or params and formats consistent 400 Bad Request responses.
 */

export class Validator {
  constructor(rules) {
    this.rules = rules;
  }

  safeParse(data = {}) {
    const errors = [];
    const cleaned = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];

      if (rule.required && (value === undefined || value === null || String(value).trim() === "")) {
        errors.push({ field, message: rule.message || `${field} is required` });
        continue;
      }

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        if (rule.type === "string" && typeof value !== "string") {
          errors.push({ field, message: `${field} must be a string` });
          continue;
        }

        if (rule.type === "number" && isNaN(Number(value))) {
          errors.push({ field, message: `${field} must be a number` });
          continue;
        }

        if (rule.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value).trim())) {
            errors.push({ field, message: `Please provide a valid email address` });
            continue;
          }
        }

        if (rule.minLength && String(value).length < rule.minLength) {
          errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` });
          continue;
        }

        if (rule.maxLength && String(value).length > rule.maxLength) {
          errors.push({ field, message: `${field} cannot exceed ${rule.maxLength} characters` });
          continue;
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push({ field, message: `${field} must be one of: ${rule.enum.join(", ")}` });
          continue;
        }
      }

      cleaned[field] = value;
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: errors[0].message,
          issues: errors,
        },
      };
    }

    return {
      success: true,
      data: cleaned,
    };
  }
}

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const dataToValidate = req[source] || {};
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: result.error?.message || "Invalid request payload",
        errors: result.error?.issues || [],
      });
    }

    req[source] = { ...req[source], ...result.data };
    next();
  };
}
