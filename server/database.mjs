import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import crypto from 'crypto';

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

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'owner')),
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      }
    });

    // Create owners table
    db.run(`
      CREATE TABLE IF NOT EXISTS owners (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        billing_info TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating owners table:', err);
      }
    });

    // Create vets table
    db.run(`
      CREATE TABLE IF NOT EXISTS vets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        clinic_name TEXT,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        emergency_phone TEXT,
        banking_details TEXT,
        specialties TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating vets table:', err);
      }
    });

    // Create farriers table
    db.run(`
      CREATE TABLE IF NOT EXISTS farriers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        banking_details TEXT,
        service_areas TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating farriers table:', err);
      }
    });

    // Create stalls table
    db.run(`
      CREATE TABLE IF NOT EXISTS stalls (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        building TEXT,
        size_sqm REAL,
        has_paddock_access INTEGER DEFAULT 0,
        features TEXT,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating stalls table:', err);
      }
    });

    // Create horses table
    db.run(`
      CREATE TABLE IF NOT EXISTS horses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        breed TEXT,
        color TEXT,
        age INTEGER,
        date_of_birth DATE,
        gender TEXT CHECK (gender IN ('mare', 'stallion', 'gelding', 'colt', 'filly')),
        owner_id TEXT,
        vet_id TEXT,
        farrier_id TEXT,
        microchip_number TEXT,
        passport_number TEXT,
        medical_notes TEXT,
        dietary_requirements TEXT,
        behavioral_notes TEXT,
        photo_url TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'deceased')),
        colour TEXT CHECK (colour IN ('Brown', 'Bay', 'Chesnut', 'Grey', 'Black')),
        height REAL,
        clipped INTEGER DEFAULT 0,
        fei_id TEXT,
        pet_name TEXT,
        rfid TEXT,
        rug_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
        FOREIGN KEY (vet_id) REFERENCES vets(id) ON DELETE SET NULL,
        FOREIGN KEY (farrier_id) REFERENCES farriers(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating horses table:', err);
      }
    });

    // Add new columns to existing horses table if they don't exist
    db.run(`ALTER TABLE horses ADD COLUMN colour TEXT CHECK (colour IN ('Brown', 'Bay', 'Chesnut', 'Grey', 'Black'))`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding colour column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN height REAL`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding height column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN clipped INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding clipped column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN fei_id TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding fei_id column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN pet_name TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding pet_name column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN rfid TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding rfid column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN rug_name TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding rug_name column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN sire TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding sire column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN dam TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding dam column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN bloodline_info TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding bloodline_info column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN breeding_status TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding breeding_status column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN breeding_notes TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding breeding_notes column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN inquiry_notes TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding inquiry_notes column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN competition_record TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding competition_record column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN training_notes TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding training_notes column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN video_urls TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding video_urls column:', err);
      }
    });

    db.run(`ALTER TABLE horses ADD COLUMN related_links TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding related_links column:', err);
      }
    });

    // Create horse_breeds table
    db.run(`
      CREATE TABLE IF NOT EXISTS horse_breeds (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        abbreviation TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating horse_breeds table:', err);
      } else {
        db.run(`
          INSERT OR IGNORE INTO horse_breeds (id, name, abbreviation, is_default) VALUES
          ('${crypto.randomUUID()}', 'Pony', 'PNY', 0),
          ('${crypto.randomUUID()}', 'Purebred Arabian', 'PA', 0),
          ('${crypto.randomUUID()}', 'Quarter Horse', 'QTR', 0),
          ('${crypto.randomUUID()}', 'Standardbred', 'STD', 0),
          ('${crypto.randomUUID()}', 'Thoroughbred', 'TB', 1)
        `);
      }
    });

    // Create horse_colours table
    db.run(`
      CREATE TABLE IF NOT EXISTS horse_colours (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        abbreviation TEXT NOT NULL,
        description TEXT,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating horse_colours table:', err);
      } else {
        db.run(`ALTER TABLE horse_colours ADD COLUMN description TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding description column:', err);
          }
        });

        db.run(`DELETE FROM horse_colours`, (err) => {
          if (err) {
            console.error('Error clearing horse_colours:', err);
          } else {
            db.run(`
              INSERT INTO horse_colours (id, abbreviation, name, description, is_default) VALUES
              ('${crypto.randomUUID()}', 'Bay', 'Bay', 'Bay', 0),
              ('${crypto.randomUUID()}', 'Bbr', 'Bay/Brown', 'Bay/Brown', 0),
              ('${crypto.randomUUID()}', 'Bl', 'Black', 'Black', 1),
              ('${crypto.randomUUID()}', 'Br', 'Brown', 'Brown', 0),
              ('${crypto.randomUUID()}', 'BrBl', 'Brown/Black', 'Brown/Black', 0),
              ('${crypto.randomUUID()}', 'BrGr', 'Brown/Grey', 'Brown/Grey', 0),
              ('${crypto.randomUUID()}', 'Ch', 'Chesnut', 'Chesnut', 0),
              ('${crypto.randomUUID()}', 'Dkb', 'Dark Bay', 'Dark Bay', 0),
              ('${crypto.randomUUID()}', 'Dkbb', 'Dark Bay/Brown', 'Dark Bay/Brown', 0),
              ('${crypto.randomUUID()}', 'Dkbr', 'Dark Brown', 'Dark Brown', 0),
              ('${crypto.randomUUID()}', 'Gr', 'Grey', 'Grey', 0),
              ('${crypto.randomUUID()}', 'GrBa', 'Grey/Bay', 'Grey/Bay', 0),
              ('${crypto.randomUUID()}', 'GrCh', 'Grey/Chesnut', 'Grey/Chesnut', 0),
              ('${crypto.randomUUID()}', 'GrRn', 'Grey/Roan', 'Grey/Roan', 0),
              ('${crypto.randomUUID()}', 'Oth', 'Other', 'Other', 0)
            `);
          }
        });
      }
    });

    // Create horse_genders table
    db.run(`
      CREATE TABLE IF NOT EXISTS horse_genders (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        abbreviation TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating horse_genders table:', err);
      } else {
        db.run(`
          INSERT OR IGNORE INTO horse_genders (id, name, abbreviation, is_default) VALUES
          ('${crypto.randomUUID()}', 'Colt', 'C', 0),
          ('${crypto.randomUUID()}', 'Gelding', 'G', 1),
          ('${crypto.randomUUID()}', 'Stallion', 'S', 0),
          ('${crypto.randomUUID()}', 'Filly', 'F', 0),
          ('${crypto.randomUUID()}', 'Mare', 'M', 0)
        `);
      }
    });

    // Create boarding assignments table
    db.run(`
      CREATE TABLE IF NOT EXISTS boarding_assignments (
        id TEXT PRIMARY KEY,
        horse_id TEXT NOT NULL,
        stall_id TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        monthly_rate REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
        FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating boarding_assignments table:', err);
      }
    });

    // Create HA sensors mapping table
    db.run(`
      CREATE TABLE IF NOT EXISTS ha_sensors (
        id TEXT PRIMARY KEY,
        stall_id TEXT NOT NULL,
        entity_id TEXT NOT NULL UNIQUE,
        sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'humidity', 'motion', 'light', 'door', 'custom')),
        friendly_name TEXT,
        unit_of_measurement TEXT,
        alert_threshold_min REAL,
        alert_threshold_max REAL,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating ha_sensors table:', err);
      }
    });

    // Create HA cameras mapping table
    db.run(`
      CREATE TABLE IF NOT EXISTS ha_cameras (
        id TEXT PRIMARY KEY,
        stall_id TEXT NOT NULL,
        entity_id TEXT NOT NULL UNIQUE,
        friendly_name TEXT,
        location_description TEXT,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating ha_cameras table:', err);
      }
    });

    // Create activities table
    db.run(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        activity_type TEXT NOT NULL CHECK (activity_type IN ('feeding', 'training', 'vet_visit', 'farrier_visit', 'grooming', 'exercise', 'medication', 'custom')),
        horse_id TEXT,
        stall_id TEXT,
        assigned_to TEXT,
        scheduled_start DATETIME NOT NULL,
        scheduled_end DATETIME,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
        notes TEXT,
        recurrence_rule TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE CASCADE,
        FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating activities table:', err);
      }
    });

    // Create activity history table
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_history (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        completed_by TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating activity_history table:', err);
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

// Users
export function createUser(user) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO users (id, email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.email, user.password_hash, user.full_name, user.role, user.phone],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...user });
        }
      }
    );
  });
}

