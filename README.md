# Airdrop Event API

## 📌 Introduction
The Airdrop Event API is a backend service built with Node.js, Express, and AWS DynamoDB that facilitates the creation, execution, and management of airdrop campaigns. It enables users to define airdrop events, randomly distribute prizes to participants, and query the status of an event securely.

## This API ensures:
- Secure user authentication via EIP-712 signed messages.
  - Uses EIP-712 signed messages for authentication.
  - Each request requires a JWT token containing a verified Ethereum address.
  - Only the event owner can perform prize draws.
  - Secure Cookie-Based Authentication: JWT tokens are stored in HTTP-only cookies to prevent XSS attacks.
- Randomized, fair prize distribution.
- Efficient data persistence using AWS DynamoDB.
- Robust error handling and validation via Zod.

## Login & Secure JWT Handling
1. Login (POST /auth/login)
  - The user signs a message using their wallet.
  - The backend verifies the EIP-712 signature.
  - A JWT token is issued and stored in an HTTP-only cookie.
2. Automatic Authentication via Cookies
  - Every API request checks for a valid JWT in cookies.
  - If the token is missing or invalid, access is denied.
3. Logout (POST /auth/logout)
  - Clears the authentication cookie, effectively logging out the user.

## Tech Stack
`Backend`: Node.js, Express, TypeScript
`Database`: AWS DynamoDB
`Security`: EIP-712 Signed Messages, JWT Authentication
`Validation`: Zod
`Deployment`: AWS EC2 / AWS Amplify

## Future Considerations:
- Add more unit tests (Jest/Mocha)
- Implement pagination for large events
- Enhance real-time updates using WebSockets
- Optimize DynamoDB queries for better efficiency

## Setup
Clone the repository, then follow the below commands

```
npm install
```

## Lint

```
npm run lint
```

## Test

```
npm run test
```

## Development

```
npm run dev
```
