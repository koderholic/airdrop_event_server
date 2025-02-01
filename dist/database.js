"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_NAME = exports.dynamoDB = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamodb_1 = require("aws-sdk/clients/dynamodb");
require('dotenv').config();
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
exports.dynamoDB = new dynamodb_1.DocumentClient();
exports.TABLE_NAME = process.env.DYNAMO_TABLE || "AirdropEvents";
//# sourceMappingURL=database.js.map