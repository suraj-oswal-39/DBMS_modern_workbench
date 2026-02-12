console.log("JavaScript file is linked successfully.");

let svgId = "";

function NoBtn(noBtn, routingContainer, popUpWindow) {
    noBtn.onclick = () => {
        routingContainer.removeAttribute("style");
        popUpWindow.removeAttribute("style");
    };
}

function removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross) {
    nameInput.value = "";
    addSvg.removeAttribute("style");
    tooltip.removeAttribute("style");
    red.removeAttribute("style");
    yellow.removeAttribute("style");
    routingContainer.removeAttribute("style");
    NameInput.removeAttribute("style");
    CloseCross.removeAttribute("style");
}

function enableSvgSearch(containerSelector) {
    const searchInput = document.getElementById("svgSearchInput");
    const container = document.querySelector(containerSelector);

    if (!searchInput || !container) return;

    searchInput.addEventListener("input", function () {

        const query = this.value.toLowerCase();
        const items = container.querySelectorAll(".DBSvg, .SvgBlock");

        items.forEach(item => {

            const realName =
                item.dataset.databaseName ||
                item.dataset.tableName ||
                item.querySelector(".tooltip")?.textContent || "";

            if (realName.toLowerCase().includes(query)) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }

        });
    });
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
                newDBSvg.setAttribute("id", db.Database);
                newDBSvg.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" pointer-events="all" id="${db.Database}Svg" class="addSvg">
	            <defs>
	            	<linearGradient id="${db.Database}SvgGrow" x1="100%" y1="100%" x2="0%" y2="0%">
	            		<stop offset="0%" class="red"/>
	            		<stop offset="100%" class="yellow"/>
	            	</linearGradient>
	            </defs>
                <g>
                    <path d="M 3.75 5 C 3.75 9 20.25 9 20.25 5" fill="none" stroke="url(#${db.Database}SvgGrow)" stroke-miterlimit="10"/>
                    <path d="M 3.75 5 C 3.75 -0.33 20.25 -0.33 20.25 5 L 20.25 19 C 20.25 24.33 3.75 24.33 3.75 19 Z" fill="none"
                        stroke="url(#${db.Database}SvgGrow)" stroke-miterlimit="10"/>
                </g>
            </svg>
            <div class="tooltipWrapper">
                <p class="tooltip">${db.Database}</p>
                <div class="deleteSvg">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24px" height="24px" viewBox="0 0 24 24"
                        pointer-events="all" class="crossDelete">
                    <defs>
                        <linearGradient id="${db.Database}DelCrossGrow" x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" class="red" />
                            <stop offset="100%" class="yellow" />
                        </linearGradient>
                    </defs>
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
        .catch(err => console.log(err.message));
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
            location.reload();
        })
        .catch(err => console.log(err));
}

function deleteDatabases(dbNameForDel, dbSvgForRemove) {
    fetch("http://localhost:8080/delete-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbNameForDel: dbNameForDel })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            dbSvgForRemove.remove();
        })
        .catch(err => console.log(err));
}

