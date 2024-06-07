import Joi from 'joi';

const create = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
    password_confirmation: Joi.any().equal(Joi.ref('password')).required(),
});

const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
});

export default { create, login };
