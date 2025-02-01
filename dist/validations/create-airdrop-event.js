"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirdropDTOSchema = exports.PrizeSchema = void 0;
const zod_1 = require("zod");
const ErrorMessages_1 = require("../errors/ErrorMessages");
exports.PrizeSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().positive().or(zod_1.z.literal(0)).refine(val => val > 0, {
        message: ErrorMessages_1.ErrorMessages.INVALID_QUANTITY,
    }),
    amount: zod_1.z.number().positive().refine(val => val > 0, {
        message: ErrorMessages_1.ErrorMessages.INVALID_AMOUNT,
    }),
    symbol: zod_1.z.string().min(1, {
        message: ErrorMessages_1.ErrorMessages.INVALID_SYMBOL,
    }),
});
exports.AirdropDTOSchema = zod_1.z.object({
    eventName: zod_1.z.string().min(3, {
        message: ErrorMessages_1.ErrorMessages.INVALID_NAME,
    }),
    prizes: zod_1.z.array(exports.PrizeSchema).min(1, {
        message: ErrorMessages_1.ErrorMessages.PRIZES_REQUIRED,
    }),
    participants: zod_1.z.array(zod_1.z.string().min(1, {
        message: ErrorMessages_1.ErrorMessages.INVALID_PARTICIPANT_ADDRESS,
    }).refine(val => /^0x[a-fA-F0-9]{40}$/.test(val), {
        message: ErrorMessages_1.ErrorMessages.INVALID_PARTICIPANT_ADDRESS,
    })).min(1, {
        message: ErrorMessages_1.ErrorMessages.PARTICIPANTS_REQUIRED,
    }),
}).refine(data => data.participants.length >= data.prizes.reduce((sum, prize) => sum + prize.quantity, 0), {
    message: ErrorMessages_1.ErrorMessages.NOT_ENOUGH_PARTICIPANTS,
});
//# sourceMappingURL=create-airdrop-event.js.map