const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_DB_PATH = path.join(__dirname, '../../data/db.json');
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const DB_PATH = process.env.DB_PATH || (isVercel ? '/tmp/huu-db.json' : DEFAULT_DB_PATH);

let db = null;
const models = {};

const populateRefs = {
  organizer: 'users',
  volunteers: 'users',
  sender: 'users',
  relatedDrive: 'drives',
  recipients: 'users',
};

function generateId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to load db.json, starting fresh:', err.message);
  }
  return { users: [], donors: [], drives: [], notifications: [] };
}

function saveDb() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to save db.json:', err.message);
  }
}

function init() {
  db = loadDb();
  
  const isEmpty = !db.users.length && !db.donors.length && !db.drives.length && !db.notifications.length;
  if (isEmpty) {
    try {
      const committed = fs.readFileSync(DEFAULT_DB_PATH, 'utf8');
      db = JSON.parse(committed);
      saveDb();
    } catch (e) {
      // Keep empty db if seed data not available
    }
  }
  
  return db;
}

function getCollection(name) {
  if (!db[name]) {
    db[name] = [];
  }
  return db[name];
}

function createDocument(collectionName, data) {
  const doc = { ...data, id: data._id };

  doc.save = async function () {
    const collection = getCollection(collectionName);
    const index = collection.findIndex(item => item._id === data._id);
    if (index !== -1) {
      collection[index] = { ...data, updatedAt: new Date().toISOString() };
      saveDb();
      Object.assign(doc, collection[index]);
      return doc;
    }
    return null;
  };

  return doc;
}

function validate(schema, doc) {
  const errors = [];
  const validated = { ...doc };

  for (const [field, rules] of Object.entries(schema)) {
    const value = validated[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null) {
      if (rules.default !== undefined) {
        validated[field] = typeof rules.default === 'function' ? rules.default() : rules.default;
      }
      continue;
    }

    if (rules.type === String) {
      validated[field] = String(value);
      if (rules.trim) validated[field] = validated[field].trim();
      if (rules.lowercase) validated[field] = validated[field].toLowerCase();
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    if (rules.match && !rules.match.test(value)) {
      errors.push(`${field} format is invalid`);
    }

    if (rules.minlength && String(value).length < rules.minlength) {
      errors.push(`${field} must be at least ${rules.minlength} characters`);
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.errors = errors;
    throw error;
  }

  return validated;
}

function matchesQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '_id') {
      if (item._id !== value) return false;
    } else if (key.startsWith('$or') || key.startsWith('$and')) {
      continue;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [op, opValue] of Object.entries(value)) {
        if (op === '$gt' && !(item[key] > opValue)) return false;
        else if (op === '$gte' && !(item[key] >= opValue)) return false;
        else if (op === '$lt' && !(item[key] < opValue)) return false;
        else if (op === '$lte' && !(item[key] <= opValue)) return false;
        else if (op === '$ne' && item[key] === opValue) return false;
        else if (op === '$in' && !opValue.includes(item[key])) return false;
        else if (op === '$nin' && opValue.includes(item[key])) return false;
        else if (op === '$regex' && !new RegExp(opValue).test(String(item[key]))) return false;
        else if (op === '$exists' && (item[key] === undefined) === opValue) continue;
        else if (op !== '$options' && item[key] != value) return false;
      }
    } else {
      if (item[key] != value) return false;
    }
  }

  return true;
}

function applyProjection(items, projection) {
  if (!projection) return items;

  let keys = [];
  if (typeof projection === 'string') {
    keys = projection.split(' ').filter(Boolean);
  } else if (typeof projection === 'object') {
    keys = Object.entries(projection).filter(([, v]) => v === 1).map(([k]) => k);
  }

  if (keys.length === 0) return items;

  return items.map(item => {
    const obj = {};
    for (const key of keys) {
      if (item[key] !== undefined) obj[key] = item[key];
    }
    return obj;
  });
}

class Query {
  constructor(model, query, options) {
    this.model = model;
    this.query = query;
    this.options = options || {};
    this._populate = [];
    this._sort = null;
    this._limit = null;
    this._skip = null;
  }

  populate(field, projection) {
    this._populate.push({ path: field, select: projection });
    return this;
  }

