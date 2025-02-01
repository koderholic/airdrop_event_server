// Description: The service for the airdrop module.

import { EventDTO, EventStatus } from "./dto";
import { dynamoDB, TABLE_NAME } from "./database";
import * as model  from "./model";
const { v4: uuidv4 } = require('uuid');
import { AppError } from "./errors/AppError";
import {ErrorMessages} from "./errors/ErrorMessages"

export class AirdropService {

    static async create(airdropDTO: EventDTO, owner: string): Promise<string> {

        const exists = await AirdropService.checkEventExists(airdropDTO.eventName);
        if (exists) {
            throw new AppError(400, ErrorMessages.AIRDROP_EXISTS);
        }
       
        let airdropEvent = AirdropService.dtoToModel(airdropDTO);
        airdropEvent.owner = owner;
        
        await dynamoDB.put({TableName: TABLE_NAME, Item: airdropEvent}).promise();

        return airdropEvent.eventID;
    }

    static async drawOnePrize(eventID: string, user: string) {
        // Draw a prize
        let airdropEvent = await AirdropService.getAirdropEvent(eventID);
        if (user !== airdropEvent.owner) {
            throw new AppError(401, ErrorMessages.UNAUTHORIZED);
        }
        airdropEvent = AirdropService.drawPrize(airdropEvent, 1);

        // Update Airdrop in DB
        const updateParams = {
            TableName: TABLE_NAME,
            Key: { eventID },
            UpdateExpression: "set prizes = :prizes, winners = :winners, eventStatus = :status, eligibleParticipants = :eligibleParticipants",
            ExpressionAttributeValues: {
                ":prizes": airdropEvent.prizes,
                ":winners": airdropEvent.winners,
                ":status": airdropEvent.eventStatus,
                ":eligibleParticipants": airdropEvent.eligibleParticipants
            }
        };

        await dynamoDB.update(updateParams).promise();

    }

    static async drawAllPrizes(eventID: string, user: string) {

        // Draw a prize
        let airdropEvent = await AirdropService.getAirdropEvent(eventID);
        if (user !== airdropEvent.owner) {
            throw new AppError(401, ErrorMessages.UNAUTHORIZED);
        }
        airdropEvent = AirdropService.drawPrize(airdropEvent, airdropEvent.prizes.length);

        // Update Airdrop in DB
        const updateParams = {
            TableName: TABLE_NAME,
            Key: { eventID },
            UpdateExpression: "set prizes = :prizes, winners = :winners, eventStatus = :status, eligibleParticipants = :eligibleParticipants",
            ExpressionAttributeValues: {
                ":prizes": airdropEvent.prizes,
                ":winners": airdropEvent.winners,
                ":status": airdropEvent.eventStatus,
                ":eligibleParticipants": airdropEvent.eligibleParticipants
            }
        };

        await dynamoDB.update(updateParams).promise();
    }

    static async getStatus(eventID: string): Promise<EventStatus> {
        let airdropEvent = await AirdropService.getAirdropEvent(eventID);
        return { winners: airdropEvent.winners, status: airdropEvent.eventStatus };
    }

    private static dtoToModel(airdrop: EventDTO): model.AirdropEvent {
        const eventID = uuidv4();
        const { eventName, prizes, participants } = airdrop;

        let airdropEvent: model.AirdropEvent = {
            eventID: eventID.toString(),
            eventName,
            owner: "",  // Add this later
            participants,
            eligibleParticipants: participants,
            winners: {},
            eventStatus: model.EVENT_STATUS.OPEN,
            prizes: prizes.map(prize => ({
                quantity: prize.quantity,
                availableQuantity: prize.quantity,
                amount: prize.amount,
                symbol: prize.symbol
            }))
        };

        return airdropEvent;
    }

    private static drawPrize(airdropEvent: model.AirdropEvent, count: number): model.AirdropEvent {

        if (airdropEvent.eventStatus ===  model.EVENT_STATUS.CLOSED) {
            throw new AppError(400, ErrorMessages.AIRDROP_CLOSED);
        }

        if (count == 1) {
            // Get the draw prize
            const prizeIndex = airdropEvent.prizes.findIndex((prize: model.Prize) => prize.availableQuantity > 0);
            if (prizeIndex === -1) {
                airdropEvent.eventStatus = model.EVENT_STATUS.CLOSED;
                throw new AppError(400, "No more prizes available");
            }
            AirdropService.drawOne(airdropEvent, prizeIndex);
        } else {
            for (let i = 0; i < airdropEvent.prizes.length; i++) {
                AirdropService.drawOne(airdropEvent, i);
            }
        }
        // update the airdrop event status based on the remaining prizes
        if (airdropEvent.prizes.every((prize: model.Prize) => prize.availableQuantity === 0)) {
            airdropEvent.eventStatus = model.EVENT_STATUS.CLOSED;
        } else if(airdropEvent.eventStatus === model.EVENT_STATUS.OPEN) {
            airdropEvent.eventStatus = model.EVENT_STATUS.DRAWING;
        }

        return airdropEvent; 
    }

    private static drawOne(airdropEvent: model.AirdropEvent, prizeIndex: number): model.AirdropEvent {
        console.log("!!! prizeIndex >> ", prizeIndex, " !! airdropEvent >> ", airdropEvent);
        for (let i = airdropEvent.prizes[prizeIndex].availableQuantity; i > 0; i--) {
            // Get the draw prize
            airdropEvent.prizes[prizeIndex].availableQuantity -= 1;
            const drawnPrize = airdropEvent.prizes[prizeIndex];

            // Get a random winner for prize
            let eligibleParticipants = airdropEvent.eligibleParticipants;
            if (eligibleParticipants.length === 0 ) {
                throw new AppError(400, "No more eligible participants");
            }
            const randomWinnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const winner = eligibleParticipants[randomWinnerIndex];
            eligibleParticipants.splice(randomWinnerIndex, 1);

            // Update winner and prize
            airdropEvent.winners[winner] = { amount: drawnPrize.amount, symbol: drawnPrize.symbol };
            airdropEvent.eligibleParticipants = eligibleParticipants;

            console.log({Now: airdropEvent})
        }

        return airdropEvent;
    }

    private static async getAirdropEvent(eventID: string) : Promise<model.AirdropEvent> {

        const getParams = {
            TableName: TABLE_NAME,
            Key: { eventID },
        };

        const result = await dynamoDB.get(getParams).promise();
        if (!result.Item) {
            throw new AppError(404, ErrorMessages.AIRDROP_NOT_FOUND);
        }

        let airdropEvent = result.Item as model.AirdropEvent;

        return airdropEvent;
    }

    private static async checkEventExists(eventName: string): Promise<boolean> {
        const params = {
            TableName: TABLE_NAME,
            IndexName: "eventName-index",
            KeyConditionExpression: "eventName = :eventName",
            ExpressionAttributeValues: {
                ":eventName": eventName
            },
            ProjectionExpression: "eventID" 
        };
    
        const result = await dynamoDB.query(params).promise();
        if (!result || result.Items!.length == 0) {
            return false; 
        }
        console.log("!!! result >> ", result);
        return true;
       
    };

}