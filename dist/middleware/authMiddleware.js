"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../config/constants");
const ErrorMessages_1 = require("../errors/ErrorMessages");
const AppError_1 = require("../errors/AppError");
const authMiddleware = (req, res, next) => {
    let walletAddress = null;
    // Step 1: Check for JWT in cookies
    const token = req.cookies[constants_1.COOKIE_NAME];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            walletAddress = decoded.walletAddress;
        }
        catch (err) {
            throw new AppError_1.AppError(401, ErrorMessages_1.ErrorMessages.INVALID_JWT_TOKEN);
        }
    }
    // Step 2: If no valid cookie, reject request
    if (!walletAddress) {
        throw new AppError_1.AppError(401, ErrorMessages_1.ErrorMessages.MISSING_JWT_TOKEN);
    }
    // Attach walletAddress to request for use in routes
    req.user = walletAddress;
    next();
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map