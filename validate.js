const { body, checkBody } = require('express-validator')
const { validationResult } = require('express-validator');



const buildValidation = (method) => {
    switch (method) {
        case 'deliveries': {
            return [
                body('*.restaurantLocation.lat', 'Value has to be between -90 and 90').exists().isFloat({ min: -90, max: 90 }),
                body('*.restaurantLocation.lng', 'Value has to be between -180 and 180').exists().isFloat({ min: -180, max: 180 }),
                body('*.customerLocation.lat', 'Value has to be between -90 and 90').exists().isFloat({ min: -90, max: 90 }),
                body('*.customerLocation.lng', 'Value has to be between -180 and 180').exists().isFloat({ min: -180, max: 180 }),
                body('*.cookingTime', 'Value has to be between 0 and 300 minutes').exists().isFloat({ min: 0, max: 300 }),
                body('', 'Need to have between 2 and 100 orders').isArray({ min: 2, max: 100 }),
            ]
        }
    }
}


module.exports.validate = (method) => {
    const checkForValidationErrors = (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const result = errors.array();

                const error = result[0];
                return res.status(400).send(error);

            }
            return next();
        } catch (error) {
            return next(error);
        }
    };

    return buildValidation(method).concat(checkForValidationErrors);
};