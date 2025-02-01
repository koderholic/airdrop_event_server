"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const ErrorMessages_1 = require("../errors/ErrorMessages");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({ errors: error.errors.map(err => err.message) });
        }
        return res.status(500).json({ error: ErrorMessages_1.ErrorMessages.SERVER_ERROR });
    }
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map