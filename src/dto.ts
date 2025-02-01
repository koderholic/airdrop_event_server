import { EVENT_STATUS, DrawnPrize } from "./model";

export interface EventDTO {
    eventName: string;
    prizes: Prize[];
    participants: string[];
}

export interface Prize {
    quantity: number;
    amount: number;
    symbol: string;
}

export interface EventStatus {
    winners: Record<string, DrawnPrize>;
    status: EVENT_STATUS;
}

export class AppResponse {
    public status: string;
    public message: string;
    public data: any;
  
    constructor(message: string, data: any) {
      this.status = "success";
      this.message = message;  
      this.data = data;   
    }
  }