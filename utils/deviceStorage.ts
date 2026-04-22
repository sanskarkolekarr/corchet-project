import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'device_data.json');

export function getAllowedDevice() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (data.USER_DEVICE_ID) {
        return data.USER_DEVICE_ID;
      }
    }
  } catch (err) {
    console.error('Error reading device_data.json', err);
  }
  // Fallback to env variable if file doesn't exist or is empty
  return process.env.USER_DEVICE_ID;
}

export function setAllowedDevice(id: string) {
  try {
    let data: any = {};
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    data.USER_DEVICE_ID = id;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Saved new device ID ${id} to ${DATA_FILE}`);
    return true;
  } catch (err) {
    console.error('Error writing device_data.json', err);
    return false;
  }
}
