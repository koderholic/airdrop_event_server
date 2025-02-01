"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Airdrop_1 = __importDefault(require("./routes/Airdrop"));
const Auth_1 = __importDefault(require("./routes/Auth"));
const errorHandler_1 = require("./middleware/errorHandler");
require('dotenv').config();
const server = (0, express_1.default)();
const allowedOrigins = [
    process.env.FRONTEND_URL
];
server.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
server.use((0, morgan_1.default)('dev'));
server.use((0, helmet_1.default)());
server.use(express_1.default.json());
server.use((0, cookie_parser_1.default)());
server.use('/airdrop', Airdrop_1.default);
server.use('/auth', Auth_1.default);
server.use(errorHandler_1.errorHandler);
const options = {
    key: fs_1.default.readFileSync('key.pem'),
    cert: fs_1.default.readFileSync('cert.pem')
};
const port = process.env.PORT || 5000;
https_1.default.createServer(options, server).listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
});
exports.default = server;
//# sourceMappingURL=server.js.map