export function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, email, full_name, role, phone, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function updateUser(id, user) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET email = ?, full_name = ?, role = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [user.email, user.full_name, user.role, user.phone, id],
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

export function deleteUser(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Owners
export function createOwner(owner) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO owners (id, user_id, first_name, last_name, email, phone, address, emergency_contact_name, emergency_contact_phone, billing_info, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, owner.user_id, owner.first_name, owner.last_name, owner.email, owner.phone, owner.address,
       owner.emergency_contact_name, owner.emergency_contact_phone, owner.billing_info, owner.notes],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...owner });
        }
      }
    );
  });
}

export function getAllOwners() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM owners ORDER BY last_name, first_name', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getOwnerById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM owners WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function updateOwner(id, owner) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE owners SET user_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, address = ?,
       emergency_contact_name = ?, emergency_contact_phone = ?, billing_info = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [owner.user_id, owner.first_name, owner.last_name, owner.email, owner.phone, owner.address,
       owner.emergency_contact_name, owner.emergency_contact_phone, owner.billing_info, owner.notes, id],
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

export function deleteOwner(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM owners WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Horses
export function createHorse(horse) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO horses (id, name, breed, color, age, date_of_birth, gender, owner_id, vet_id, farrier_id,
       microchip_number, passport_number, medical_notes, dietary_requirements, behavioral_notes, photo_url, status,
       colour, height, clipped, fei_id, pet_name, rfid, rug_name,
       sire, dam, bloodline_info, breeding_status, breeding_notes, inquiry_notes,
       competition_record, training_notes, video_urls, related_links)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, horse.name, horse.breed, horse.color, horse.age, horse.date_of_birth, horse.gender, horse.owner_id,
       horse.vet_id, horse.farrier_id, horse.microchip_number, horse.passport_number, horse.medical_notes,
       horse.dietary_requirements, horse.behavioral_notes, horse.photo_url, horse.status || 'active',
       horse.colour, horse.height, horse.clipped ? 1 : 0, horse.fei_id, horse.pet_name, horse.rfid, horse.rug_name,
       horse.sire, horse.dam, horse.bloodline_info, horse.breeding_status, horse.breeding_notes, horse.inquiry_notes,
       horse.competition_record, horse.training_notes, horse.video_urls, horse.related_links],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...horse });
        }
      }
    );
  });
}

