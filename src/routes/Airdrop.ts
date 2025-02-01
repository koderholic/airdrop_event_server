import express from 'express';
import { createAirdropHandler, drawOneHandler, drawAllHandler, getStatusHandler } from '../controllers/Airdrop';
import { authMiddleware } from "../middleware/authMiddleware";
import { AirdropDTOSchema } from "../validations/create-airdrop-event";
import { validate } from "../middleware/validate";

const router = express.Router();
  
router.post('/create', authMiddleware, validate(AirdropDTOSchema), createAirdropHandler);
router.post('/:id/drawOne', authMiddleware, drawOneHandler);
router.post('/:id/drawAll', authMiddleware, drawAllHandler);
router.get('/:id/status', getStatusHandler);


export default router;