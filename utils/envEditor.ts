import fs from 'fs';
import path from 'path';

export function updateEnv(key: string, value: string) {
  try {
    const root = process.cwd();
    const paths = [
      path.join(root, '.env.local'),
      path.join(root, '.env'),
      path.join(root, '..', '.env.local'), // For standalone builds
      path.join(root, '..', '.env')
    ];
    
    let envPath = '';
    for (const p of paths) {
      if (fs.existsSync(p)) {
        envPath = p;
        break;
      }
    }

    if (!envPath) {
      console.error('No .env or .env.local file found');
      return;
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    const regex = new RegExp(`^${key}=`);
    
    let found = false;
    const newLines = lines.map(line => {
      if (regex.test(line)) {
        found = true;
        return `${key}=${value}`;
      }
      return line;
    });

    if (!found) {
      newLines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log(`Successfully updated ${key} in ${envPath}`);
  } catch (error) {
    console.error('Failed to update environment file:', error);
  }
}
