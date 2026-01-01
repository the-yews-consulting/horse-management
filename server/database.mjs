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
    // Create config table
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
    });

    // Create alerts table
    db.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT NOT NULL,
        name TEXT NOT NULL,
        condition TEXT NOT NULL,
        threshold TEXT,
        enabled INTEGER DEFAULT 1,
        last_triggered DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating alerts table:', err);
      }
    });

    // Create alert history table
    db.run(`
      CREATE TABLE IF NOT EXISTS alert_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alert_id INTEGER NOT NULL,
        entity_id TEXT NOT NULL,
        state_value TEXT,
        triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (alert_id) REFERENCES alerts(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating alert_history table:', err);
      }
    });

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

export function getAllAlerts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM alerts ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function createAlert(alert) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO alerts (entity_id, name, condition, threshold, enabled) VALUES (?, ?, ?, ?, ?)`,
      [alert.entity_id, alert.name, alert.condition, alert.threshold, alert.enabled ? 1 : 0],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...alert });
        }
      }
    );
  });
}

export function updateAlert(id, alert) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE alerts SET entity_id = ?, name = ?, condition = ?, threshold = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [alert.entity_id, alert.name, alert.condition, alert.threshold, alert.enabled ? 1 : 0, id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
}

export function deleteAlert(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM alerts WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

export function recordAlertTrigger(alertId, entityId, stateValue) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO alert_history (alert_id, entity_id, state_value) VALUES (?, ?, ?)`,
      [alertId, entityId, stateValue],
      function (err) {
        if (err) {
          reject(err);
        } else {
          db.run(
            'UPDATE alerts SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?',
            [alertId],
            (updateErr) => {
              if (updateErr) {
                reject(updateErr);
              } else {
                resolve(this.lastID);
              }
            }
          );
        }
      }
    );
  });
}

export function getAlertHistory(limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT ah.*, a.name as alert_name
       FROM alert_history ah
       JOIN alerts a ON ah.alert_id = a.id
       ORDER BY ah.triggered_at DESC
       LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

export { db };