export function getAllHorses() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT h.*, o.first_name as owner_first_name, o.last_name as owner_last_name,
             v.name as vet_name, f.name as farrier_name
      FROM horses h
      LEFT JOIN owners o ON h.owner_id = o.id
      LEFT JOIN vets v ON h.vet_id = v.id
      LEFT JOIN farriers f ON h.farrier_id = f.id
      ORDER BY h.name
    `, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          ...row,
          clipped: row.clipped === 1
        })));
      }
    });
  });
}

export function getHorseById(id) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT h.*, o.first_name as owner_first_name, o.last_name as owner_last_name,
             v.name as vet_name, f.name as farrier_name
      FROM horses h
      LEFT JOIN owners o ON h.owner_id = o.id
      LEFT JOIN vets v ON h.vet_id = v.id
      LEFT JOIN farriers f ON h.farrier_id = f.id
      WHERE h.id = ?
    `, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (row) {
          row.clipped = row.clipped === 1;
        }
        resolve(row);
      }
    });
  });
}

export function updateHorse(id, horse) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE horses SET name = ?, breed = ?, color = ?, age = ?, date_of_birth = ?, gender = ?, owner_id = ?,
       vet_id = ?, farrier_id = ?, microchip_number = ?, passport_number = ?, medical_notes = ?,
       dietary_requirements = ?, behavioral_notes = ?, photo_url = ?, status = ?,
       colour = ?, height = ?, clipped = ?, fei_id = ?, pet_name = ?, rfid = ?, rug_name = ?,
       sire = ?, dam = ?, bloodline_info = ?, breeding_status = ?, breeding_notes = ?, inquiry_notes = ?,
       competition_record = ?, training_notes = ?, video_urls = ?, related_links = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [horse.name, horse.breed, horse.color, horse.age, horse.date_of_birth, horse.gender, horse.owner_id,
       horse.vet_id, horse.farrier_id, horse.microchip_number, horse.passport_number, horse.medical_notes,
       horse.dietary_requirements, horse.behavioral_notes, horse.photo_url, horse.status,
       horse.colour, horse.height, horse.clipped ? 1 : 0, horse.fei_id, horse.pet_name, horse.rfid, horse.rug_name,
       horse.sire, horse.dam, horse.bloodline_info, horse.breeding_status, horse.breeding_notes, horse.inquiry_notes,
       horse.competition_record, horse.training_notes, horse.video_urls, horse.related_links, id],
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

