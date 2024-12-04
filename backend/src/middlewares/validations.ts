import { celebrate, Joi, Segments } from 'celebrate';

const orderSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  payment: Joi.string().required().valid('card', 'online'),
  total: Joi.number().required(),
  items: Joi.array().min(1).required(),
});

const productSchema = Joi.object({
  title: Joi.string().required().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(30),
  name: Joi.string(),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: orderSchema,
});

export const validateProductCreateBody = celebrate({
  [Segments.BODY]: productSchema,
});

export const validateUserBody = celebrate({
  [Segments.BODY]: userSchema,
});
