import { INVALID } from "zod";

export enum ErrorMessages {
    AIRDROP_NOT_FOUND = "Airdrop not found",
    INVALID_INPUT = "Invalid input",
    SERVER_ERROR = "Internal Server Error",
    AIRDROP_CLOSED = "Airdrop is closed",
    AIRDROP_EXISTS = "Airdrop already exists",
    AIRDROP_DRAWN = "Airdrop is fully drawn",
    NOT_ENOUGH_PARTICIPANTS = "The number of participants must be greater than or equal to the total quantity of all prizes.",
    INVALID_SIGNATURE = "Invalid EIP-712 signature or expired timestamp",
    INVALID_JWT_TOKEN = "Invalid or expired auth token",
    MISSING_JWT_TOKEN = "Authentication Required",
    INVALID_QUANTITY = "Quantity must be a positive integer greater than zero.",
    INVALID_AMOUNT =  "Amount must be a positive number.",
    INVALID_SYMBOL = "Symbol must be at least 1 characters long.",
    INVALID_NAME = "Event name must be at least 3 characters long.",
    PRIZES_REQUIRED = "At least one prize is required.",
    INVALID_PARTICIPANT_ADDRESS = "Each participant must be a valid Ethereum address.",
    PARTICIPANTS_REQUIRED = "At least one participant is required.",
    UNAUTHORIZED = "Unauthorized",
}