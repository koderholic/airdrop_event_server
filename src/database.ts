import AWS from "aws-sdk";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const dynamoDB = new DocumentClient();

export const TABLE_NAME = process.env.DYNAMO_TABLE || "AirdropEvents";