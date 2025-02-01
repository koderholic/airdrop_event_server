"use strict";
// Description: The service for the airdrop module.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirdropService = void 0;
const database_1 = require("./database");
const { v4: uuidv4 } = require('uuid');
const AppError_1 = require("./errors/AppError");
const ErrorMessages_1 = require("./errors/ErrorMessages");
class AirdropService {
    static async create(airdropDTO, owner) {
        const exists = await AirdropService.checkEventExists(airdropDTO.eventName);
        if (exists) {
            throw new AppError_1.AppError(400, ErrorMessages_1.ErrorMessages.AIRDROP_EXISTS);
        }
        let airdropEvent = AirdropService.dtoToModel(airdropDTO);
        airdropEvent.owner = owner;
        await database_1.dynamoDB.put({ TableName: database_1.TABLE_NAME, Item: airdropEvent }).promise();
        return airdropEvent.eventID;
    }
    static async drawOnePrize(eventID, user) {
        // Draw a prize
        let airdropEvent = await AirdropService.getAirdropEvent(eventID);
        if (user !== airdropEvent.owner) {
            throw new AppError_1.AppError(401, ErrorMessages_1.ErrorMessages.UNAUTHORIZED);
        }
        airdropEvent = AirdropService.drawPrize(airdropEvent, 1);
        // Update Airdrop in DB
        const updateParams = {
            TableName: database_1.TABLE_NAME,
            Key: { eventID },
            UpdateExpression: "set prizes = :prizes, winners = :winners, eventStatus = :status, eligibleParticipants = :eligibleParticipants",
            ExpressionAttributeValues: {
                ":prizes": airdropEvent.prizes,
                ":winners": airdropEvent.winners,
                ":status": airdropEvent.eventStatus,
                ":eligibleParticipants": airdropEvent.eligibleParticipants
            }
        };
        await database_1.dynamoDB.update(updateParams).promise();
    }
    static async drawAllPrizes(eventID, user) {
        // Draw a prize
        let airdropEvent = await AirdropService.getAirdropEvent(eventID);
        if (user !== airdropEvent.owner) {
            throw new AppError_1.AppError(401, ErrorMessages_1.ErrorMessages.UNAUTHORIZED);
        }
        airdropEvent = AirdropService.drawPrize(airdropEvent, airdropEvent.prizes.length);
        // Update Airdrop in DB
        const updateParams = {
            TableName: database_1.TABLE_NAME,
            Key: { eventID },
            UpdateExpression: "set prizes = :prizes, winners = :winners, eventStatus = :status, eligibleParticipants = :eligibleParticipants",
            ExpressionAttributeValues: {
                ":prizes": airdropEvent.prizes,
                ":winners": airdropEvent.winners,
                ":status": airdropEvent.eventStatus,
                ":eligibleParticipants": airdropEvent.eligibleParticipants
            }
        };
        await database_1.dynamoDB.update(updateParams).promise();
    }
    static async getStatus(eventID) {
        let airdropEvent = await AirdropService.getAirdropEvent(eventID);
        return { winners: airdropEvent.winners, status: airdropEvent.eventStatus };
    }
    static dtoToModel(airdrop) {
        const eventID = uuidv4();
        const { eventName, prizes, participants } = airdrop;
        let airdropEvent = {
            eventID: eventID.toString(),
            eventName,
            owner: "", // Add this later
            participants,
            eligibleParticipants: participants,
            winners: {},
            eventStatus: "Open" /* model.EVENT_STATUS.OPEN */,
            prizes: prizes.map(prize => ({
                quantity: prize.quantity,
                availableQuantity: prize.quantity,
                amount: prize.amount,
                symbol: prize.symbol
            }))
        };
        return airdropEvent;
    }
    static drawPrize(airdropEvent, count) {
        if (airdropEvent.eventStatus === "Closed" /* model.EVENT_STATUS.CLOSED */) {
            throw new AppError_1.AppError(400, ErrorMessages_1.ErrorMessages.AIRDROP_CLOSED);
        }
        if (count == 1) {
            // Get the draw prize
            const prizeIndex = airdropEvent.prizes.findIndex((prize) => prize.availableQuantity > 0);
            if (prizeIndex === -1) {
                airdropEvent.eventStatus = "Closed" /* model.EVENT_STATUS.CLOSED */;
                throw new AppError_1.AppError(400, "No more prizes available");
            }
            AirdropService.drawOne(airdropEvent, prizeIndex);
        }
        else {
            for (let i = 0; i < airdropEvent.prizes.length; i++) {
                AirdropService.drawOne(airdropEvent, i);
            }
        }
        // update the airdrop event status based on the remaining prizes
        if (airdropEvent.prizes.every((prize) => prize.availableQuantity === 0)) {
            airdropEvent.eventStatus = "Closed" /* model.EVENT_STATUS.CLOSED */;
        }
        else if (airdropEvent.eventStatus === "Open" /* model.EVENT_STATUS.OPEN */) {
            airdropEvent.eventStatus = "Drawing" /* model.EVENT_STATUS.DRAWING */;
        }
        return airdropEvent;
    }
    static drawOne(airdropEvent, prizeIndex) {
        console.log("!!! prizeIndex >> ", prizeIndex, " !! airdropEvent >> ", airdropEvent);
        for (let i = airdropEvent.prizes[prizeIndex].availableQuantity; i > 0; i--) {
            // Get the draw prize
            airdropEvent.prizes[prizeIndex].availableQuantity -= 1;
            const drawnPrize = airdropEvent.prizes[prizeIndex];
            // Get a random winner for prize
            let eligibleParticipants = airdropEvent.eligibleParticipants;
            if (eligibleParticipants.length === 0) {
                throw new AppError_1.AppError(400, "No more eligible participants");
            }
            const randomWinnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const winner = eligibleParticipants[randomWinnerIndex];
            eligibleParticipants.splice(randomWinnerIndex, 1);
            // Update winner and prize
            airdropEvent.winners[winner] = { amount: drawnPrize.amount, symbol: drawnPrize.symbol };
            airdropEvent.eligibleParticipants = eligibleParticipants;
            console.log({ Now: airdropEvent });
        }
        return airdropEvent;
    }
    static async getAirdropEvent(eventID) {
        const getParams = {
            TableName: database_1.TABLE_NAME,
            Key: { eventID },
        };
        const result = await database_1.dynamoDB.get(getParams).promise();
        if (!result.Item) {
            throw new AppError_1.AppError(404, ErrorMessages_1.ErrorMessages.AIRDROP_NOT_FOUND);
        }
        let airdropEvent = result.Item;
        return airdropEvent;
    }
    static async checkEventExists(eventName) {
        const params = {
            TableName: database_1.TABLE_NAME,
            IndexName: "eventName-index",
            KeyConditionExpression: "eventName = :eventName",
            ExpressionAttributeValues: {
                ":eventName": eventName
            },
            ProjectionExpression: "eventID"
        };
        const result = await database_1.dynamoDB.query(params).promise();
        if (!result || result.Items.length == 0) {
            return false;
        }
        console.log("!!! result >> ", result);
        return true;
    }
    ;
}
exports.AirdropService = AirdropService;
//# sourceMappingURL=service.js.map