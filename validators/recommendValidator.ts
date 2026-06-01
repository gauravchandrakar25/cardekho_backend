import Joi from 'joi';

/**
 * Joi Validation Schema for the recommendCars POST API request body.
 * Enforces strict validation on budget tiers, family sizes, primary usages,
 * fuel options, body style shapes, and purchase priorities.
 */
export const recommendSchema = Joi.object({
  budget: Joi.string()
    .required()
    .valid(
      'Under 10 Lakhs',
      '10–15 Lakhs', // en-dash
      '10-15 Lakhs', // normal dash
      '15–20 Lakhs',
      '15-20 Lakhs',
      '20–30 Lakhs',
      '20-30 Lakhs',
      'Above 30 Lakhs'
    )
    .messages({
      'any.required': 'Budget is a required preference tier.',
      'any.only': 'Budget must be one of the verified pricing categories.'
    }),

  familySize: Joi.string()
    .required()
    .valid(
      '1–2', // en-dash
      '1-2', // normal dash
      '3–4',
      '3-4',
      '5+'
    )
    .messages({
      'any.required': 'Family size is a required passenger metric.',
      'any.only': 'Family size must be one of: 1-2, 3-4, or 5+.'
    }),

  primaryUsage: Joi.string()
    .required()
    .valid('City Driving', 'Highway Driving', 'Mixed')
    .messages({
      'any.required': 'Primary usage environment is required.',
      'any.only': 'Primary usage must be City Driving, Highway Driving, or Mixed.'
    }),

  fuelPreference: Joi.string()
    .required()
    .valid('Petrol', 'Diesel', 'CNG', 'EV', 'No Preference')
    .messages({
      'any.required': 'Fuel type preference is required.',
      'any.only': 'Fuel preference must be Petrol, Diesel, CNG, EV, or No Preference.'
    }),

  bodyType: Joi.string()
    .required()
    .valid('SUV', 'Sedan', 'Hatchback', 'MPV', 'No Preference')
    .messages({
      'any.required': 'Preferred body type styling is required.',
      'any.only': 'Body type styling must be SUV, Sedan, Hatchback, MPV, or No Preference.'
    }),

  topPriority: Joi.string()
    .required()
    .valid('Mileage', 'Comfort', 'Safety', 'Performance', 'Low Maintenance', 'Resale Value')
    .messages({
      'any.required': 'Top purchasing priority driver is required.',
      'any.only': 'Top priority must be Mileage, Comfort, Safety, Performance, Low Maintenance, or Resale Value.'
    })
});