function fetchTables(SvgGridTemplate, svgId) {
    if (!svgId) {
        console.log("No database selected");
        return;
    }

    fetch(`http://localhost:8080/Tables?databaseName=${encodeURIComponent(svgId)}`)
        .then(res => res.json())
        .then(data => {
            data.forEach(function (Tb) {
                const realTableName = Object.values(Tb)[0];   // MySQL truth
                const TableName = realTableName.replace(/\s+/g, "_");
                newTbSvg = document.createElement("div");
                newTbSvg.classList.add("SvgBlock");
                newTbSvg.setAttribute("id", TableName);
                newTbSvg.dataset.tableName = realTableName;
                newTbSvg.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" pointer-events="all" id="${TableName}Svg" class="addSvg">
	                <defs>
	            	<linearGradient id="${TableName}SvgGrow" x1="100%" y1="100%" x2="0%" y2="0%">
	            		<stop offset="0%" class="red"/>
	            		<stop offset="100%" class="yellow"/>
	            	</linearGradient>
	                </defs>
                    </style>
                        <path
                            d="M4 15V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H12M4 15V9M4 15H12M4 9V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H12M4 9H12M12 4H16.8002C17.9203 4 18.4801 4 18.9079 4.21799C19.2842 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V9M12 4V9M12 9V15M12 9H20M12 15V20M12 15H20M12 20H16.8036C17.9215 20 18.4805 20 18.9079 19.7822C19.2842 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V15M20 15V9"
                            stroke="url(#${TableName}SvgGrow)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="tooltipWrapper">
                        <p class="tooltip">${TableName}</p>
                        <div class="deleteSvg">
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24px" height="24px" viewBox="0 0 24 24"
                                pointer-events="all" class="crossDelete">
                            <defs>
                                <linearGradient id="${TableName}DelCrossGrow" x1="100%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" class="red" />
                                <stop offset="100%" class="yellow" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 0 9.6 L 9.6 9.6 L 9.6 0 L 14.4 0 L 14.4 9.6 L 24 9.6 L 24 14.4 L 14.4 14.4 L 14.4 24 L 9.6 24 L 9.6 14.4 L 0 14.4 Z"
                                    fill="url(#${TableName}DelCrossGrow)" stroke="none" />
                            </svg>
                        </div>
                    </div>
                    `;
                SvgGridTemplate.insertBefore(newTbSvg, SvgGridTemplate.firstElementChild);
            })
        })
        .catch(err => console.log(err.message));
}

function deleteTables(realTbNameForDel, TbSvgForRemove, dbName) {
    console.log("Deleting table:", realTbNameForDel, "from database:", dbName);

    fetch("http://localhost:8080/delete-Table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            TbName: realTbNameForDel,
            databaseName: dbName
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            TbSvgForRemove.remove();
        })
        .catch(err => console.log(err.message));
}

function deletionPopUpMessage(containerSelector, NameForDel, SvgForRemove, dbName) {
    if (containerSelector === "databaseViewPage") {
        deleteDatabases(NameForDel, SvgForRemove);
    } else if (containerSelector === "tableViewPage") {
        deleteTables(NameForDel, SvgForRemove, dbName);
    }
}

function OptionSelection() {
    const optionList = document.querySelectorAll(".selectedOption li");
    optionList.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.stopPropagation();

            const dataTypeBtn = option.closest(".dataType");
            const dt = dataTypeBtn.querySelector(".selectedDataType");
            const selectedOption = dataTypeBtn.querySelector(".selectedOption");

            dt.innerText = option.innerText;
            selectedOption.removeAttribute("style");
        });
    });
}

function ruleChecker() {
    // Rule A2: Table name must be valid
    const tableNameInput = document.querySelector("#tableNameInput");
    tableNameInput.addEventListener("change", () => {
        const tableName = tableNameInput.value.trim();
        if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(tableName)) {
            console.log("Invalid table name");
            return;
        }
    });

    let columnNames = document.querySelectorAll(".columnName");
    let names = [];
    columnNames.forEach((columnName) => {
        // Rule B1: Column name is mandatory
        if (columnName.value === "") {
            alert("Column name is mandatory");
            return;
        }
        // Rule B2: Column names must be unique
        const name = columnName.value.trim();
        if (names.includes(name)) {
            alert("Duplicate column name");
            names = [];
            columnName.value = "";
            return;
        }
        names.push(name);  
    });

    // Rule B3: Data type is mandatory
    let selectedDataType = document.querySelectorAll(".selectedDataType");
    selectedDataType.forEach((dataType) => {
        if (dataType.innerText === "Select Data Type") {
            alert("you must select data type");
            return;
        }
    });

    // Rule C1: AUTO_INCREMENT MUST be with PRIMARY KEY

    // Rule C3: DEFAULT is NOT allowed with AUTO_INCREMENT

    // Rule C4: BOOLEAN cannot be UNSIGNED

    // Rule C5: PRIMARY KEY implies NOT NULL

    // Rule C6: UNSIGNED allowed only for numeric types

    // Rule D1: DEFAULT must match data type 
    // Allowed : INT, BIGINT, SMALLINT, TINY_INT, DECIMAL, FLOAT / DOUBLE
    // Not Allowed: VARCHAR, TEXT, DATE, BOOLEAN

    // Rule D2: "DEFAULT" "NULL" allowed only if not "NOT NULL"
}

async function executeQuery() {
    const query = document.querySelector(".queryBox").value;
    alert(query);
    const response = await fetch("http://localhost:8080/execute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();

    alert(JSON.stringify(data, null, 2));
}

function queryRunner(routingContainer) {
    const popUpQueryWindow = document.querySelector(".popUpQueryWindow");
    const runQuery = document.querySelector(".runQuery");
    const executeBtn = document.querySelector(".execute");
    const cancelBtn = document.querySelector(".cancel");

    runQuery.onclick = () => {
        popUpQueryWindow.style.display = "grid";
        routingContainer.style.filter = "blur(3px)";
    };

    cancelBtn.onclick = () => {
        popUpQueryWindow.style.display = "none";
        routingContainer.removeAttribute("style");
    };

    executeBtn.onclick = () => {
        executeQuery();
    };
}

function initDatabaseView($location, $rootScope) {
    const nameInput = document.getElementById("nameInput");
    const addSvg = document.querySelector(".addSvg");
    const tooltip = document.querySelector(".tooltip");
    const red = document.querySelector(".red");
    const yellow = document.querySelector(".yellow");
    const NameInput = document.getElementById("NameInput");
    const routingContainer = document.querySelector(".routingContainer");
    const SvgGridTemplate = document.querySelector(".SvgGridTemplate");
    const CloseCross = document.querySelector(".CloseCross");
    const popUpWindow = document.querySelector(".popUpWindow");
    const noBtn = document.querySelector(".no");
    const yesBtn = document.querySelector(".yes");
    const message = document.querySelector(".message");

    message.textContent = "This will permanently delete the selected database. All tables, records, and related data will be removed. This action cannot be undone.";

    let dbSvgForRemove = "";
    let dbNameForDel = "";

    fetchDatabases(SvgGridTemplate);

    // open input field on click event
    addSvg.onclick = () => {
        addSvg.style = `background:
            linear-gradient(#060000, #060000) padding-box,
            linear-gradient(145deg, #ffff00, #ff0000) border-box;`;
        tooltip.style.opacity = "1";
        red.style.stopColor = "#ff0000";
        yellow.style.stopColor = "#ffff00";
        routingContainer.style.filter = "blur(3px)";
        NameInput.style.opacity = 1;
        NameInput.style.width = "10rem";
        CloseCross.style.opacity = 1;
    };

    // add (create) database on enter keydown event 
    nameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {

            event.preventDefault();

            let newDBname = document.getElementById("nameInput").value.trim();
            let tooltipNodeList = document.querySelectorAll(".tooltip");

            if (newDBname === "") {
                console.log("Database name cannot be empty!");
                return
            }

            const invalidPattern = /(^[0-9])|[\s\-@#%&*!]|[^\x00-\x7F]/;

            if (invalidPattern.test(newDBname)) {
                console.log(
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
                console.log("Database name already exists!");
                return;
            }

            createDatabases(newDBname);

            newDBname = "";

            removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross);
        }
    });

    // Close input field on click event
    CloseCross.onclick = () => {
        removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross);
    };

    // Delete database on click event
    SvgGridTemplate.addEventListener("click", function (event) {
        const deleteBtn = event.target.closest(".deleteSvg");
        if (!deleteBtn) return;

        event.stopPropagation();

        dbSvgForRemove = deleteBtn.closest(".SvgBlock");
        if (!dbSvgForRemove) return;
        dbNameForDel = dbSvgForRemove.id;
        console.log("Deleted DB:", dbNameForDel);

        routingContainer.style.filter = "blur(3px)";
        popUpWindow.style.display = "grid";
    });

    // Redirect to table view page
    SvgGridTemplate.addEventListener("click", function (event) {
        const svg = event.target.closest(".SvgBlock > svg[id]");
        if (!svg) return;

        if (event.target.closest(".deleteSvg")) return;
        console.log("Clicked DB:", svg.id.replace(/Svg$/, ""));

        const dbName = svg.id.replace(/Svg$/, "");
        svgId = dbName;

        $rootScope.$apply(() => {
            $location.path(`/table/${dbName}`);
        });
    });

    enableSvgSearch(".SvgGridTemplate");

    NoBtn(noBtn, routingContainer, popUpWindow);

    yesBtn.onclick = () => {
        deletionPopUpMessage("databaseViewPage", dbNameForDel, dbSvgForRemove);
        routingContainer.removeAttribute("style");
        popUpWindow.removeAttribute("style");
    };

    queryRunner(routingContainer);
}

function initTableView(dbName) {

    const addSvg = document.querySelector(".addSvg");
    const routingContainer = document.querySelector(".routingContainer");
    const SvgGridTemplate = document.querySelector(".SvgGridTemplate");
    const CloseCross2 = document.querySelector(".CloseCross2");
    const popUpWindow = document.querySelector(".popUpWindow");
    const noBtn = document.querySelector(".no");
    const yesBtn = document.querySelector(".yes");
    const message = document.querySelector(".message");
    const fromDisplay2 = document.querySelector(".fromDisplay2");
    const rowContainer = document.querySelector(".rowContainer");
    let btn;
    let selectedOption;
    let realTbNameForDel = "";
    let TbSvgForRemove = "";
    const AddRow = document.querySelector("#AddRow");
    let rowCount = 0;
    const RemoveRow = document.querySelector("#RemoveRow");
    const resetBtn = document.querySelector("#resetBtn");
    const h3Tag = document.querySelector(".DBTabletTitle");
    let capitalizedDBName = dbName.charAt(0).toUpperCase() + dbName.slice(1);
    h3Tag.textContent = `${capitalizedDBName} database tables`;

    message.textContent = "Are you sure you want to permanently delete this table? This will remove all data in the table and cannot be undone.";

    // open table creation form on click event
    addSvg.onclick = () => {
        routingContainer.style.filter = "blur(3px)";
        fromDisplay2.style.display = "flex";
    };

    // Delete table on click event
    SvgGridTemplate.addEventListener("click", function (event) {
        const deleteBtn = event.target.closest(".deleteSvg");
        if (!deleteBtn) return;

        event.stopPropagation();

        TbSvgForRemove = deleteBtn.closest(".SvgBlock");
        if (!TbSvgForRemove) return;
        realTbNameForDel = TbSvgForRemove.dataset.tableName;

        console.log("Deleted Tb:", realTbNameForDel);

        routingContainer.style.filter = "blur(3px)";
        popUpWindow.style.display = "grid";
    });

    // Redirect to table data page
    SvgGridTemplate.addEventListener("click", function (event) {
        const svg = event.target.closest(".SvgBlock > svg[id]");
        if (!svg) return;

        if (event.target.closest(".deleteSvg")) return;
        console.log("Clicked Tb:", svg.id);
        window.location.hash = "#!/tableData";
    });

    enableSvgSearch(".SvgGridTemplate");

    NoBtn(noBtn, routingContainer, popUpWindow);
    
    yesBtn.onclick = () => {
        routingContainer.removeAttribute("style");
        popUpWindow.removeAttribute("style");
        deletionPopUpMessage("tableViewPage", realTbNameForDel, TbSvgForRemove, dbName);
    };
    
    CloseCross2.onclick = () => {
        fromDisplay2.style.display = "none";
        routingContainer.removeAttribute("style");
    };

    rowContainer.addEventListener("click", function (event) {
        btn = event.target.closest(".dataType");
        if (!btn) return;

        selectedOption = btn.querySelector(".selectedOption");
        selectedOption.style.opacity = "1";
        selectedOption.style.width = "7rem";
        selectedOption.style.height = "18.3rem";
    });

    OptionSelection();

    AddRow.addEventListener("click", () => {
        rowCount++;
        const newRow = document.createElement("div");
        newRow.classList.add("row");
        newRow.innerHTML = `
            <div class="columnNameInputDiv">
                        <input type="text" class="columnName" name="columnName" placeholder="Enter Column Name" required />
                    </div>

                    <button type="button" class="dataType">
                        <p class="selectedDataType">Select Data Type</p>
                        <ul class="selectedOption">
                            <li>INT</li>
                            <li>BIGINT</li>
                            <li>DECIMAL</li>
                            <li>FLOAT</li>
                            <li>DOUBLE</li>
                            <li>VARCHAR</li>
                            <li>CHAR</li>
                            <li>TEXT</li>
                            <li>DATE</li>
                            <li>DATETIME</li>
                            <li>TIMESTAMP</li>
                            <li>BOOLEAN</li>
                        </ul>
                    </button>
                    
                    <!-- Rule E1: Only one PRIMARY KEY per table -->
                    <input type="radio" id="pk${rowCount}" name="pk" value="pk${rowCount}" hidden />
                    <label for="pk${rowCount}" class="btn Pk">Primary Key</label>

                    <input type="checkbox" id="nn${rowCount}" hidden />
                    <label for="nn${rowCount}" class="btn">Not Null</label>

                    <input type="checkbox" id="uq${rowCount}" hidden />
                    <label for="uq${rowCount}" class="btn">Unique</label>

                    <input type="checkbox" id="us${rowCount}" hidden />
                    <label for="us${rowCount}" class="btn">Unsigned</label>

                    <!-- Rule C2: Only ONE AUTO_INCREMENT column per table -->
                    <input type="radio" id="ai${rowCount}" name="ai" value="ai${rowCount}" hidden />
                    <label for="ai${rowCount}" class="btn Ai">Auto Increment</label>

                    <div class="defaultValueDiv">
                        <input type="text" class="expression" name="expression" placeholder="Enter Default Value" />
                    </div>
        `;
        rowContainer.appendChild(newRow);
        OptionSelection();
    });

    RemoveRow.addEventListener("click", () => {
        // Rule A1: Table must have at least one row
        if (rowCount <= 0) {
            console.log("at least have 1 row");
            return;
        }

        let lastRow = rowContainer.lastChild;
        rowContainer.removeChild(lastRow);
        rowCount--;
        OptionSelection();
    });

    resetBtn.addEventListener("click", () => {
        let selectedDataTypeList = document.querySelectorAll(".selectedDataType");

        selectedDataTypeList.forEach((selectedDT) => {
            selectedDT.innerText = "Select Data Type";
            if (selectedOption.style) {
                selectedOption.removeAttribute("style");
            }
            OptionSelection();
        });
    });

    const createBtn = document.querySelector("#createBtn");
    createBtn.addEventListener("click", () => {
        ruleChecker();
    });

    queryRunner(routingContainer);
}