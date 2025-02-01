"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutHandler = exports.loginHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ethers_1 = require("ethers"); // Import ethers for signature verification
const constants_1 = require("../config/constants"); // Import COOKIE_NAME
const AppError_1 = require("../errors/AppError");
const ErrorMessages_1 = require("../errors/ErrorMessages");
// Function to verify EIP-712 signature and timestamp validity
const verifySignature = (walletAddress, signature, timestamp) => {
    try {
        const TIMESTAMP_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
        // Define the EIP-712 domain and types
        const DOMAIN = {
            name: 'Avalanche Airdrop App',
            version: "1",
            chainId: 1,
        };
        const TYPES = {
            SignIn: [
                { name: "walletAddress", type: "address" },
                { name: "timestamp", type: "uint256" }
            ]
        };
        // Ensure the timestamp is recent
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - timestamp > TIMESTAMP_THRESHOLD) {
            return false;
        }
        const message = { walletAddress, timestamp };
        const recoveredAddress = ethers_1.ethers.verifyTypedData(DOMAIN, TYPES, message, signature);
        return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    }
    catch (error) {
        console.error("Signature verification error:", error);
        return false;
    }
};
exports.loginHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { timestamp, walletAddress, signature } = req.body;
    // Verify the EIP-712 signature
    if (!verifySignature(walletAddress, signature, timestamp)) {
        throw new AppError_1.AppError(401, ErrorMessages_1.ErrorMessages.INVALID_SIGNATURE);
    }
    // Create a new JWT token
    const newToken = jsonwebtoken_1.default.sign({ walletAddress }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie(constants_1.COOKIE_NAME, newToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.status(200).json({ message: "Login successful" });
});
exports.logoutHandler = (0, express_async_handler_1.default)(async (req, res) => {
    res.clearCookie(constants_1.COOKIE_NAME);
    res.status(200).json({ message: "Logout successful" });
});
//# sourceMappingURL=Auth.js.map