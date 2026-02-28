const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const app = express();
app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "suraj3690",
    port: 3306
});

//print table as pdf
app.get("/export-pdf", async (req, res) => {

    const { databaseName, tableName } = req.query;

    if (!databaseName || !tableName) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    const safeDb = mysql.escapeId(databaseName);
    const safeTable = mysql.escapeId(tableName);

    try {

        const [rows] = await db.promise().query(
            `SELECT * FROM ${safeDb}.${safeTable}`
        );

        const doc = new PDFDocument({ margin: 40, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${tableName}.pdf`
        );

        doc.pipe(res);

        // ================= TITLE =================
        doc
            .font("Helvetica-Bold")
            .fontSize(18)
            .fillColor("black")
            .text(`Table: ${tableName}`);

        doc.moveDown(1);

        if (rows.length === 0) {
            doc.fontSize(12).text("No data available");
            doc.end();
            return;
        }

        const columns = Object.keys(rows[0]);

        const pageWidth =
            doc.page.width - doc.page.margins.left - doc.page.margins.right;

        const columnWidth = pageWidth / columns.length;

        const cellPadding = 4;

        let y = doc.y;

        // ================= DRAW HEADER FUNCTION =================
        function drawHeader() {

            let maxHeaderHeight = 4;

            // Calculate dynamic header height
            columns.forEach(column => {

                const headerHeight = doc.heightOfString(
                    column,
                    {
                        width: columnWidth - cellPadding * 6,
                        align: "center"
                    }
                );

                if (headerHeight + 4 > maxHeaderHeight) {
                    maxHeaderHeight = headerHeight + 4;
                }
            });

            columns.forEach((column, i) => {

                const x = doc.page.margins.left + i * columnWidth;

                // Blue background
                doc
                    .rect(x, y, columnWidth, maxHeaderHeight)
                    .fill("#2a6099");

                // Border
                doc
                    .rect(x, y, columnWidth, maxHeaderHeight)
                    .stroke();

                // Header text
                doc
                    .fillColor("white")
                    .font("Helvetica-Bold")
                    .fontSize(12)
                    .text(
                        column,
                        x + cellPadding,
                        y + (maxHeaderHeight / 3) - 3,
                        {
                            width: columnWidth - cellPadding * 2,
                            align: "center"
                        }
                    );
            });

            y += maxHeaderHeight;
        }

        drawHeader();

        // ================= BODY =================

        rows.forEach((row, rowIndex) => {

            let maxRowHeight = 20;

            // Calculate dynamic height
            columns.forEach(column => {

                const text = row[column] == null ? "" : String(row[column]);

                const textHeight = doc.heightOfString(
                    text,
                    {
                        width: columnWidth - cellPadding * 2,
                        align: "center"
                    }
                );

                if (textHeight + 10 > maxRowHeight) {
                    maxRowHeight = textHeight + 10;
                }
            });

            // Page break BEFORE drawing row
            if (y + maxRowHeight > doc.page.height - 40) {
                doc.addPage();
                y = doc.page.margins.top;
                drawHeader();
                doc.moveDown(0.5);
            }

            columns.forEach((column, colIndex) => {

                const x =
                    doc.page.margins.left +
                    colIndex * columnWidth;

                const isEven = rowIndex % 2 === 0;

                // Row background
                doc
                    .rect(x, y, columnWidth, maxRowHeight)
                    .fill(isEven ? "white" : "#dee6ef");

                doc
                    .rect(x, y, columnWidth, maxRowHeight)
                    .stroke();

                const value =
                    row[column] == null ? "" : String(row[column]);

                doc
                    .fillColor("black")
                    .font("Helvetica")
                    .fontSize(12)
                    .text(
                        value,
                        x + cellPadding,
                        y + 8,
                        {
                            width: columnWidth - cellPadding * 2,
                            align: "center"
                        }
                    );
            });

            y += maxRowHeight;
        });

        doc.end();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// // Update table structure (rename, add, drop, modify columns)
// app.post("/update-columns", async (req, res) => {

//     const { DatabaseName, original, updated } = req.body;

//     if (!DatabaseName || !original || !updated) {
//         return res.status(400).json({ error: "Missing update data" });
//     }

//     const safeDb = mysql.escapeId(DatabaseName);
//     const safeOldTable = mysql.escapeId(original.TableName);
//     const safeNewTable = mysql.escapeId(updated.TableName);

//     try {

//         // 1️⃣ Rename table if changed
//         if (original.TableName !== updated.TableName) {
//             await db.promise().query(
//                 `RENAME TABLE ${safeDb}.${safeOldTable} TO ${safeDb}.${safeNewTable}`
//             );
//         }

//         const tableRef = `${safeDb}.${safeNewTable}`;

//         const alterQueries = [];

//         const oldColumns = original.Columns;
//         const newColumns = updated.Columns;

//         const oldNames = oldColumns.map(c => c.columnName);
//         const newNames = newColumns.map(c => c.ColumnName);

//         // 2️⃣ Drop removed columns
//         for (let oldCol of oldNames) {
//             if (!newNames.includes(oldCol)) {
//                 alterQueries.push(
//                     `DROP COLUMN ${mysql.escapeId(oldCol)}`
//                 );
//             }
//         }

//         // 3️⃣ Process add / modify / rename
//         for (let i = 0; i < newColumns.length; i++) {

//             const newCol = newColumns[i];
//             const oldCol = oldColumns[i];

//             const newName = newCol.ColumnName;
//             const oldName = oldCol ? oldCol.columnName : null;

//             let type = newCol.DataType.replace(/\(.*\)/, "");
//             let size = newCol.Size ? `(${newCol.Size})` : "";

//             let columnSQL =
//                 `${mysql.escapeId(newName)} ${type}${size}`;

//             if (newCol.Unsigned) columnSQL += " UNSIGNED";
//             if (newCol.NotNull) columnSQL += " NOT NULL";
//             if (newCol.AutoIncrement) columnSQL += " AUTO_INCREMENT";
//             if (newCol.Expression)
//                 columnSQL += ` DEFAULT '${newCol.Expression}'`;

//             // 🔹 New column
//             if (!oldName || !oldNames.includes(newName)) {
//                 alterQueries.push(`ADD COLUMN ${columnSQL}`);
//                 continue;
//             }

//             // 🔹 Rename column
//             if (oldName !== newName) {
//                 alterQueries.push(
//                     `CHANGE COLUMN ${mysql.escapeId(oldName)} ${columnSQL}`
//                 );
//                 continue;
//             }

//             // 🔹 Modify existing column
//             alterQueries.push(
//                 `MODIFY COLUMN ${columnSQL}`
//             );
//         }

//         // 4️⃣ Drop existing primary key
//         await db.promise().query(
//             `ALTER TABLE ${tableRef} DROP PRIMARY KEY`
//         ).catch(() => {});

//         // 5️⃣ Add new primary key
//         const pkColumn = newColumns.find(c => c.PrimaryKey);
//         if (pkColumn) {
//             alterQueries.push(
//                 `ADD PRIMARY KEY (${mysql.escapeId(pkColumn.ColumnName)})`
//             );
//         }

//         if (alterQueries.length === 0) {
//             return res.json({ message: "No changes detected" });
//         }

//         const finalSQL = `
//             ALTER TABLE ${tableRef}
//             ${alterQueries.join(",\n")}
//         `;

//         await db.promise().query(finalSQL);

//         res.json({ message: "Table updated successfully" });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// Delete column safely (drop constraints first)
// app.get("/DeleteColumn", async (req, res) => {
//     const { databaseName, tableName, columnName } = req.query;
//     if (!databaseName || !tableName || !columnName) {
//         return res.status(400).json({ error: "Missing parameters" });
//     }
//     if (!/^[a-zA-Z0-9_]+$/.test(databaseName) || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
//         return res.status(400).json({ error: "Invalid database or table name" });
//     }
//     const safeDb = mysql.escapeId(databaseName);
//     const safeTable = mysql.escapeId(tableName);
//     const safeColumn = mysql.escapeId(columnName);
//     try {
//         const pkQuery = `
//             SELECT CONSTRAINT_NAME
//             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
//             WHERE TABLE_SCHEMA = ?
//             AND TABLE_NAME = ?
//             AND COLUMN_NAME = ?
//             AND CONSTRAINT_NAME = 'PRIMARY'
//         `;
//         const [pkResult] = await db.promise().query(pkQuery, [databaseName, tableName, columnName]);
//         if (pkResult.length > 0) {
//             await db.promise().query(
//                 `ALTER TABLE ${safeDb}.${safeTable} DROP PRIMARY KEY`
//             );
//         }
//         const fkQuery = `
//             SELECT CONSTRAINT_NAME
//             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
//             WHERE TABLE_SCHEMA = ?
//             AND TABLE_NAME = ?
//             AND COLUMN_NAME = ?
//             AND REFERENCED_TABLE_NAME IS NOT NULL
//         `;
//         const [fkResult] = await db.promise().query(fkQuery, [databaseName, tableName, columnName]);
//         for (let fk of fkResult) {
//             await db.promise().query(
//                 `ALTER TABLE ${safeDb}.${safeTable} DROP FOREIGN KEY ${mysql.escapeId(fk.CONSTRAINT_NAME)}`
//             );
//         }
//         const uniqueQuery = `
//             SELECT INDEX_NAME
//             FROM INFORMATION_SCHEMA.STATISTICS
//             WHERE TABLE_SCHEMA = ?
//             AND TABLE_NAME = ?
//             AND COLUMN_NAME = ?
//             AND NON_UNIQUE = 0
//             AND INDEX_NAME != 'PRIMARY'
//         `;
//         const [uniqueResult] = await db.promise().query(uniqueQuery, [databaseName, tableName, columnName]);
//         for (let index of uniqueResult) {
//             await db.promise().query(
//                 `ALTER TABLE ${safeDb}.${safeTable} DROP INDEX ${mysql.escapeId(index.INDEX_NAME)}`
//             );
//         }
//         await db.promise().query(
//             `ALTER TABLE ${safeDb}.${safeTable} DROP COLUMN ${safeColumn}`
//         );
//         res.json({ message: "Column deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// fetch full structured table schema
// app.get("/TableSchema", (req, res) => {
//     const { databaseName, tableName } = req.query;
//     if (!databaseName || !tableName) {
//         return res.status(400).json({ error: "Missing parameters" });
//     }
//     if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
//         !/^[a-zA-Z0-9_]+$/.test(tableName)) {
//         return res.status(400).json({ error: "Invalid name" });
//     }
//     const sql = `
//         SELECT 
//             c.COLUMN_NAME,
//             c.DATA_TYPE,
//             c.COLUMN_TYPE,
//             c.CHARACTER_MAXIMUM_LENGTH,
//             c.NUMERIC_PRECISION,
//             c.IS_NULLABLE,
//             c.COLUMN_DEFAULT,
//             c.EXTRA,
//             tc.CONSTRAINT_TYPE
//         FROM INFORMATION_SCHEMA.COLUMNS c
//         LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
//             ON c.TABLE_SCHEMA = k.TABLE_SCHEMA
//             AND c.TABLE_NAME = k.TABLE_NAME
//             AND c.COLUMN_NAME = k.COLUMN_NAME
//         LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
//             ON k.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
//             AND k.TABLE_SCHEMA = tc.TABLE_SCHEMA
//             AND k.TABLE_NAME = tc.TABLE_NAME
//         WHERE c.TABLE_SCHEMA = ?
//         AND c.TABLE_NAME = ?
//         ORDER BY c.ORDINAL_POSITION
//     `;
//     db.query(sql, [databaseName, tableName], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         const columns = results.map(col => {
//             const isPrimary = col.CONSTRAINT_TYPE === "PRIMARY KEY";
//             const isUnique = col.CONSTRAINT_TYPE === "UNIQUE";
//             return {
//                 columnName: col.COLUMN_NAME,
//                 dataType: col.DATA_TYPE.toUpperCase(),
//                 size:
//                     col.CHARACTER_MAXIMUM_LENGTH ||
//                     col.NUMERIC_PRECISION ||
//                     null,
//                 primaryKey: isPrimary,
//                 // PRIMARY KEY automatically means UNIQUE
//                 unique: isPrimary || isUnique,
//                 notNull: col.IS_NULLABLE === "NO",
//                 unsigned: col.COLUMN_TYPE.includes("unsigned"),
//                 autoIncrement: col.EXTRA.includes("auto_increment"),
//                 defaultValue: col.COLUMN_DEFAULT
//             };
//         });
//         // return ONLY columns
//         res.json(columns);
//     });
// });

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

app.get("/SelectedTableMeta", async (req, res) => {

    try {

        const raw = req.query.selectQueryStructure;
        if (!raw) {
            return res.status(400).json({ error: "Missing query structure" });
        }

        const parsed = JSON.parse(raw);

        const { databaseName, from } = parsed;
        console.log(databaseName, from);
        if (!databaseName || !from) {
            return res.status(400).json({ error: "Missing database or table" });
        }

        // extract table name (db.table)
        const tableName = from.includes(".")
            ? from.split(".")[1]
            : from;

        if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
            !/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return res.status(400).json({ error: "Invalid name" });
        }

        const sql = `
            SELECT 
                c.COLUMN_NAME,
                c.DATA_TYPE,
                c.IS_NULLABLE,
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

        const [results] = await db.promise().query(sql, [databaseName, tableName]);

        res.json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

app.get("/SelectedTableData", async (req, res) => {

    try {

        const raw = req.query.selectQueryStructure;
        if (!raw) {
            return res.status(400).json({ error: "Missing query structure" });
        }

        const parsed = JSON.parse(raw);

        let {
            databaseName,
            select,
            from,
            where,
            groupBy,
            having,
            orderBy,
            limit
        } = parsed;

        if (!databaseName || !from) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const tableName = from.includes(".")
            ? from.split(".")[1]
            : from;

        if (!/^[a-zA-Z0-9_]+$/.test(databaseName) ||
            !/^[a-zA-Z0-9_]+$/.test(tableName)) {
            return res.status(400).json({ error: "Invalid name" });
        }

        const safeDb = mysql.escapeId(databaseName);
        const safeTable = mysql.escapeId(tableName);

        // Default select
        if (!select || select.trim() === "") {
            select = "*";
        }

        let sql = `SELECT ${select} FROM ${safeDb}.${safeTable}`;

        if (where && where.trim() !== "") {
            sql += ` WHERE ${where}`;
        }

        if (groupBy && groupBy.trim() !== "") {
            sql += ` GROUP BY ${groupBy}`;
        }

        if (having && having.trim() !== "") {
            sql += ` HAVING ${having}`;
        }

        if (orderBy && orderBy.trim() !== "") {
            sql += ` ORDER BY ${orderBy}`;
        }

        if (limit && Number(limit) > 0) {
            sql += ` LIMIT ${Number(limit)}`;
        }

        const [results] = await db.promise().query(sql);

        res.json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

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