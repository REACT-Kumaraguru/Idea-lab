import { Validator } from "../middleware/validate.middleware.js";

export const loginSchema = new Validator({
  email: {
    type: "email",
    required: true,
    message: "A valid email address is required.",
  },
  password: {
    type: "string",
    required: true,
    minLength: 6,
    message: "Password must be at least 6 characters.",
  },
});

export const registerSchema = new Validator({
  email: {
    type: "email",
    required: true,
    message: "A valid email address is required.",
  },
  password: {
    type: "string",
    required: true,
    minLength: 6,
    message: "Password must be at least 6 characters.",
  },
  fullName: {
    type: "string",
    required: false,
    minLength: 2,
    message: "Full name must be at least 2 characters.",
  },
  phoneNumber: {
    type: "string",
    required: false,
    minLength: 10,
    maxLength: 15,
    message: "Please enter a valid phone number.",
  },
});

export const otpRequestSchema = new Validator({
  email: {
    type: "email",
    required: true,
    message: "A valid email address is required to send OTP.",
  },
});

export const otpVerifySchema = new Validator({
  email: {
    type: "email",
    required: true,
    message: "Email is required.",
  },
  otp: {
    type: "string",
    required: true,
    minLength: 4,
    maxLength: 8,
    message: "Please enter a valid verification code.",
  },
});
