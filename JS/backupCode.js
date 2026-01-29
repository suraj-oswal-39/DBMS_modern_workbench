console.log("JavaScript file is linked successfully.");
// function reloadPage() {
//     if (window.reloadRoute) {
//         console.log("reload page");
//         window.reloadRoute();
//     }
// }
let databaseName = "";
function removeStyle(nameInput, addSvg, tooltip, red, yellow, NameInput, SvgGridTemplate, CloseCross) {
    nameInput.value = "";
    addSvg.removeAttribute("style");
    tooltip.removeAttribute("style");
    red.removeAttribute("style");
    yellow.removeAttribute("style");
    SvgGridTemplate.removeAttribute("style");
    NameInput.removeAttribute("style");
    CloseCross.removeAttribute("style");
}
function fetchDatabases(SvgGridTemplate) {
    fetch("http://localhost:8080/databases", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(data =>
            data.forEach(function (db) {
                newDBSvg = document.createElement("div");
                newDBSvg.classList.add("SvgBlock");
                newDBSvg.setAttribute("id", `${db.Database}Svg`);
                newDBSvg.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" pointer-events="all" id="${db.Database}">
	            <defs>
	            	<linearGradient id="${db.Database}SvgGrow" x1="100%" y1="100%" x2="0%" y2="0%">
	            		<stop offset="0%" class="red"/>
	            		<stop offset="100%" class="yellow"/>
	            	</linearGradient>
	            </defs>
	            <style>
                    #${db.Database} {
                        background:
                            linear-gradient(#060000, #060000) padding-box,
                            linear-gradient(145deg, #060000, #060000) border-box;
                        border: 0.3rem solid transparent;
                        border-radius: 1rem;
                        padding: 0.5em;
                    }

                    #${db.Database}:hover {
                        background:
                            linear-gradient(#060000, #060000) padding-box,
                            linear-gradient(145deg, #ffff00, #ff0000) border-box;
                    }

	            	#${db.Database} .red {
	            		stop-color: #303030;
	            	}

	            	#${db.Database} .yellow {
	            		stop-color: #303030;
	            	}

	            	#${db.Database}:hover .red {
	            		stop-color: #ff0000;
	            	}

	            	#${db.Database}:hover .yellow {
	            		stop-color: #ffff00;
	            	}
	            </style>
                <g>
                    <path d="M 3.75 5 C 3.75 9 20.25 9 20.25 5" fill="none" stroke="url(#${db.Database}SvgGrow)" stroke-miterlimit="10"/>
                    <path d="M 3.75 5 C 3.75 -0.33 20.25 -0.33 20.25 5 L 20.25 19 C 20.25 24.33 3.75 24.33 3.75 19 Z" fill="none"
                        stroke="url(#${db.Database}SvgGrow)" stroke-miterlimit="10"/>
                </g>
            </svg>
            <div class="tooltipWrapper">
                <div class="tooltip">${db.Database}</div>
                <div class="deleteSvg">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24px" height="24px" viewBox="0 0 24 24"
                        pointer-events="all" id="${db.Database}Delete">
                    <defs>
                        <linearGradient id="${db.Database}DelCrossGrow" x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" class="red" />
                           <stop offset="100%" class="yellow" />
                        </linearGradient>
                    </defs>
                    <style>
                    #${db.Database}Delete .red {
	            		stop-color: #303030;
	            	}

	            	#${db.Database}Delete .yellow {
	            		stop-color: #303030;
	            	}

	            	#${db.Database}Delete:hover .red {
	            		stop-color: #ff0000;
	            	}

	            	#${db.Database}Delete:hover .yellow {
	            		stop-color: #ffff00;
	            	}
                    </style>
                    <path
                        d="M 0 9.6 L 9.6 9.6 L 9.6 0 L 14.4 0 L 14.4 9.6 L 24 9.6 L 24 14.4 L 14.4 14.4 L 14.4 24 L 9.6 24 L 9.6 14.4 L 0 14.4 Z"
                            fill="url(#${db.Database}DelCrossGrow)" stroke="none" />
                    </svg>
                </div>
            </div>
            `;
                SvgGridTemplate.insertBefore(newDBSvg, SvgGridTemplate.firstElementChild);
            })
        )
        .catch(err => alert(err.message));
}
function createDatabases(newDBname) {
    fetch("http://localhost:8080/create-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbName: newDBname })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            // reloadPage();
            location.reload();
        })
        .catch(err => alert(err));
}
function deleteDatabases(dbName, dbSvg) {
    fetch("http://localhost:8080/delete-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbName: dbName })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            console.log(dbSvg + " removed");
            dbSvg.remove();
        })
        .catch(err => alert(err));
}
function initDatabaseView() {
    const nameInput = document.getElementById("nameInput");
    const addSvg = document.querySelector(".addSvg");
    const tooltip = document.querySelector(".tooltip");
    const red = document.querySelector(".red");
    const yellow = document.querySelector(".yellow");
    const NameInput = document.getElementById("NameInput");
    const SvgGridTemplate = document.querySelector(".SvgGridTemplate");
    const CloseCross = document.querySelector(".CloseCross");
    fetchDatabases(SvgGridTemplate);
    // open input field on click event
    addSvg.addEventListener("click", () => {
        addSvg.style = `background:
            linear-gradient(#060000, #060000) padding-box,
            linear-gradient(145deg, #ffff00, #ff0000) border-box;`;
        tooltip.style.opacity = "1";
        red.style.stopColor = "#ff0000";
        yellow.style.stopColor = "#ffff00";
        SvgGridTemplate.style.filter = "blur(3px)";
        NameInput.style.opacity = 1;
        NameInput.style.width = "10rem";
        CloseCross.style.opacity = 1;
    });
    // add (create) database on enter keydown event 
    nameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            let newDBname = document.getElementById("nameInput").value.trim();
            let tooltipNodeList = document.querySelectorAll(".tooltip");
            if (newDBname === "") {
                alert("Database name cannot be empty!");
                return
            }
            const invalidPattern = /(^[0-9])|[\s\-@#%&*!]|[^\x00-\x7F]/;
            if (invalidPattern.test(newDBname)) {
                alert(
                    "Invalid database name!\n\n" +
                    "Rules:\n" +
                    "- Must NOT start with a number\n" +
                    "- No spaces\n" +
                    "- No hyphens (-)\n" +
                    "- No special characters (@ # % & * !)\n" +
                    "- No emoji or unicode characters"
                );
                return;
            }
            const existingDBNames = Array.from(tooltipNodeList).map(oneTooltip => oneTooltip.textContent);
            if (existingDBNames.includes(newDBname)) {
                alert("Database name already exists!");
                return;
            }
            createDatabases(newDBname);
            newDBname = "";
            removeStyle(nameInput, addSvg, tooltip, red, yellow, NameInput, SvgGridTemplate, CloseCross);
        }
    });
    // Close input field on click event
    CloseCross.addEventListener("click", () => {
        removeStyle(nameInput, addSvg, tooltip, red, yellow, NameInput, SvgGridTemplate, CloseCross);
    });
    // Delete database on click event
    SvgGridTemplate.addEventListener("click", function (event) {
        const deleteBtn = event.target.closest(".deleteSvg");
        if (!deleteBtn) return;
        event.stopPropagation();
        const dbSvg = deleteBtn.closest(".SvgBlock");
        if (!dbSvg) return;
        const dbName = dbSvg.id.replace(/Svg$/, "");;
        console.log("Deleted DB:", dbName);
        deleteDatabases(dbName, dbSvg);
    });
    // Redirect to table view page
    SvgGridTemplate.addEventListener("click", function (event) {
        const svg = event.target.closest(".SvgBlock > svg[id]");
        if (!svg) return;
        if (event.target.closest(".deleteSvg")) return;
        console.log("Clicked DB:", svg.id);
        databaseName = svg.id;
        console.log(databaseName + " stored in databaseName variable");
        window.location.hash = "#!/table";
    });
}

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

// Delete database
app.post("/delete-database", (req, res) => {
    const { dbName } = req.body;
    if (!dbName) {
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
    if (systemDBs.includes(dbName)) {
        return res.status(403).json({
            error: "System databases cannot be deleted"
        });
    }
    const validName = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
    if (!validName.test(dbName)) {
        return res.status(400).json({ error: "Invalid database name" });
    }
    const safeDbName = mysql.escapeId(dbName);
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
