import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken';
import { ethers } from "ethers"; // Import ethers for signature verification
import { COOKIE_NAME } from "../config/constants"; // Import COOKIE_NAME
import { AppError } from '../errors/AppError';
import { ErrorMessages } from '../errors/ErrorMessages';

// Function to verify EIP-712 signature and timestamp validity
const verifySignature = (walletAddress: string, signature: string, timestamp: number): boolean => {
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
        const recoveredAddress = ethers.verifyTypedData(DOMAIN, TYPES, message, signature);
        return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
        console.error("Signature verification error:", error);
        return false;
    }
};

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
    const { timestamp, walletAddress, signature } = req.body;

    // Verify the EIP-712 signature
    if (!verifySignature(walletAddress, signature, timestamp)) {
        throw new AppError(401, ErrorMessages.INVALID_SIGNATURE);
    }

    // Create a new JWT token
    const newToken = jwt.sign({ walletAddress }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
    res.cookie(COOKIE_NAME, newToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.status(200).json({ message: "Login successful" });
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ message: "Logout successful" });
});