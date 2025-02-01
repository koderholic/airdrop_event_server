"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusHandler = exports.drawAllHandler = exports.drawOneHandler = exports.createAirdropHandler = void 0;
const dto_1 = require("../dto");
const AppError_1 = require("../errors/AppError");
const service_1 = require("../service");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ErrorMessages_1 = require("../errors/ErrorMessages");
exports.createAirdropHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { eventName, prizes, participants } = req.body;
    const eventId = await service_1.AirdropService.create({ eventName, prizes, participants }, req.user);
    res.status(200).json(new dto_1.AppResponse("Airdrop created", { eventId }));
});
exports.drawOneHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError_1.AppError(400, ErrorMessages_1.ErrorMessages.INVALID_INPUT);
    }
    await service_1.AirdropService.drawOnePrize(id, req.user);
    res.status(200).json(new dto_1.AppResponse("Prize drawn", {}));
});
exports.drawAllHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError_1.AppError(400, ErrorMessages_1.ErrorMessages.INVALID_INPUT);
    }
    await service_1.AirdropService.drawAllPrizes(id, req.user);
    res.status(200).json(new dto_1.AppResponse("Prize drawn", {}));
});
exports.getStatusHandler = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError_1.AppError(400, ErrorMessages_1.ErrorMessages.INVALID_INPUT);
    }
    const eventStatus = await service_1.AirdropService.getStatus(id);
    res.status(200).json(new dto_1.AppResponse("Status fetched!", { ...eventStatus }));
});
//# sourceMappingURL=Airdrop.js.map