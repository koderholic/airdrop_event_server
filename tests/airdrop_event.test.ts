import request from "supertest";
import server from "../src/server"; // Your Express server entry point
import jwt from "jsonwebtoken"; // Import jsonwebtoken to create a valid token
import { ethers } from "ethers";
import { awsSdkPromiseResponse, awsSdkScanPromiseResponse } from "../__mocks__/aws-sdk/clients/dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from '../__mocks__/aws-sdk/clients/dynamodb';
import { TABLE_NAME } from "../src/database";

let authToken: string;
const db = new DocumentClient();


describe("Auth API Tests (Mocked DB)", () => {
    it.skip("should login successfully", async () => {
        const response = await request(server)
            .post("/auth/login")
            .send({
                timestamp: Date.now(),
                walletAddress: "0x1111111111111111111111111111111111111111",
                signature: "mocked_signature", // Ensure this is a valid signature for testing
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        authToken = response.headers['set-cookie'][0]; // Store the auth token from the response
        console.log("Auth Token:", authToken); // Log the auth token for debugging
    });

    it.skip("should logout successfully", async () => {
        const response = await request(server)
            .post("/auth/logout");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Logout successful");
    });
});

// Generate a valid JWT token for testing
const generateValidToken = (walletAddress: string) => {
    return jwt.sign({ walletAddress }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
};

// Function to generate a random Ethereum address
const generateRandomEthereumAddress = () => {
    return ethers.Wallet.createRandom().address;
};

beforeAll(() => {
    // No need to call a separate mock function; the mock is already set up
});

describe("Airdrop API Tests (Mocked DB)", () => {
    beforeEach(() => {
        // Generate a valid JWT token before running the airdrop tests
        authToken = `auth_token=${generateValidToken("0x1111111111111111111111111111111111111111")}; Path=/; HttpOnly`;
    });

    it.skip("should create an airdrop event successfully", async () => {
        const participants = [
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
        ];

        const requestBody = {
            eventName: "Mock Airdrop",
            prizes: [{ quantity: 2, amount: 1, symbol: "AVAX" }],
            participants: participants, // Use generated addresses
        };

        console.log("Request Body:", requestBody); // Log the request body

        const response = await request(server)
            .post("/airdrop/create")
            .set("Cookie", authToken) // Use the valid JWT token
            .send(requestBody);

        console.log("Create Airdrop Response:", response.body); // Log the response for debugging
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Airdrop created");
        expect(response.body.data.eventId).toBeDefined();
    });

    it.skip("should not allow duplicate airdrop events", async () => {
        // First, create the airdrop event
        const participants = [
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
        ];

        awsSdkScanPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [{name: "Mock Airdrop"}] }));

        await request(server)
            .post("/airdrop/create")
            .set("Cookie", authToken) // Use the valid JWT token
            .send({
                name: "Mock Airdrop",
                prizes: [{ quantity: 2, amount: 1, symbol: "AVAX" }],
                participants: participants, // Use generated addresses
            });

        // Attempt to create the same airdrop event again
        const response = await request(server)
            .post("/airdrop/create")
            .set("Cookie", authToken) // Use the valid JWT token
            .send({
                eventName: "Mock Airdrop", // Same name to trigger duplicate error
                prizes: [{ quantity: 2, amount: 1, symbol: "AVAX" }],
                participants: participants, // Use generated addresses
            });

        // Check that the response status is 400
        expect(response.status).toBe(400);
        
        // Check that the response message is exactly what it should be
        expect(response.body.message).toBe("Airdrop already exists"); // Adjust this message based on your implementation
    });

    it.skip("should draw one prize successfully", async () => {
        // Setup: Create mock data for the airdrop event
        const participants = [
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
        ];

        const eventId = uuidv4(); // Generate a unique ID for the event
        const eventName = "Mock Airdrop";

        // Mock the response for the get method to return the event data
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
            Item :{
                eventID: eventId,
                eventName: eventName,
                prizes: [{ availableQuantity: 2, amount: 1, symbol: "AVAX" }],
                eligibleParticipants: participants,
                eventStatus: "Open",
                winners: {}
            },
        }));

        // Act: Draw one prize
        const response = await request(server)
            .post(`/airdrop/${eventId}/drawOne`)
            .set("Cookie", authToken); // Use the valid JWT token

        // Log the response for debugging
        console.log("Draw One Prize Response:", response.body);

        // Assert: Check the response status and message
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Prize drawn");
    });

    it("should draw all prizes successfully", async () => {
        // Setup: Create mock data for the airdrop event
        const participants = [
            generateRandomEthereumAddress(),
            generateRandomEthereumAddress(),
        ];

        const eventId = uuidv4(); // Generate a unique ID for the event
        const eventName = "Mock Airdrop";

        // Mock the response for the get method to return the event data
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
            Item: {
                eventID: eventId,
                eventName: eventName,
                prizes: [{ availableQuantity: 2, amount: 1, symbol: "AVAX" }],
                eligibleParticipants: participants,
                eventStatus: "Open",
                winners: {}
            },
        }));

        // Act: Draw All prizes
        const response = await request(server)
            .post(`/airdrop/${eventId}/drawAll`)
            .set("Cookie", authToken); // Use the valid JWT token

        // Check that the db.update was called with the correct parameters
        expect(db.update).toHaveBeenCalledWith({
            TableName: TABLE_NAME,
            Key: { eventID: eventId }, // Use the eventID that was generated in the test
            UpdateExpression: "set prizes = :prizes, winners = :winners, eventStatus = :status, eligibleParticipants = :eligibleParticipants",
            ExpressionAttributeValues: {
                ":prizes": [
                    { availableQuantity: 0, amount: 1, symbol: "AVAX" }, // After drawing, available quantity should decrease
                ],
                ":winners": expect.any(Object), // This will be populated with the drawn winners
                ":status": "Closed", // Assuming the status remains OPEN if there are still prizes left
                ":eligibleParticipants": [] // This will be the remaining eligible participants
            }
        });

        // Log the response for debugging
        console.log("Draw All Prize Response:", response.body);

        // Assert: Check the response status and message
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Prize drawn");
    });


    it.skip("should get the status of an airdrop event", async () => {
        const response = await request(server)
            .get("/airdrop/1/status")
            .set("Cookie", authToken); // Use the valid JWT token

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Status fetched!");
        expect(response.body.data).toHaveProperty("winners");
        expect(response.body.data).toHaveProperty("status");
    });
});
