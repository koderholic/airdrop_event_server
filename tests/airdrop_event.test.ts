import request from "supertest";
import server from "../src/server"; // Your Express server entry point
import jwt from "jsonwebtoken"; // Import jsonwebtoken to create a valid token
import { ethers } from "ethers";
import { awsSdkPromiseResponse, awsSdkScanPromiseResponse } from "./__mocks__/aws-sdk/clients/dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from './__mocks__/aws-sdk/clients/dynamodb';
import { TABLE_NAME } from "../src/database";
import { AirdropService } from "../src/service";

let authToken: string;
let signerAddress: string;
const db = new DocumentClient();

// Define the domain and types for EIP-712
const domain = {
    name: 'Avalanche Airdrop App',
    version: "1",
    chainId: 1, 
};

const types = {
    SignIn: [
        { name: "walletAddress", type: "address" },
        { name: "timestamp", type: "uint256" }
    ],
};

// Create a function to generate the EIP-712 signature
const generateEIP712Signature = async (walletAddress: string, timestamp: number, privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey);
    const message = {
        timestamp,
        walletAddress,
    };

    const signature = await wallet.signTypedData(domain, types, message);
    return signature;
};

describe("Auth API Tests (Mocked DB)", () => {
    it("should login successfully", async () => {
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Generate a random wallet
        const wallet = ethers.Wallet.createRandom();
        const walletAddress = wallet.address; // Get the corresponding wallet address
        const randomPrivateKey = wallet.privateKey; // Get the private key

        // Generate the EIP-712 signature
        const signature = await generateEIP712Signature(walletAddress, timestamp, randomPrivateKey);

        const response = await request(server)
            .post("/auth/login")
            .send({
                timestamp,
                walletAddress, // Use the wallet address derived from the random private key
                signature, // Use the generated EIP-712 signature
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        authToken = response.headers['set-cookie'][0]; // Store the auth token from the response
    });

    it("should logout successfully", async () => {
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

describe("Airdrop API Tests (Mocked DB)", () => {
    beforeEach(() => {
        // Generate a valid JWT token before running the airdrop tests
        signerAddress = "0x1111111111111111111111111111111111111111";
        authToken = `auth_token=${generateValidToken(signerAddress)}; Path=/; HttpOnly`;
    });

    it("should create an airdrop event successfully", async () => {
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


        awsSdkScanPromiseResponse.mockReturnValueOnce(Promise.resolve({ Items: [] }));

        const response = await request(server)
            .post("/airdrop/create")
            .set("Cookie", authToken) // Use the valid JWT token
            .send(requestBody);

        expect(db.put).toHaveBeenCalledWith({
            TableName: TABLE_NAME,
            Item: {
                eventID: expect.stringMatching(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i // Regex for UUID
                ),                
                eventName: requestBody.eventName,
                owner: signerAddress,  // Add this later
                participants,
                eligibleParticipants: participants,
                winners: {},
                eventStatus: "Open",
                prizes: requestBody.prizes.map(prize => ({
                    quantity: prize.quantity,
                    availableQuantity: prize.quantity,
                    amount: prize.amount,
                    symbol: prize.symbol
                }))
            }
            
        });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Airdrop created");
        expect(response.body.data.eventId).toBeDefined();
    });

    it("should not allow duplicate airdrop events", async () => {
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

    it("should draw one prize successfully", async () => {
        // Setup: Create mock data for the airdrop event
        const participants = [
            "0x23112813A6748e1a00a19cB6590aDc0e0b33AbFA",
            "0x93e19580217E76669f3A364ae900b1e075226a85",
        ];

        const eventId = uuidv4(); // Generate a unique ID for the event
        const eventName = "Mock Airdrop";

        // Mock the response for the get method to return the event data
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
            Item: {
                eventID: eventId,
                eventName: eventName,
                owner: signerAddress,
                prizes: [{ availableQuantity: 2, amount: 1, symbol: "AVAX" }],
                eligibleParticipants: participants,
                eventStatus: "Open",
                winners: {}
            },
        }));

        // Act: Draw All prizes
        const response = await request(server)
            .post(`/airdrop/${eventId}/drawOne`)
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
                ":winners":  {
                    '0x23112813A6748e1a00a19cB6590aDc0e0b33AbFA': { amount: 1, symbol: "AVAX" },
                    '0x93e19580217E76669f3A364ae900b1e075226a85': { amount: 1, symbol: "AVAX" }
                }, 
                ":status": "Closed", 
                ":eligibleParticipants": [] 
            }
        });

        // Assert: Check the response status and message
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Prize drawn");
    });

    it("should draw all prizes successfully", async () => {
        // Setup: Create mock data for the airdrop event
        const participants = [
            "0x23112813A6748e1a00a19cB6590aDc0e0b33AbFA",
            "0x93e19580217E76669f3A364ae900b1e075226a85",
        ];

        const eventId = uuidv4(); // Generate a unique ID for the event
        const eventName = "Mock Airdrop";

        // Mock the response for the get method to return the event data
        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
            Item: {
                eventID: eventId,
                eventName: eventName,
                owner: signerAddress,
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
                ":winners":  {
                    '0x23112813A6748e1a00a19cB6590aDc0e0b33AbFA': { amount: 1, symbol: "AVAX" },
                    '0x93e19580217E76669f3A364ae900b1e075226a85': { amount: 1, symbol: "AVAX" }
                }, // This will be populated with the drawn winners
                ":status": "Closed", // Assuming the status remains OPEN if there are still prizes left
                ":eligibleParticipants": [] // This will be the remaining eligible participants
            }
        });

        // Assert: Check the response status and message
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Prize drawn");
    });


    it("should get the status of an airdrop event", async () => {

        const eventId = uuidv4(); // Generate a unique ID for the event
        const eventName = "Mock Airdrop";

        awsSdkPromiseResponse.mockReturnValueOnce(Promise.resolve({
            Item: {
                eventID: eventId,
                eventName: eventName,
                prizes: [{ availableQuantity: 2, amount: 1, symbol: "AVAX" }],
                eventStatus: "Open",
                winners: {}
            },
        }));

        const response = await request(server)
            .get(`/airdrop/${eventId}/status`)
            .set("Cookie", authToken); // Use the valid JWT token

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Status fetched!");
        expect(JSON.stringify(response.body.data.winners)).toBe("{}");
        expect(response.body.data.status).toBe("Open");
    });
});
