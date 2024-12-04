import fs from 'fs';
import path from 'path';
import { UPLOAD_PATH_TEMP } from '../config';
import { defaultLogger } from '../middlewares/logger';

const clearTempFolder = () => {
  try {
    fs.readdir(UPLOAD_PATH_TEMP, (readdirErr, files) => {
      if (readdirErr) {
        throw new Error(readdirErr.message);
      } else {
        files.forEach((file) => {
          const filePath = path.join(UPLOAD_PATH_TEMP, file);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              throw new Error(unlinkErr.message);
            }
          });
        });
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      defaultLogger.error(err.message);
    } else {
      defaultLogger.error('Unknown Error Occurred While Cleaning Temp Files');
    }
  }
};

export default clearTempFolder;
