const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "suraj3690",
    port: 3306
});

// fetch full structured table schema
app.get("/TableSchema", (req, res) => {

    const { databaseName, tableName } = req.query;

    if (!databaseName || !tableName) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
        !/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid name" });
    }

    const sql = `
        SELECT 
            c.COLUMN_NAME,
            c.DATA_TYPE,
            c.COLUMN_TYPE,
            c.CHARACTER_MAXIMUM_LENGTH,
            c.NUMERIC_PRECISION,
            c.IS_NULLABLE,
            c.COLUMN_DEFAULT,
            c.EXTRA,
            tc.CONSTRAINT_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
            ON c.TABLE_SCHEMA = k.TABLE_SCHEMA
            AND c.TABLE_NAME = k.TABLE_NAME
            AND c.COLUMN_NAME = k.COLUMN_NAME
        LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            ON k.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
            AND k.TABLE_SCHEMA = tc.TABLE_SCHEMA
            AND k.TABLE_NAME = tc.TABLE_NAME
        WHERE c.TABLE_SCHEMA = ?
        AND c.TABLE_NAME = ?
        ORDER BY c.ORDINAL_POSITION
    `;

    db.query(sql, [databaseName, tableName], (err, results) => {

    if (err) {
        return res.status(500).json({ error: err.message });
    }

    const columns = results.map(col => {

        const isPrimary = col.CONSTRAINT_TYPE === "PRIMARY KEY";
        const isUnique = col.CONSTRAINT_TYPE === "UNIQUE";

        return {
            columnName: col.COLUMN_NAME,

            dataType: col.DATA_TYPE.toUpperCase(),

            size:
                col.CHARACTER_MAXIMUM_LENGTH ||
                col.NUMERIC_PRECISION ||
                null,

            primaryKey: isPrimary,

            // PRIMARY KEY automatically means UNIQUE
            unique: isPrimary || isUnique,

            notNull: col.IS_NULLABLE === "NO",

            unsigned: col.COLUMN_TYPE.includes("unsigned"),

            autoIncrement: col.EXTRA.includes("auto_increment"),

            defaultValue: col.COLUMN_DEFAULT
        };
    });

    // return ONLY columns
    res.json(columns);
});
});

// update existing data in row based on primary key
app.post("/update-data", (req, res) => {

    const { databaseName, tableName, columns, values, pkColumnName, pkValue } = req.body;

    if (!databaseName || !tableName || !columns || !values || !pkColumnName || pkValue === undefined) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    if (!Array.isArray(columns) || !Array.isArray(values)) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    if (columns.length !== values.length) {
        return res.status(400).json({ error: "Columns and values mismatch" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
        !/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid name" });
    }

    const safeDb = mysql.escapeId(databaseName);
    const safeTable = mysql.escapeId(tableName);

    const setClause = columns
        .map(col => `${mysql.escapeId(col)} = ?`)
        .join(", ");

    const safePkColumn = mysql.escapeId(pkColumnName);

    const updateQuery = `
        UPDATE ${safeDb}.${safeTable}
        SET ${setClause}
        WHERE ${safePkColumn} = ?
    `;

    const queryValues = [...values, pkValue];

    db.query(updateQuery, queryValues, (err2, result) => {
        if (err2) {
            return res.status(500).json({ error: err2.message });
        }
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No row updated" });
        }
        res.json({ message: "Row updated successfully" });
    });
});

// insert data in new whole row
app.post("/insert-row", (req, res) => {

    const { databaseName, tableName, columns, values } = req.body;

    if (!databaseName || !tableName || !columns || !values) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    if (!Array.isArray(columns) || !Array.isArray(values)) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    if (columns.length !== values.length) {
        return res.status(400).json({ error: "Columns and values mismatch" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
        !/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid name" });
    }

    const safeDb = mysql.escapeId(databaseName);
    const safeTable = mysql.escapeId(tableName);

    const escapedColumns = columns.map(col => mysql.escapeId(col)).join(", ");

    const placeholders = columns.map(() => "?").join(", ");

    const insertQuery = `
        INSERT INTO ${safeDb}.${safeTable}
        (${escapedColumns})
        VALUES (${placeholders})
    `;

    db.query(insertQuery, values, (err, result) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Row inserted successfully" });
    });
});

// delete data of whole row
app.post("/delete-row", (req, res) => {
    const { databaseName, tableName, pkColumnName, pkValue } = req.body;

    console.log(databaseName, tableName, pkValue);
    if (!databaseName || !tableName || !pkValue || !pkColumnName) {
        return res.status(400).json({ error: "Missing parameters" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
        !/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid name" });
    }

    const safeDb = mysql.escapeId(databaseName);
    const safeTable = mysql.escapeId(tableName);
    const safePkColumn = mysql.escapeId(pkColumnName);

    const deleteQuery = `
        DELETE FROM ${safeDb}.${safeTable}
        WHERE ${safePkColumn} = ?
    `;

    db.query(deleteQuery, [pkValue], (err2) => {
        if (err2) {
            return res.status(500).json({ error: err2.message });
        }

        res.json({ message: "Row deleted successfully" });
    });
});

app.get("/TableMeta", (req, res) => {
    const { databaseName, tableName } = req.query;

    const sql = `
        SELECT 
            c.COLUMN_NAME,
            c.DATA_TYPE,
            c.IS_NULLABLE,
            k.CONSTRAINT_NAME,
            t.CONSTRAINT_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
            ON c.TABLE_SCHEMA = k.TABLE_SCHEMA
            AND c.TABLE_NAME = k.TABLE_NAME
            AND c.COLUMN_NAME = k.COLUMN_NAME
        LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS t
            ON k.CONSTRAINT_NAME = t.CONSTRAINT_NAME
            AND k.TABLE_SCHEMA = t.TABLE_SCHEMA
            AND k.TABLE_NAME = t.TABLE_NAME
        WHERE c.TABLE_SCHEMA = ?
        AND c.TABLE_NAME = ?
        ORDER BY c.ORDINAL_POSITION
    `;

    db.query(sql, [databaseName, tableName], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

//fetch table logic
app.get("/TableData", (req, res) => {
    const { databaseName, tableName } = req.query;
    if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
        return res.status(400).json({ error: "Invalid database name" });
    }

    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid table name" });
    }

    const safeDbName = mysql.escapeId(databaseName);
    const safeTableName = mysql.escapeId(tableName);
    const sql = `SELECT * FROM ${safeDbName}.${safeTableName}`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Table data fetch query failed" });
        }

        res.json(results);
    });
});

app.post("/execute", (req, res) => {
    const query = req.body.query;
    if (!query) {
        return res.status(400).json({ error: "Query is empty" });
    }

    db.query(query, (err, result) => {
        if (err) {
            return res.json({ error: err.message });
        }

        res.json({ result });
    });
});

// table creation
app.post("/create-table", (req, res) => {
    const { databaseName, tableName, columns } = req.body;
    if (!databaseName || !tableName || !columns.length) {
        return res.status(400).json({ error: "Missing table data" });
    }

    const safeDb = mysql.escapeId(databaseName);
    const safeTable = mysql.escapeId(tableName);

    let columnDefinitions = columns.map(col => {
        let type = col.dataType.replace(/\(.*\)/, "");
        let size = col.size ? `(${col.size})` : "";
        let sql = `${mysql.escapeId(col.columnName)} ${type}${size}`;

        if (col.unsigned) sql += " UNSIGNED";
        if (col.notNull) sql += " NOT NULL";
        if (col.unique) sql += " UNIQUE";
        if (col.autoIncrement) sql += " AUTO_INCREMENT";
        if (col.expression) sql += ` DEFAULT '${col.expression}'`;
        return sql;
    });

    // Add PRIMARY KEY separately
    const pkColumn = columns.find(col => col.primaryKey);
    if (pkColumn) {
        columnDefinitions.push(`PRIMARY KEY (${mysql.escapeId(pkColumn.columnName)})`);
    }

    const sql = `
        CREATE TABLE ${safeDb}.${safeTable} (
            ${columnDefinitions.join(",\n")}
        )
    `;

    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Table created successfully" });
    });
});

