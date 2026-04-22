import fs from 'fs';
import path from 'path';

const MESSAGES_FILE = path.join(process.cwd(), 'data', 'chat_history.json');

interface Message {
  id: string | number;
  text: string;
  sender: 'me' | 'owner';
  timestamp: number;
}

export function getMessages() {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(MESSAGES_FILE)) {
      const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
      
      // Check if we should clear messages (Daily at 12am IST)
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const todayIST = istTime.toISOString().split('T')[0];

      if (data.lastCleared !== todayIST) {
        // Clear history for the new day
        const newData = { lastCleared: todayIST, messages: [] };
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(newData, null, 2));
        return [];
      }

      return data.messages || [];
    }
  } catch (err) {
    console.error('Error reading chat_history.json', err);
  }
  return [];
}

export function saveMessages(newMessages: Message[]) {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const currentMessages = getMessages();
    const existingIds = new Set(currentMessages.map((m: Message) => String(m.id)));
    
    const uniqueNew = newMessages.filter(m => !existingIds.has(String(m.id)));
    
    if (uniqueNew.length === 0) return currentMessages;

    const updatedMessages = [...currentMessages, ...uniqueNew].sort((a, b) => a.timestamp - b.timestamp);
    
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayIST = istTime.toISOString().split('T')[0];

    const data = {
      lastCleared: todayIST,
      messages: updatedMessages
    };

    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
    return updatedMessages;
  } catch (err) {
    console.error('Error writing chat_history.json', err);
    return [];
  }
}

export function addMessage(message: Message) {
  return saveMessages([message]);
}
