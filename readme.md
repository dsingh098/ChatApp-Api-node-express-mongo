# Chat Backend (Node.js + Express + MongoDB + Socket.io)

Backend for a real-time chat app with private chats, group chats, and live updates via Socket.io.

## Stack

- Server: Node.js, Express
- Database: MongoDB, Mongoose
- Realtime: Socket.io
- Auth: JWT + `httpOnly` cookie (bcryptjs for password hashing)

## Features

- Register/Login/Logout with JWT
- Private conversations (1:1)
- Group conversations with admin-only member management
- Send and fetch messages
- Unread count and mark-as-read endpoint
- Socket presence and message broadcast with membership checks

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

3. Start the server

```bash
npm start
```

## Scripts

- `npm start` starts `index.js`

## Authentication

- After `register` / `login`, the server sets a `token` cookie (`httpOnly`).
- Protected routes accept JWT either from:
  - `Authorization: Bearer <token>` header, or
  - `token` cookie
- For security, the API does not return JWT in JSON responses.

### Important Cookie Notes

- In production, cookies are `secure` (HTTPS only). In development, `secure` is false.
- If you host frontend and backend on different domains, cookie auth requires correct CORS + `withCredentials` on the client.

## API

Base paths:

- Auth: `/api/user`
- Conversations: `/api/conversation`
- Messages: `/api/message`

### Auth

- `POST /api/user/register`
  - Body: `{ "name": "...", "username": "...", "email": "...", "password": "..." }`
- `POST /api/user/login`
  - Body: `{ "email": "...", "password": "..." }`
- `POST /api/user/logout` (protected)

Notes:

- `register` / `login` are rate-limited (basic in-memory limiter).

### Conversations (protected)

- `POST /api/conversation`
  - Private: `{ "isGroup": false, "participants": ["<otherUserId>"] }`
  - Group: `{ "isGroup": true, "groupName": "My Group", "participants": ["<userId1>", "<userId2>"] }`
- `GET /api/conversation`
- `POST /api/conversation/add/:id` (admin only)
  - Body: `{ "userId": "<userId>" }`
- `DELETE /api/conversation/remove/:id` (admin only)
  - Body: `{ "userId": "<userId>" }`

### Messages (protected)

- `POST /api/message`
  - Body: `{ "content": "hello", "conversation": "<conversationId>" }`
- `GET /api/message/:conversationId`
- `GET /api/message/unread/:conversationId`
- `PATCH /api/message/read/:conversationId`
  - Marks messages as read for the current user in that conversation

Security:

- Message and conversation endpoints enforce conversation membership (no cross-chat access).

## Quick API Examples (curl)

These examples assume the backend runs on `http://localhost:5000`.

### Register (stores cookie to `cookies.txt`)

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" ^
  -d "{\"name\":\"Deepak\",\"username\":\"deepak1\",\"email\":\"deepak@example.com\",\"password\":\"secret123\"}" ^
  http://localhost:5000/api/user/register
```

### Login (stores cookie to `cookies.txt`)

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" ^
  -d "{\"email\":\"deepak@example.com\",\"password\":\"secret123\"}" ^
  http://localhost:5000/api/user/login
```

### Create a private conversation (cookie auth)

```bash
curl -i -b cookies.txt -H "Content-Type: application/json" ^
  -d "{\"isGroup\":false,\"participants\":[\"<otherUserId>\"]}" ^
  http://localhost:5000/api/conversation
```

### Send a message (cookie auth)

```bash
curl -i -b cookies.txt -H "Content-Type: application/json" ^
  -d "{\"content\":\"hello\",\"conversation\":\"<conversationId>\"}" ^
  http://localhost:5000/api/message
```

### Mark messages as read

```bash
curl -i -X PATCH -b cookies.txt ^
  http://localhost:5000/api/message/read/<conversationId>
```

## Socket.io

Socket connections are authenticated with JWT. The server accepts the token from:

- `socket.handshake.auth.token`, or
- the `token` cookie (recommended if you use cookie auth for REST)

Client examples:

```js
import { io } from "socket.io-client";

// If your frontend is same-site and cookie is set:
const socket = io("http://localhost:5000", { withCredentials: true });

// Or if you manage the token manually:
// const socket = io("http://localhost:5000", { auth: { token } });
```

Events:

```
Client → Server
  userOnline      ()
  joinRoom        (conversationId)        // only if you are a participant
  sendMessage     ({ conversation, ... }) // only if you are a participant

Server → Client
  onlineUsers     (array of userIds)
  receiveMessage  (message object)
  socketError     (string)
```

## Production Notes

- CORS:
  - Socket.io CORS uses `CLIENT_URL` and `credentials: true`.
  - REST CORS is not configured in this repo (add `cors` middleware if your frontend is on a different origin).
- Rate limiting is in-memory and per-process. For real deployments, use Redis or an API gateway.
- Logout clears the cookie but does not revoke JWTs already issued (for true logout, add refresh tokens or a revocation strategy).

## Project Structure

```
├── index.js
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── socket/
```

## Troubleshooting

- Server exits immediately:
  - Ensure `MONGO_URI` and `JWT_SECRET` exist in `.env`.
- Socket connection gets `Unauthorized`:
  - Login first so the `token` cookie exists, or pass `auth: { token }` from the client.
- Unread endpoint not working:
  - Use `GET /api/message/unread/:conversationId` (not `GET /api/message/:conversationId`).
