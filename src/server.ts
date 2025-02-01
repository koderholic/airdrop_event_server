import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from "cookie-parser";
import AirdropRoutes from './routes/Airdrop';
import AuthRoutes from './routes/Auth';
import { errorHandler } from "./middleware/errorHandler";


require('dotenv').config();

const server = express();

const allowedOrigins = [
  process.env.FRONTEND_URL
];
server.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

server.use(morgan('dev'));
server.use(helmet());
server.use(express.json());
server.use(cookieParser());

server.use('/airdrop', AirdropRoutes);
server.use('/auth', AuthRoutes);
server.use(errorHandler);

const port = process.env.PORT || 5000;
export const app = server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

export default server;