export function deleteHorse(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM horses WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Stalls
export function createStall(stall) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO stalls (id, name, building, size_sqm, has_paddock_access, features, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, stall.name, stall.building, stall.size_sqm, stall.has_paddock_access ? 1 : 0,
       stall.features, stall.status || 'available', stall.notes],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...stall });
        }
      }
    );
  });
}

export function getAllStalls() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM stalls ORDER BY name', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getStallById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM stalls WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function updateStall(id, stall) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE stalls SET name = ?, building = ?, size_sqm = ?, has_paddock_access = ?, features = ?,
       status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [stall.name, stall.building, stall.size_sqm, stall.has_paddock_access ? 1 : 0,
       stall.features, stall.status, stall.notes, id],
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

export function deleteStall(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM stalls WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Vets
export function createVet(vet) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO vets (id, name, clinic_name, email, phone, address, emergency_phone, banking_details, specialties, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, vet.name, vet.clinic_name, vet.email, vet.phone, vet.address, vet.emergency_phone,
       vet.banking_details, vet.specialties, vet.notes],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...vet });
        }
      }
    );
  });
}

export function getAllVets() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM vets ORDER BY name', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getVetById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM vets WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function updateVet(id, vet) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE vets SET name = ?, clinic_name = ?, email = ?, phone = ?, address = ?, emergency_phone = ?,
       banking_details = ?, specialties = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [vet.name, vet.clinic_name, vet.email, vet.phone, vet.address, vet.emergency_phone,
       vet.banking_details, vet.specialties, vet.notes, id],
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

export function deleteVet(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM vets WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Farriers
export function createFarrier(farrier) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO farriers (id, name, email, phone, address, banking_details, service_areas, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, farrier.name, farrier.email, farrier.phone, farrier.address, farrier.banking_details,
       farrier.service_areas, farrier.notes],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...farrier });
        }
      }
    );
  });
}

export function getAllFarriers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM farriers ORDER BY name', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getFarrierById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM farriers WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function updateFarrier(id, farrier) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE farriers SET name = ?, email = ?, phone = ?, address = ?, banking_details = ?,
       service_areas = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [farrier.name, farrier.email, farrier.phone, farrier.address, farrier.banking_details,
       farrier.service_areas, farrier.notes, id],
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

