
import { Request, Response } from 'express';
import { AppResponse } from '../dto';
import {AppError} from '../errors/AppError'
import { AirdropService } from '../service';
import asyncHandler from "express-async-handler";
import { ErrorMessages } from '../errors/ErrorMessages';


export const createAirdropHandler = asyncHandler(async (req: Request, res: Response) => {
        const { eventName, prizes, participants } = req.body;
        const eventId = await AirdropService.create({ eventName, prizes, participants }, (req as any).user);
        
        res.status(200).json(new AppResponse("Airdrop created", {eventId}));
});

export const drawOneHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError(400, ErrorMessages.INVALID_INPUT);
    }
    await AirdropService.drawOnePrize(id, (req as any).user);
    res.status(200).json(new AppResponse("Prize drawn", {}));
});

export const drawAllHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError(400, ErrorMessages.INVALID_INPUT);
    }
    await AirdropService.drawAllPrizes(id, (req as any).user);
    res.status(200).json(new AppResponse("Prize drawn", {}));
});

export const getStatusHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError(400, ErrorMessages.INVALID_INPUT);
    }
    const eventStatus = await AirdropService.getStatus(id);
    res.status(200).json(new AppResponse("Status fetched!", {...eventStatus}));
});