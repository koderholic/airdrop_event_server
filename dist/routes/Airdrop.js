"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Airdrop_1 = require("../controllers/Airdrop");
const authMiddleware_1 = require("../middleware/authMiddleware");
const create_airdrop_event_1 = require("../validations/create-airdrop-event");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
router.post('/create', authMiddleware_1.authMiddleware, (0, validate_1.validate)(create_airdrop_event_1.AirdropDTOSchema), Airdrop_1.createAirdropHandler);
router.post('/:id/drawOne', authMiddleware_1.authMiddleware, Airdrop_1.drawOneHandler);
router.post('/:id/drawAll', authMiddleware_1.authMiddleware, Airdrop_1.drawAllHandler);
router.get('/:id/status', Airdrop_1.getStatusHandler);
exports.default = router;
//# sourceMappingURL=Airdrop.js.map