import { UUID } from "crypto";

export interface AirdropEvent {
    eventID: string;
    eventName: string;
    owner: string;
    prizes: Prize[];
    participants: string[];
    eligibleParticipants: string[];
    winners: Record<string, DrawnPrize>;
    eventStatus: EVENT_STATUS;
}

export interface Prize {
    quantity: number;
    availableQuantity: number;
    amount: number;
    symbol: string;
}

export interface DrawnPrize {
    amount: number;
    symbol: string;
}

export const enum EVENT_STATUS {
    OPEN = "Open",
    DRAWING = "Drawing",
    CLOSED = "Closed"
}