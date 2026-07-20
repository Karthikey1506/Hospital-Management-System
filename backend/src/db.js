const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/database.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial DB Structure
const initialData = {
  users: [],
  departments: [],
  doctors: [],
  patients: [],
  appointments: [],
  beds: [],
  prescriptions: [],
  lab_tests: [],
  bills: [],
  medicines: []
};

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB:', err);
    return initialData;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

const db = {
  getCollection: (name) => {
    const data = readDB();
    return data[name] || [];
  },

  findById: (name, id) => {
    const collection = db.getCollection(name);
    return collection.find(item => String(item.id) === String(id));
  },

  findWhere: (name, predicate) => {
    const collection = db.getCollection(name);
    return collection.filter(predicate);
  },

  insert: (name, record) => {
    const data = readDB();
    if (!data[name]) data[name] = [];
    const id = record.id || (data[name].length > 0 ? Math.max(...data[name].map(r => Number(r.id) || 0)) + 1 : 1);
    const newRecord = { ...record, id, createdAt: new Date().toISOString() };
    data[name].push(newRecord);
    writeDB(data);
    return newRecord;
  },

  update: (name, id, updates) => {
    const data = readDB();
    if (!data[name]) return null;
    const index = data[name].findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;
    data[name][index] = { ...data[name][index], ...updates, updatedAt: new Date().toISOString() };
    writeDB(data);
    return data[name][index];
  },

  delete: (name, id) => {
    const data = readDB();
    if (!data[name]) return false;
    const initialLen = data[name].length;
    data[name] = data[name].filter(item => String(item.id) !== String(id));
    if (data[name].length !== initialLen) {
      writeDB(data);
      return true;
    }
    return false;
  },

  reset: (seedData) => {
    writeDB(seedData || initialData);
  }
};

module.exports = db;
