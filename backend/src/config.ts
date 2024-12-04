import 'dotenv/config';

export const PORT = Number(process.env.PORT) || 3000;
export const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';
export const UPLOAD_PATH = process.env.UPLOAD_PATH || 'images';
export const UPLOAD_PATH_TEMP = process.env.UPLOAD_PATH_TEMP || 'temp';
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW || 'http://localhost:5173';
export const AUTH_REFRESH_TOKEN_EXPIRY = process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d';
export const AUTH_ACCESS_TOKEN_EXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m';
export const SECRET_KEY = process.env.SECRET_KEY || 'some-secret-key';
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'refresh-secret-key';
export const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '* * * * *';
export const MAXIMUM_FILE_SIZE = Number(process.env.MAXIMUM_FILE_SIZE) || 102400;