  sort(fields) {
    this._sort = fields;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  async exec() {
    let results = getCollection(this.model.name)
      .filter(item => matchesQuery(item, this.query))
      .map(item => createDocument(this.model.name, { ...item }));

    for (const pop of this._populate) {
      results = this.model.populate(results, pop.path, pop.select);
    }

    if (this._sort) {
      const [field, dir] = Object.entries(this._sort)[0];
      results.sort((a, b) => {
        if (a[field] < b[field]) return dir === -1 ? 1 : -1;
        if (a[field] > b[field]) return dir === -1 ? -1 : 1;
        return 0;
      });
    }

    if (this._limit) results = results.slice(0, this._limit);
    if (this._skip) results = results.slice(this._skip);

    return results;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function createModel(collectionName, schema) {
  const model = {
    name: collectionName,
    schema,

    create(doc) {
      const validated = validate(schema, doc);
      const item = {
        ...validated,
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      getCollection(collectionName).push(item);
      saveDb();
      return createDocument(collectionName, item);
    },

    find(query = {}, options) {
      if (typeof query === 'string') {
        options = query;
        query = {};
      }
      return new Query(model, query, options);
    },

    findOne(query = {}) {
      const results = getCollection(collectionName).filter(item => matchesQuery(item, query));
      const item = results[0];
      return item ? createDocument(collectionName, { ...item }) : null;
    },

    findById(id) {
      if (!id) return null;
      const item = getCollection(collectionName).find(item => item._id === id);
      return item ? createDocument(collectionName, { ...item }) : null;
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const collection = getCollection(collectionName);
      const index = collection.findIndex(item => item._id === id);
      if (index === -1) return null;

      let updated;
      if (options.new) {
        updated = { ...collection[index], ...update, updatedAt: new Date().toISOString() };
        collection[index] = updated;
      } else {
        collection[index] = { ...collection[index], ...update, updatedAt: new Date().toISOString() };
        updated = collection[index];
      }

      saveDb();
      return createDocument(collectionName, { ...updated });
    },

    async findByIdAndDelete(id) {
      const collection = getCollection(collectionName);
      const index = collection.findIndex(item => item._id === id);
      if (index === -1) return null;

      const deleted = collection.splice(index, 1)[0];
      saveDb();
      return { ...deleted };
    },

    async countDocuments(query = {}) {
      return getCollection(collectionName).filter(item => matchesQuery(item, query)).length;
    },

    async aggregate(pipeline) {
      let results = getCollection(collectionName).map(item => ({ ...item }));

      for (const stage of pipeline) {
        if (stage.$group) {
          const groups = {};
          for (const item of results) {
            let key;
            if (typeof stage.$group._id === 'string') {
              const fieldPath = stage.$group._id.replace('$', '');
              key = item[fieldPath];
            } else {
              key = stage.$group._id;
            }
            const groupKey = key !== undefined && key !== null ? String(key) : 'null';
            if (!groups[groupKey]) {
              groups[groupKey] = { _id: groupKey };
            }
            for (const [field, op] of Object.entries(stage.$group)) {
              if (field === '_id') continue;
              if (op.$sum === 1) {
                groups[groupKey][field] = (groups[groupKey][field] || 0) + 1;
              } else if (typeof op.$sum === 'string' && op.$sum.startsWith('$')) {
                const sumField = op.$sum.replace('$', '');
                groups[groupKey][field] = (groups[groupKey][field] || 0) + (Number(item[sumField]) || 0);
              }
            }
          }
          results = Object.values(groups);
        }

        if (stage.$sort) {
          const [field, dir] = Object.entries(stage.$sort)[0];
          results.sort((a, b) => {
            if (a[field] < b[field]) return dir === -1 ? 1 : -1;
            if (a[field] > b[field]) return dir === -1 ? -1 : 1;
            return 0;
          });
        }

        if (stage.$limit) {
          results = results.slice(0, stage.$limit);
        }

        if (stage.$skip) {
          results = results.slice(stage.$skip);
        }
      }

      return results;
    },

    populate(results, path, select) {
      const refName = populateRefs[path];
      if (!refName) return results;

      const refCollection = getCollection(refName);
      if (!refCollection) return results;

      return results.map(item => {
        const value = item[path];
        if (!value && value !== '') return item;

        const ids = Array.isArray(value) ? value : [value];
        const refs = refCollection.filter(ref => ids.includes(ref._id));

        if (select) {
          const keys = String(select).split(' ').filter(Boolean);
          const filtered = refs.map(ref => {
            const obj = {};
            for (const key of keys) {
              if (ref[key] !== undefined) obj[key] = ref[key];
            }
            return obj;
          });
          return { ...item, [path]: Array.isArray(value) ? filtered : filtered[0] };
        }

        return { ...item, [path]: Array.isArray(value) ? refs : refs[0] };
      });
    },
  };

  models[collectionName] = model;
  return model;
}

module.exports = {
  init,
  createModel,
  generateId,
  getCollection,
  saveDb,
  models,
  isVercel,
};
