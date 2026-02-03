/**
 * Browser Storage Service - localStorage-based with SQL-like API
 * Provides reliable persistence for Vercel deployment
 */

const DB_PREFIX = 'seat_genie_'

// In-memory cache
const cache = {}

// Load data from localStorage into cache
const loadTable = (table) => {
    if (cache[table] !== undefined) return cache[table]
    try {
        const data = localStorage.getItem(DB_PREFIX + table)
        cache[table] = data ? JSON.parse(data) : []
        return cache[table]
    } catch (error) {
        console.error(`Error loading ${table}:`, error)
        cache[table] = []
        return []
    }
}

// Save table to localStorage
const saveTable = (table) => {
    try {
        localStorage.setItem(DB_PREFIX + table, JSON.stringify(cache[table] || []))
    } catch (error) {
        console.error(`Error saving ${table}:`, error)
    }
}

// Initialize database (load all tables into cache)
export const initDatabase = async () => {
    const tables = ['users', 'rooms', 'seats', 'books', 'seat_reservations', 'book_borrowings', 'notifications', 'notification_reads']
    tables.forEach(table => loadTable(table))
    console.log('Database initialized from localStorage')
    return true
}

// Check if database is ready
export const isDatabaseReady = () => true

// Execute SELECT query (simple implementation)
export const selectQuery = (sql, params = []) => {
    // Parse simple SELECT queries
    const fromMatch = sql.match(/FROM\s+(\w+)/i)
    if (!fromMatch) return []

    const table = fromMatch[1]
    let data = [...loadTable(table)]

    // Handle WHERE clause
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/is)
    if (whereMatch && params.length > 0) {
        const whereClause = whereMatch[1].trim()
        data = data.filter(row => {
            return evaluateWhere(row, whereClause, params)
        })
    }

    return data
}

// Simple WHERE clause evaluator
const evaluateWhere = (row, whereClause, params) => {
    // Handle simple conditions like "column = ?" or "column = ? AND column2 = ?"
    let paramIndex = 0
    let result = true

    // Split by AND
    const conditions = whereClause.split(/\s+AND\s+/i)

    for (const condition of conditions) {
        const match = condition.match(/(\w+)\s*(=|<|>|<=|>=|!=)\s*\?/i)
        if (match) {
            const [, column, operator] = match
            const value = params[paramIndex++]
            const rowValue = row[column]

            switch (operator) {
                case '=': result = result && rowValue == value; break
                case '!=': result = result && rowValue != value; break
                case '<': result = result && rowValue < value; break
                case '>': result = result && rowValue > value; break
                case '<=': result = result && rowValue <= value; break
                case '>=': result = result && rowValue >= value; break
            }
        }
    }

    return result
}

// Run query (for INSERT, UPDATE, DELETE)
export const runQuery = (sql, params = []) => {
    try {
        // INSERT
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
            const tableMatch = sql.match(/INTO\s+(\w+)/i)
            if (tableMatch) {
                const table = tableMatch[1]
                const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i)
                if (columnsMatch) {
                    const columns = columnsMatch[1].split(',').map(c => c.trim())
                    const row = {}
                    columns.forEach((col, i) => row[col] = params[i])
                    const data = loadTable(table)
                    data.push(row)
                    cache[table] = data
                    saveTable(table)
                }
            }
            return true
        }

        // UPDATE
        if (sql.trim().toUpperCase().startsWith('UPDATE')) {
            const tableMatch = sql.match(/UPDATE\s+(\w+)/i)
            if (tableMatch) {
                const table = tableMatch[1]
                const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i)
                const whereMatch = sql.match(/WHERE\s+id\s*=\s*\?/i)

                if (setMatch && whereMatch) {
                    const setParts = setMatch[1].split(',').map(s => {
                        const m = s.trim().match(/(\w+)\s*=\s*\?/)
                        return m ? m[1] : null
                    }).filter(Boolean)

                    const id = params[params.length - 1]
                    const data = loadTable(table)
                    const index = data.findIndex(r => r.id === id)

                    if (index !== -1) {
                        setParts.forEach((col, i) => {
                            data[index][col] = params[i]
                        })
                        cache[table] = data
                        saveTable(table)
                    }
                }
            }
            return true
        }

        // DELETE
        if (sql.trim().toUpperCase().startsWith('DELETE')) {
            const tableMatch = sql.match(/FROM\s+(\w+)/i)
            if (tableMatch) {
                const table = tableMatch[1]
                const id = params[0]
                const data = loadTable(table)
                cache[table] = data.filter(r => r.id !== id)
                saveTable(table)
            }
            return true
        }

        // CREATE TABLE - ignore (we don't need schema)
        if (sql.trim().toUpperCase().startsWith('CREATE')) {
            return true
        }

        return true
    } catch (error) {
        console.error('Query error:', error, sql)
        return false
    }
}

// Insert a row
export const insertRow = (table, data) => {
    const tableData = loadTable(table)
    tableData.push(data)
    cache[table] = tableData
    saveTable(table)
    return data
}

// Update a row by id
export const updateRow = (table, id, updates) => {
    const data = loadTable(table)
    const index = data.findIndex(r => r.id === id)
    if (index !== -1) {
        data[index] = { ...data[index], ...updates }
        cache[table] = data
        saveTable(table)
        return true
    }
    return false
}

// Delete a row by id
export const deleteRow = (table, id, softDelete = true) => {
    if (softDelete) {
        return updateRow(table, id, {
            activeStatus: 'N',
            updatedAt: new Date().toISOString()
        })
    }
    const data = loadTable(table)
    cache[table] = data.filter(r => r.id !== id)
    saveTable(table)
    return true
}

// Get all rows from a table
export const getAll = (table) => {
    return [...loadTable(table)]
}

// Get active rows from a table
export const getActive = (table) => {
    return loadTable(table).filter(r => r.activeStatus === 'Y')
}

// Get row by id
export const getById = (table, id) => {
    return loadTable(table).find(r => r.id === id) || null
}

// Check if data exists
export const hasData = (table) => {
    return loadTable(table).length > 0
}

// Force save all tables
export const forceSave = () => {
    Object.keys(cache).forEach(table => saveTable(table))
}

// Export for debugging
export const exportDatabase = () => {
    return { ...cache }
}
