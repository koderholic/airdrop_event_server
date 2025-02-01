"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../errors/AppError");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({ status: "error", message: err.message });
    }
    res.status(500).json({ status: "error", message: "Internal Server Error" });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map