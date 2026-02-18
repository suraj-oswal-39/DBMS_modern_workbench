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
// Create table
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
        "world",
        "sakila",
        "inventory_db"
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
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
