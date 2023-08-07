const joi = require("joi");

function validateUserId(req, res, next) {
  const schema = joi
    .object({
      id: joi.string().uuid(),
    })
    .required();
  const isValidResult = schema.validate(req.params);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }
  next();
}

function validateUser(req, res, next) {
  const schema = joi
    .object({
      id: joi.string().uuid(),
      type: joi.string().required(),
      email: joi.string().email().required(),
      phone: joi
        .string()
        .pattern(/^\+?3?8?(0\d{9})$/)
        .required(),
      name: joi.string().required(),
      city: joi.string(),
    })
    .required();
  const isValidResult = schema.validate(req.body);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }
  next();
}

function validateUserUpdate(req) {
  const schema = joi
    .object({
      email: joi.string().email(),
      phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/),
      name: joi.string(),
      city: joi.string(),
    })
    .required();

  return schema.validate(req.body);
}

function validateTransaction(req) {
  const schema = joi
    .object({
      userId: joi.string().uuid().required(),
      cardNumber: joi.string().required(),
      amount: joi.number().min(0).required(),
    })
    .required();

  return schema.validate(req.body);
}

function validateEvent(req) {
  const schema = joi
    .object({
      type: joi.string().required(),
      homeTeam: joi.string().required(),
      awayTeam: joi.string().required(),
      startAt: joi.date().required(),
      odds: joi
        .object({
          homeWin: joi.number().min(1.01).required(),
          awayWin: joi.number().min(1.01).required(),
          draw: joi.number().min(1.01).required(),
        })
        .required(),
    })
    .required();

  return schema.validate(req.body);
}

function validateEventResult(req) {
  const schema = joi
    .object({
      score: joi.string().required(),
    })
    .required();

  return schema.validate(req.body);
}

function validateBet(req) {
  const schema = joi
    .object({
      eventId: joi.string().uuid().required(),
      betAmount: joi.number().min(1).required(),
      prediction: joi.string().valid("w1", "w2", "x").required(),
    })
    .required();

  return schema.validate(req.body);
}

module.exports = {
  validateUserId,
  validateUser,
  validateUserUpdate,
  validateTransaction,
  validateEvent,
  validateBet,
  validateEventResult,
};
