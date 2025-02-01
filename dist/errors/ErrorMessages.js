"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = void 0;
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["AIRDROP_NOT_FOUND"] = "Airdrop not found";
    ErrorMessages["INVALID_INPUT"] = "Invalid input";
    ErrorMessages["SERVER_ERROR"] = "Internal Server Error";
    ErrorMessages["AIRDROP_CLOSED"] = "Airdrop is closed";
    ErrorMessages["AIRDROP_EXISTS"] = "Airdrop already exists";
    ErrorMessages["AIRDROP_DRAWN"] = "Airdrop is fully drawn";
    ErrorMessages["NOT_ENOUGH_PARTICIPANTS"] = "The number of participants must be greater than or equal to the total quantity of all prizes.";
    ErrorMessages["INVALID_SIGNATURE"] = "Invalid EIP-712 signature or expired timestamp";
    ErrorMessages["INVALID_JWT_TOKEN"] = "Invalid or expired auth token";
    ErrorMessages["MISSING_JWT_TOKEN"] = "Authentication Required";
    ErrorMessages["INVALID_QUANTITY"] = "Quantity must be a positive integer greater than zero.";
    ErrorMessages["INVALID_AMOUNT"] = "Amount must be a positive number.";
    ErrorMessages["INVALID_SYMBOL"] = "Symbol must be at least 1 characters long.";
    ErrorMessages["INVALID_NAME"] = "Event name must be at least 3 characters long.";
    ErrorMessages["PRIZES_REQUIRED"] = "At least one prize is required.";
    ErrorMessages["INVALID_PARTICIPANT_ADDRESS"] = "Each participant must be a valid Ethereum address.";
    ErrorMessages["PARTICIPANTS_REQUIRED"] = "At least one participant is required.";
    ErrorMessages["UNAUTHORIZED"] = "Unauthorized";
})(ErrorMessages || (exports.ErrorMessages = ErrorMessages = {}));
//# sourceMappingURL=ErrorMessages.js.map