export function deleteFarrier(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM farriers WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Activities
export function createActivity(activity) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO activities (id, title, activity_type, horse_id, stall_id, assigned_to, scheduled_start,
       scheduled_end, status, notes, recurrence_rule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, activity.title, activity.activity_type, activity.horse_id, activity.stall_id, activity.assigned_to,
       activity.scheduled_start, activity.scheduled_end, activity.status || 'scheduled', activity.notes, activity.recurrence_rule],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...activity });
        }
      }
    );
  });
}

export function getAllActivities() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT a.*, h.name as horse_name, s.name as stall_name, u.full_name as assigned_to_name
      FROM activities a
      LEFT JOIN horses h ON a.horse_id = h.id
      LEFT JOIN stalls s ON a.stall_id = s.id
      LEFT JOIN users u ON a.assigned_to = u.id
      ORDER BY a.scheduled_start DESC
    `, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getActivityById(id) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT a.*, h.name as horse_name, s.name as stall_name, u.full_name as assigned_to_name
      FROM activities a
      LEFT JOIN horses h ON a.horse_id = h.id
      LEFT JOIN stalls s ON a.stall_id = s.id
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE a.id = ?
    `, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function updateActivity(id, activity) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE activities SET title = ?, activity_type = ?, horse_id = ?, stall_id = ?, assigned_to = ?,
       scheduled_start = ?, scheduled_end = ?, status = ?, notes = ?, recurrence_rule = ?,
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [activity.title, activity.activity_type, activity.horse_id, activity.stall_id, activity.assigned_to,
       activity.scheduled_start, activity.scheduled_end, activity.status, activity.notes, activity.recurrence_rule, id],
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

export function deleteActivity(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM activities WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// Boarding Assignments
export function createBoardingAssignment(assignment) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO boarding_assignments (id, horse_id, stall_id, start_date, end_date, monthly_rate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, assignment.horse_id, assignment.stall_id, assignment.start_date, assignment.end_date,
       assignment.monthly_rate, assignment.notes],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...assignment });
        }
      }
    );
  });
}

export function getActiveAssignmentsByStallId(stallId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT ba.*, h.name as horse_name
      FROM boarding_assignments ba
      JOIN horses h ON ba.horse_id = h.id
      WHERE ba.stall_id = ? AND (ba.end_date IS NULL OR ba.end_date >= date('now'))
      ORDER BY ba.start_date DESC
    `, [stallId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getActiveAssignmentByHorseId(horseId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT ba.*, s.name as stall_name, s.building
      FROM boarding_assignments ba
      JOIN stalls s ON ba.stall_id = s.id
      WHERE ba.horse_id = ? AND (ba.end_date IS NULL OR ba.end_date >= date('now'))
      ORDER BY ba.start_date DESC
      LIMIT 1
    `, [horseId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// HA Sensors
export function linkSensorToStall(sensor) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO ha_sensors (id, stall_id, entity_id, sensor_type, friendly_name, unit_of_measurement,
       alert_threshold_min, alert_threshold_max, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, sensor.stall_id, sensor.entity_id, sensor.sensor_type, sensor.friendly_name, sensor.unit_of_measurement,
       sensor.alert_threshold_min, sensor.alert_threshold_max, sensor.enabled ? 1 : 0],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...sensor });
        }
      }
    );
  });
}

export function getSensorsByStallId(stallId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM ha_sensors WHERE stall_id = ? ORDER BY sensor_type', [stallId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function unlinkSensor(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM ha_sensors WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

// HA Cameras
export function linkCameraToStall(camera) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO ha_cameras (id, stall_id, entity_id, friendly_name, location_description, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, camera.stall_id, camera.entity_id, camera.friendly_name, camera.location_description, camera.enabled ? 1 : 0],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...camera });
        }
      }
    );
  });
}

export function getCamerasByStallId(stallId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM ha_cameras WHERE stall_id = ?', [stallId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function unlinkCamera(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM ha_cameras WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

export { db };
