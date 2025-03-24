import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  validateRequest
];

export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula'),
  body('role')
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('El rol debe ser admin, manager o employee'),
  validateRequest
]; 