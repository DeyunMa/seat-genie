/**
 * Storage service - SQLite-based implementation
 * Compatible API layer for migration from localStorage
 */

import {
    getAll,
    getActive,
    getById,
    insertRow,
    updateRow,
    deleteRow,
    selectQuery,
    runQuery,
    hasData,
    forceSave
} from './sqliteService'

const STORAGE_PREFIX = 'seat_genie_'

// Table mapping for storage keys
const TABLE_MAP = {
    'users': 'users',
    'rooms': 'rooms',
    'seats': 'seats',
    'books': 'books',
    'seat_reservations': 'seat_reservations',
    'book_borrowings': 'book_borrowings'
}

// Storage wrapper (SQLite-backed)
export const storage = {
    get: (key) => {
        try {
            const table = TABLE_MAP[key]
            if (table) {
                return getAll(table)
            }
            // For simple key-value (like 'initialized')
            const results = selectQuery(
                'SELECT value FROM metadata WHERE key = ?',
                [STORAGE_PREFIX + key]
            )
            if (results.length > 0) {
                try {
                    return JSON.parse(results[0].value)
                } catch {
                    return results[0].value
                }
            }
            return null
        } catch (error) {
            console.error(`Error reading ${key} from SQLite:`, error)
            return null
        }
    },

    set: (key, value) => {
        try {
            const table = TABLE_MAP[key]
            if (table) {
                // For array data, replace all rows
                runQuery(`DELETE FROM ${table}`)
                if (Array.isArray(value)) {
                    value.forEach(item => insertRow(table, item))
                }
                return true
            }
            // For simple key-value storage
            runQuery(`
                CREATE TABLE IF NOT EXISTS metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
            `)
            runQuery(
                'INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)',
                [STORAGE_PREFIX + key, JSON.stringify(value)]
            )
            return true
        } catch (error) {
            console.error(`Error writing ${key} to SQLite:`, error)
            return false
        }
    },

    remove: (key) => {
        try {
            const table = TABLE_MAP[key]
            if (table) {
                runQuery(`DELETE FROM ${table}`)
                return true
            }
            runQuery('DELETE FROM metadata WHERE key = ?', [STORAGE_PREFIX + key])
            return true
        } catch (error) {
            console.error(`Error removing ${key} from SQLite:`, error)
            return false
        }
    },

    clear: () => {
        try {
            Object.values(TABLE_MAP).forEach(table => {
                runQuery(`DELETE FROM ${table}`)
            })
            runQuery('DELETE FROM metadata')
            return true
        } catch (error) {
            console.error('Error clearing SQLite:', error)
            return false
        }
    }
}

// CRUD operations for entities
export const createEntity = (entityKey, entity) => {
    const table = TABLE_MAP[entityKey]
    if (table) {
        insertRow(table, entity)
        return entity
    }
    return null
}

export const getEntities = (entityKey) => {
    const table = TABLE_MAP[entityKey]
    return table ? getAll(table) : []
}

export const getEntityById = (entityKey, id) => {
    const table = TABLE_MAP[entityKey]
    return table ? getById(table, id) : null
}

export const updateEntity = (entityKey, id, updates) => {
    const table = TABLE_MAP[entityKey]
    if (table) {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() }
        updateRow(table, id, updatedData)
        return getById(table, id)
    }
    return null
}

export const deleteEntity = (entityKey, id, softDelete = true) => {
    const table = TABLE_MAP[entityKey]
    if (table) {
        return deleteRow(table, id, softDelete)
    }
    return false
}

// Query helpers
export const queryEntities = (entityKey, predicate) => {
    const entities = getEntities(entityKey)
    return entities.filter(predicate)
}

export const getActiveEntities = (entityKey) => {
    const table = TABLE_MAP[entityKey]
    return table ? getActive(table) : []
}

// Check if initialized
export const isInitialized = () => {
    try {
        return hasData('users')
    } catch {
        return false
    }
}

// Force persistence
export const persistData = () => forceSave()
