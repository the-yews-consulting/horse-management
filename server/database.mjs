import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, 'homeassistant.db');
const db = new sqlite3.Database(dbPath);

// Default credentials
const defaultConfig = {
  url: 'https://ubijd9zvct3uaenhmtl4xihltxgk8bo8.ui.nabu.casa',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4OWNkMTJhZDdjMmU0MDc0YTc2ZDg2ODM1NzQ2OGQzMCIsImlhdCI6MTc2NzIzMzY0OSwiZXhwIjoyMDgyNTkzNjQ5fQ.BxGsLdwOmhzklOSbBavFQOU681VaT3um7qZ0x1sRMyo'
};

// Initialize database synchronously
const initPromise = new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Initialize with default values
      db.run(
        `INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`,
        ['ha_token', defaultConfig.token],
        (err) => {
          if (err) {
            console.error('Error inserting token:', err);
          } else {
            console.log('Default token initialized');
          }
        }
      );

      db.run(
        `INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`,
        ['ha_url', defaultConfig.url],
        (err) => {
          if (err) {
            console.error('Error inserting URL:', err);
          } else {
            console.log('Default URL initialized');
          }
          resolve();
        }
      );
    });
  });
});

export const dbReady = initPromise;

export function getConfig(key) {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM config WHERE key = ?', [key], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.value : null);
      }
    });
  });
}

export function setConfig(key, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO config (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      [key, value, value],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

export function deleteConfig(key) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM config WHERE key = ?', [key], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

export { db };
