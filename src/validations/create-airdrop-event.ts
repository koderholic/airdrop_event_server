import { z } from "zod";
import { ErrorMessages } from "../errors/ErrorMessages";

export const PrizeSchema = z.object({
  quantity: z.number().int().positive().or(z.literal(0)).refine(val => val > 0, {
    message: ErrorMessages.INVALID_QUANTITY,
  }),
  amount: z.number().positive().refine(val => val > 0, {
    message: ErrorMessages.INVALID_AMOUNT,
  }),
  symbol: z.string().min(1, {
    message: ErrorMessages.INVALID_SYMBOL,
  }),
});

export const AirdropDTOSchema = z.object({
  eventName: z.string().min(3, {
    message: ErrorMessages.INVALID_NAME,
  }),
  prizes: z.array(PrizeSchema).min(1, {
    message: ErrorMessages.PRIZES_REQUIRED,
  }),
  participants: z.array(z.string().min(1, {
    message: ErrorMessages.INVALID_PARTICIPANT_ADDRESS,
  }).refine(val => /^0x[a-fA-F0-9]{40}$/.test(val), {
    message: ErrorMessages.INVALID_PARTICIPANT_ADDRESS,
  })).min(1, {
    message: ErrorMessages.PARTICIPANTS_REQUIRED,
  }),
}).refine(data => data.participants.length >= data.prizes.reduce((sum, prize) => sum + prize.quantity, 0), {
  message: ErrorMessages.NOT_ENOUGH_PARTICIPANTS,
});

export type AirdropDTO = z.infer<typeof AirdropDTOSchema>;
