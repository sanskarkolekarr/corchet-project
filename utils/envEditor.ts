import fs from 'fs';
import path from 'path';

export function updateEnv(key: string, value: string) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    const regex = new RegExp(`^${key}=.*`, 'm');
    
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated ${key} in .env.local to ${value}`);
  } catch (error) {
    console.error('Failed to update .env.local:', error);
  }
}
