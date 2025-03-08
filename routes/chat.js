// CREATE TABLE chat (
//     id SERIAL PRIMARY KEY,
//     senderId INT REFERENCES users (id),
//     receiverId INT REFERENCES users (id),
//     message TEXT,
//     isActive BOOLEAN DEFAULT TRUE,
//     isDelete BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

const express = require("express");
const router = express.Router();
const { pool } = require("../db");
require("dotenv").config();


//using ws socket 
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