// Delete table
app.post("/delete-Table", (req, res) => {
    const { TbName, databaseName } = req.body;
    console.log(TbName, databaseName);
    if (!TbName || !databaseName) {
        return res.status(400).json({ error: "table and database required" });
    }

    const safeDb = mysql.escapeId(databaseName);
    const safeTb = mysql.escapeId(TbName);

    const sql = `DROP TABLE IF EXISTS ${safeDb}.${safeTb}`;
    db.query(sql, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "table deletion failed"
            });
        }

        res.json({
            message: "table deleted successfully"
        });
    });
});

//fetch table logic
app.get("/Tables", (req, res) => {
    const { databaseName } = req.query;
    if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
        return res.status(400).json({ error: "Invalid database name" });
    }

    const safeDbName = mysql.escapeId(databaseName);
    const sql = `SHOW TABLES FROM ${safeDbName}`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Table query failed" });
        }
        res.json(results);
    });
});

// Delete database
app.post("/delete-database", (req, res) => {
    const { dbNameForDel } = req.body;
    if (!dbNameForDel) {
        return res.status(400).json({ error: "Database name required" });
    }

    const systemDBs = [
        "mysql",
        "information_schema",
        "performance_schema",
        "sys",
        "world",
        "sakila",
        "inventory_db"
    ];
    if (systemDBs.includes(dbNameForDel)) {
        return res.status(403).json({
            error: "System databases cannot be deleted"
        });
    }

    const validName = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
    if (!validName.test(dbNameForDel)) {
        return res.status(400).json({ error: "Invalid database name" });
    }

    const safeDbName = mysql.escapeId(dbNameForDel);
    const sql = `DROP DATABASE IF EXISTS ${safeDbName}`;
    db.query(sql, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Database deletion failed"
            });
        }

        res.json({
            message: "Database deleted successfully"
        });
    });
});
//fetch databases logic
app.get("/databases", (req, res) => {
    const systemDBs = [
        "mysql",
        "information_schema",
        "performance_schema",
        "sys",
    ];

    db.query("SHOW DATABASES", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database query failed" });
        }

        const userDatabases = results.filter(
            db => !systemDBs.includes(db.Database)
        );
        res.json(userDatabases);
    });
});

// Create a new database logic
app.post("/create-database", (req, res) => {
    const { dbName } = req.body;
    if (!dbName) {
        return res.status(400).json({ error: "Database name required" });
    }

    const validName = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
    if (!validName.test(dbName)) {
        return res.status(400).json({ error: "Invalid database name" });
    }

    const safeDbName = mysql.escapeId(dbName);
    const sql = `CREATE DATABASE IF NOT EXISTS ${safeDbName}`;

    db.query(sql, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database creation failed" });
        }
        res.json({ message: "Database created successfully" });
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
