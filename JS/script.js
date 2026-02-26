console.log("JavaScript file is linked successfully.");

let isOpen = false;
let isLight = false;

function outputWindow(outputMsg) {
    const result = document.querySelector(".result");
    const outputScreen = document.querySelector(".outputScreen");
    if (outputScreen.style.display !== "block") {
        outputScreen.style.display = "block";
    }
    result.innerText = "";
    result.innerText = outputMsg;
}

function NoBtn(noBtn, routingContainer, popUpWindow) {
    noBtn.onclick = () => {
        routingContainer.removeAttribute("style");
        popUpWindow.removeAttribute("style");
    };
}

function removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross, fromDisplay) {
    [nameInput, addSvg, tooltip, red, yellow, routingContainer, CloseCross, NameInput, fromDisplay].forEach(el => {
        if (el && el.style) el.removeAttribute("style");
    });
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
    fetch("http://localhost:3000/databases", {
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
        .catch(err => {
            let errorMsg = "Databases " + err.message + "\n\n" + err.stack;
            outputWindow(errorMsg)
        });
}

function createDatabases(newDBname) {
    fetch("http://localhost:3000/create-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbName: newDBname })
    })
        .then(res => res.json())
        .then(data => {
            outputWindow(data.message);
            setTimeout(() => {
                location.reload();
            }, 2000);
        })
        .catch(err => {
            let errorMsg = err.message + "\n\n" + err.stack;
            outputWindow(errorMsg);
        });
}

function deleteDatabases(dbNameForDel, dbSvgForRemove) {
    fetch("http://localhost:3000/delete-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbNameForDel: dbNameForDel })
    })
        .then(res => res.json())
        .then(data => {
            outputWindow(data.message);
            dbSvgForRemove.remove();
        })
        .catch(err => {
            let errorMsg = err.message + "\n\n" + err.stack;
            outputWindow(errorMsg);
        });
}

function fetchTables(SvgGridTemplate, dbName) {
    if (!dbName) {
        console.log("No database selected");
        return;
    }

    fetch(`http://localhost:3000/Tables?databaseName=${encodeURIComponent(dbName)}`)
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
                        <path
                            d="M4 15V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H12M4 15V9M4 15H12M4 9V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H12M4 9H12M12 4H16.8002C17.9203 4 18.4801 4 18.9079 4.21799C19.2842 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V9M12 4V9M12 9V15M12 9H20M12 15V20M12 15H20M12 20H16.8036C17.9215 20 18.4805 20 18.9079 19.7822C19.2842 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V15M20 15V9"
                            stroke="url(#${TableName}SvgGrow)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" />
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
        .catch(err => {
            let errorMsg = "Tables " + err.message + "\n\n" + err.stack;
            outputWindow(errorMsg);
        });
}

function deleteTables(realTbNameForDel, TbSvgForRemove, dbName) {
    console.log("Deleting table:", realTbNameForDel, "from database:", dbName);

    fetch("http://localhost:3000/delete-Table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            TbName: realTbNameForDel,
            databaseName: dbName
        })
    })
        .then(res => res.json())
        .then(data => {
            outputWindow(data.message);
            TbSvgForRemove.remove();
        })
        .catch(err => {
            let errorMsg = err.message + "\n\n" + err.stack;
            outputWindow(errorMsg);
        });
}

async function createTable(dbName) {
    const tableNameInput = document.querySelector("#tableNameInput");
    const columnNames = document.querySelectorAll(".columnName");
    const selectedDataTypes = document.querySelectorAll(".selectedDataType");
    const sizeInputs = document.querySelectorAll(".sizeInput");
    const primaryKeys = document.querySelectorAll('input[name="pk"]');
    const notNulls = document.querySelectorAll('input[name="nn"]');
    const uniques = document.querySelectorAll('input[name="uq"]');
    const Unsigneds = document.querySelectorAll('input[name="us"]');
    const AutoIncrements = document.querySelectorAll('input[name="ai"]');
    const expressions = document.querySelectorAll(".expression");

    const table = {
        databaseName: dbName,
        tableName: tableNameInput.value,
        columns: Array.from(columnNames).map((columnName, index) => ({
            columnName: columnName.value,
            dataType: selectedDataTypes[index].innerText,
            size: sizeInputs[index].value,
            primaryKey: primaryKeys[index].checked,
            notNull: notNulls[index].checked,
            unique: uniques[index].checked,
            unsigned: Unsigneds[index].checked,
            autoIncrement: AutoIncrements[index].checked,
            expression: expressions[index].value,
        })),
    };

    try {
        const response = await fetch("http://localhost:3000/create-table", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(table)
        });

        const data = await response.json();
        if (data.error) {
            outputWindow(data.error);
        } else if (data.message) {
            outputWindow(data.message);
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (err) {
        let errorMsg = err.message + "\n\n" + err.stack;
        outputWindow(errorMsg);
    }
}

function deletionPopUpMessage(containerSelector, NameForDel, SvgForRemove, dbName) {
    if (containerSelector === "databaseViewPage") {
        deleteDatabases(NameForDel, SvgForRemove);
    } else if (containerSelector === "tableViewPage") {
        deleteTables(NameForDel, SvgForRemove, dbName);
    }
}

function OptionSelection() {

    const rowContainer = document.querySelector(".rowContainer");

    rowContainer.addEventListener("click", function (event) {

        const option = event.target.closest(".dataTypeList li");
        if (!option) return;

        event.stopPropagation();

        const row = option.closest(".row");
        const dataTypeBtn = option.closest(".dataType");
        const dt = dataTypeBtn.querySelector(".selectedDataType");
        const dataTypeList = dataTypeBtn.querySelector(".dataTypeList");
        const sizeInput = row.querySelector(".sizeInput");

        const selectedType = option.innerText;

        dt.innerText = selectedType;
        dataTypeList.removeAttribute("style");

        const cleanType = selectedType.replace(/\(.*\)/, "");

        const disableList = ["FLOAT", "DOUBLE", "DATE", "BOOLEAN"];

        if (disableList.includes(cleanType)) {
            sizeInput.setAttribute("disabled", "true");
            sizeInput.value = "";
            sizeInput.placeholder = "N/A";
        } else {
            sizeInput.removeAttribute("disabled");
            sizeInput.placeholder = "size";
        }

        // TEXT cannot have DEFAULT
        const exp = row.querySelector(".expression");
        if (cleanType === "TEXT") {
            exp.setAttribute("disabled", "true");
            exp.value = "";
            exp.placeholder = "disabled";
        }

        if (cleanType === "VARCHAR") {
            sizeInput.value = "50";
            sizeInput.setAttribute("required", "true");
        }

    });
}

function ruleChecker() {

    const tableNameInput = document.querySelector("#tableNameInput");
    let columnNames = document.querySelectorAll(".columnName");
    let names = [];
    let selectedDataType = document.querySelectorAll(".selectedDataType");
    const primaryKeys = document.querySelectorAll('input[name="pk"]');
    const NotNulls = document.querySelectorAll("input[name='nn']");
    const expressions = document.querySelectorAll(".expression");
    const errorMsg = [];
    const sizeInputs = document.querySelectorAll(".sizeInput");

    // Table name must be valid
    tableNameInput.addEventListener("change", () => {
        const tableName = tableNameInput.value.trim();
        if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(tableName)) {
            errorMsg.push("Invalid table name!");
        }
    });

    columnNames.forEach((columnName) => {
        // Column name is mandatory
        if (columnName.value === "") {
            errorMsg.push("Column name is mandatory!");
        }
        // Column names must be unique
        const name = columnName.value.trim();
        if (names.includes(name)) {
            errorMsg.push("Duplicate column name!");
            names = [];
            columnName.value = "";
        }
        names.push(name);
    });

    //  Data type is mandatory
    selectedDataType.forEach((dataType, index) => {
        if (dataType.innerText === "Select Data Type") {
            errorMsg.push("you must select data type!");
        }
        if (dataType.innerText === "VARCHAR()" && sizeInputs[index].value === "") {
            errorMsg.push("VARCHAR datatype must have size specified!");
        }
    });

    // Data type must be indexable
    primaryKeys.forEach((pk, index) => {
        if (pk.checked && (selectedDataType[index].innerText === "TEXT()" || selectedDataType[index].innerText === "BOOLEAN")) {
            errorMsg.push("primary key cannot with 'TEXT' or 'BOOLEAN' datatype!");
        }
    });
    const uniques = document.querySelectorAll('input[name="uq"]');
    uniques.forEach((up, index) => {
        if (up.checked && (selectedDataType[index].innerText === "TEXT()" || selectedDataType[index].innerText === "BOOLEAN")) {
            errorMsg.push("unique key cannot with 'TEXT' or 'BOOLEAN' datatype!");
        }
    });

    // DEFAULT 'NULL' not allowed if column is NOT NULL
    expressions.forEach((exp, index) => {
        const value = exp.value.toLowerCase().trim()
        if (value === "null" && NotNulls[index].checked) {
            errorMsg.push("DEFAULT 'NULL' not allowed if column is NOT NULL!");
        }
    });

    if (errorMsg.length !== 0) {
        outputWindow(errorMsg.join("\n"));
        return false;
    } else if (errorMsg.length === 0) {
        return true;
    }
}

async function executeQuery() {
    const query = document.querySelector(".queryBox").value;
    // console.log(query);
    const response = await fetch("http://localhost:3000/execute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();

    const responseJson = JSON.stringify(data, null, 2);

    outputWindow(responseJson + "\n\nYour SQL Query:\n" + query);
}

function queryRunner(routingContainer) {
    const popUpQueryWindow = document.querySelector(".popUpQueryWindow");
    const SqlQuery = document.querySelector(".SqlQuery");
    const executeBtn = document.querySelector(".execute");
    const cancelBtn = document.querySelector(".cancel");

    SqlQuery.onclick = () => {
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

function fromDisplay2buttonFeature() {
    const rowContainer = document.querySelector(".rowContainer");

    // PRIMARY KEY implies NOT NULL
    rowContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        const pk = event.target.closest('input[name="pk"]');
        if (!pk) return;
        const row = pk.closest(".row");
        const nn = row.querySelector('input[name="nn"]');
        if (pk.checked) {
            nn.checked = true;
            nn.style.border = "0.2rem solid #ffff00";
        }
    });

    // UNSIGNED Only with numeric types
    rowContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        const us = event.target.closest('input[name="us"]');
        if (!us) return;
        console.log(us);
        const row = us.closest(".row");
        const dataType = row.querySelector('.selectedDataType');
        if (!["INT()", "BIGINT()", "DECIMAL()", "FLOAT", "DOUBLE"].includes(dataType.innerText)) {
            us.checked = false;
            us.removeAttribute("style");
            console.log("Data type must be INT, BIGINT, DECIMAL, FLOAT or DOUBLE.");
        }
    });

    // AUTO_INCREMENT Must be with integer type and either PRIMARY KEY or UNIQUE.
    rowContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        const ai = event.target.closest('input[name="ai"]');
        if (!ai) return;
        const row = ai.closest(".row");
        const dataType = row.querySelector('.selectedDataType');
        const pk = row.querySelector('input[name="pk"]');
        const uq = row.querySelector('input[name="uq"]');
        const exp = row.querySelector('.expression');
        if (!["INT()", "BIGINT()"].includes(dataType.innerText) || !(pk.checked || uq.checked)) {
            ai.checked = false;
            ai.removeAttribute("style");
            console.log("Data type must be INT or BIGINT and either PRIMARY KEY or UNIQUE.");
        }
        if (ai.checked && exp.value === "") {
            exp.setAttribute("disabled", "true");
            exp.value = "";
            exp.placeholder = "disabled";
        }
    });

}

function outputScreenClose(routingContainer) {
    const outputScreen = document.querySelector(".outputScreen");
    const outputScreenClose = document.querySelector(".outputScreenClose");
    outputScreenClose.onclick = () => {
        outputScreen.style.display = "none";
        routingContainer.removeAttribute("style");
    };
}

function updateLineNumbers(textarea, lineNumbers) {
    const lines = textarea.value.split("\n").length;
    let numbers = "";
    for (let i = 1; i <= lines; i++) {
        numbers += i + "\n";
    }
    lineNumbers.textContent = numbers;
}

function makeDraggable(element) {

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;

        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;

    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;

        element.style.transform =
            `translate(${offsetX}px, ${offsetY}px)`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function openOutputScreen(outputScreen) {
    const outputScreenButton = document.querySelector('.outputScreenButton');
    // if (!outputScreenButton) return;
    outputScreenButton.onclick = () => {
        outputScreen.style.display = "block";
    };
}

function settingOpen() {
    const settingBtn = document.querySelector(".settingBtn");
    const settingMenu = document.querySelector(".settingMenu");
    const themeBtn = document.querySelector(".themeBtn");
    const themeTitle = document.querySelector(".themeBtn p");
    settingBtn.onclick = () => {
        if (!isOpen) {
            settingMenu.style.right = 0 + "%";
            isOpen = !isOpen;
        } else {
            settingMenu.removeAttribute("style");
            isOpen = !isOpen;
        }
    };
    themeBtn.onclick = () => {
        document.body.classList.toggle("light");
        if (!isLight) {
            themeBtn.style.backgroundColor = "var(--color8);";
            const sunSvg = document.querySelector(".sunSvg");
            const moonSvg = document.createElement("img");
            moonSvg.setAttribute("src", "/SVG/moonSvg.svg");
            moonSvg.setAttribute("class", "moonSvg");
            themeBtn.replaceChild(moonSvg, sunSvg);
            themeTitle.style.color = "#000000";
            isLight = !isLight;
        } else {
            themeBtn.style.backgroundColor = "#000000";
            themeBtn.removeAttribute("style");
            const moonSvg = document.querySelector(".moonSvg");
            const sunSvg = document.createElement("img");
            sunSvg.setAttribute("src", "/SVG/sunSvg.svg");
            sunSvg.setAttribute("class", "sunSvg");
            themeBtn.replaceChild(sunSvg, moonSvg);
            themeTitle.removeAttribute("style");
            isLight = !isLight;
        }
    }
}

function deleteRowSvgAdd() {
    const dataRow = document.querySelectorAll(".dataRow");
    dataRow.forEach(row => {
        let div = document.createElement("div");
        div.innerHTML = `
                    <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path id="Vector" d="M14 16H20M21 10V9C21 7.89543 20.1046 7 19 7H5C3.89543 7 3 7.89543 3 9V11C3 12.1046 3.89543 13 5 13H11" stroke="var(--color4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
        div.classList.add("deleteRow");
        div.title = "remove row";
        row.insertBefore(div, row.firstElementChild);
    });
}

function DeleteRow(dbName, tableName) {
    document.querySelectorAll(".deleteRow").forEach(btn => {
        btn.onclick = async (event) => {
            const row = event.target.closest(".dataRow");
            const pkInput = row.querySelector(".PK");

            if (!pkInput) {
                console.log("Primary key not found");
                return;
            }

            const pkValue = pkInput.value;
            const pkColumnName = pkInput.name;

            const response = await fetch("http://localhost:3000/delete-row", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    databaseName: dbName,
                    tableName: tableName,
                    pkColumnName: pkColumnName,
                    pkValue: pkValue
                }),
            });

            const data = await response.json();

            if (data.error) {
                outputWindow(data.error);
                return;
            } else {
                outputWindow(data.message);
                row.remove();
            }
        };
    });
}

async function insertNewData(dbName, tableName, newData) {
    try {
        const response = await fetch("http://localhost:3000/insert-row", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                databaseName: dbName,
                tableName: tableName,
                columns: newData.ColumnName,
                values: newData.newColumnData
            })
        });

        const data = await response.json();
        if (data.error) {
            outputWindow(data.error);
            const dataRow = targetElement.closest(".dataRow");
            dataRow.remove();
            // newData.ColumnName.length = 0;
            // newData.newColumnData.length = 0;
            console.log(newData);
            return;
        } else if (data.message) {
            outputWindow(data.message);
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (err) {
        let errorMsg = err.message + "\n\n" + err.stack;
        outputWindow(errorMsg);
    }
};

async function updateOldData(dbName, tableName, newData) {
    console.log(newData);
    try {
        const response = await fetch("http://localhost:3000/update-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                databaseName: dbName,
                tableName: tableName,
                columns: newData.ColumnName,
                values: newData.newColumnData,
                pkColumnName: newData.pkColumnName,
                pkValue: newData.pkValue
            })
        });

        const data = await response.json();
        if (data.error) {
            outputWindow(data.error);
            // newData.ColumnName.length = 0;
            // newData.newColumnData.length = 0;
            console.log(newData);
            return;
        } else if (data.message) {
            outputWindow(data.message);
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (err) {
        let errorMsg = err.message + "\n\n" + err.stack;
        outputWindow(errorMsg);
    }
};

function getChangeData(dbName, tableName, tableTemplate) {
    let newData = {
        "ColumnName": [],
        "newColumnData": [],
        "pkColumnName": "",
        "pkValue": ""
    };
    let targetElement;
    tableTemplate.addEventListener("dblclick", (event) => {
        targetElement = event.target;
        if (targetElement.tagName === "INPUT") {
            targetElement.removeAttribute("readonly");
            targetElement.style.border = "2px solid #ff0";
            if (newData.pkValue.length === 0 && newData.pkColumnName.length === 0) {
                let dataRow = targetElement.closest(".dataRow");
                let pkVal = dataRow.querySelector(".PK").value;
                newData.pkColumnName = dataRow.querySelector(".PK").name;
                newData.pkValue = pkVal;
            }
        }
        targetElement.addEventListener("change", () => {
            if (newData.ColumnName.includes(targetElement.name)) return;
            newData.ColumnName.push(targetElement.name);
            let value = targetElement.value;

            if (targetElement.value.match(/\d{1,2}\s\w+\s\d{4}/)) {
                const parsedDate = new Date(targetElement.value);
                if (!isNaN(parsedDate)) {
                    value = parsedDate.toISOString().slice(0, 19).replace("T", " ");
                    newData.newColumnData.push(value);
                }
            } else {
                newData.newColumnData.push(value);
            }
            console.log(newData);
        });
    });

    const insertData = document.querySelector(".insertData");
    const changeData = document.querySelector(".changeData");

    insertData.addEventListener("click", () => {
        insertNewData(dbName, tableName, newData);
    });

    changeData.addEventListener("click", () => {
        updateOldData(dbName, tableName, newData);
    });
}

async function fetchTableData(tableTemplate, dbName, tableName) {

    const columnNames = tableTemplate.querySelector(".columnNames");
    const tableData = tableTemplate.querySelector(".tableData");
    const addDataRow = document.querySelector(".addDataRow");

    if (!dbName) {
        console.log("No database selected");
        return;
    }

    if (!tableName) {
        console.log("No table selected");
        return;
    }

    const metaResponse = await fetch(
        `http://localhost:3000/TableMeta?databaseName=${dbName}&tableName=${tableName}`
    );

    const metaData = await metaResponse.json();

    const pkColumns = metaData
        .filter(col => col.CONSTRAINT_TYPE === "PRIMARY KEY")
        .map(col => col.COLUMN_NAME);

    const fkColumns = metaData
        .filter(col => col.CONSTRAINT_TYPE === "FOREIGN KEY")
        .map(col => col.COLUMN_NAME);

    const nnColumns = metaData
        .filter(col => col.IS_NULLABLE === "NO")
        .map(col => col.COLUMN_NAME);


    const dataResponse = await fetch(
        `http://localhost:3000/TableData?databaseName=${dbName}&tableName=${tableName}`
    );

    // append column name 
    const columnList = metaData.map(col => col.COLUMN_NAME);
    columnList.forEach(colName => {
        let label = colName;
        const colMeta = metaData.find(c => c.COLUMN_NAME === colName);
        if (colMeta.CONSTRAINT_TYPE === "PRIMARY KEY") {
            label += " (PK)";
        }
        if (colMeta.CONSTRAINT_TYPE === "FOREIGN KEY") {
            label += " (FK)";
        }
        if (colMeta.IS_NULLABLE === "NO") {
            label += " (NN)";
        }
        let p = document.createElement("p");
        p.textContent = label;
        columnNames.appendChild(p);
    });

    const data = await dataResponse.json();

    // append column's data
    data.forEach(row => {
        let newDiv = document.createElement("div");
        newDiv.setAttribute("class", "dataRow");
        Object.values(row).forEach((value, index) => {
            let displayValue = value;
            if (typeof value === "string" && value.includes("T") && value.endsWith("Z")) {
                const date = new Date(value);
                displayValue = date.toLocaleString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });
            }
            let newInput = document.createElement("input");
            newInput.setAttribute("type", "text");
            newInput.setAttribute("value", displayValue);
            let label;
            if (pkColumns.includes(Object.keys(data[0])[index])) {
                label = "PK";
                newInput.classList.add(label);
            }
            if (fkColumns.includes(Object.keys(data[0])[index])) {
                label = "FK";
                newInput.classList.add(label);
            }
            if (nnColumns.includes(Object.keys(data[0])[index])) {
                label = "NN";
                newInput.classList.add(label);
            }
            newInput.name = Object.keys(data[0])[index];
            newInput.readOnly = true;
            newDiv.appendChild(newInput);
        });
        tableData.appendChild(newDiv);
    });

    deleteRowSvgAdd();
    const insertData = document.querySelector(".insertData");
    // add new row
    addDataRow.addEventListener("click", () => {
        // addDataRow.disabled = true;
        // addDataRow.style.background = "linear-gradient(var(--color3), var(--color3)) padding-box, linear-gradient(135deg, var(--color3), var(--color3)) border-box";
        addDataRow.style.display = "none";
        insertData.style.display = "block";
        let newDiv = document.createElement("div");
        newDiv.setAttribute("class", "dataRow");
        let div = document.createElement("div");
        div.innerHTML = `
                    <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path id="Vector" d="M14 16H20M21 10V9C21 7.89543 20.1046 7 19 7H5C3.89543 7 3 7.89543 3 9V11C3 12.1046 3.89543 13 5 13H11" stroke="var(--color4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
        div.classList.add("deleteRow");
        div.title = "remove row";
        newDiv.appendChild(div);
        columnList.forEach(colName => {
            let label;
            const colMeta = metaData.find(c => c.COLUMN_NAME === colName);
            let newInput = document.createElement("input");
            newInput.type = "text";
            newInput.value = "";
            newInput.name = colName;
            if (colMeta.CONSTRAINT_TYPE === "PRIMARY KEY") {
                label = "PK";
                newInput.classList.add(label);
            }
            if (colMeta.CONSTRAINT_TYPE === "FOREIGN KEY") {
                label = "FK";
                newInput.classList.add(label);
            }
            if (colMeta.IS_NULLABLE === "NO") {
                label = "NN";
                newInput.classList.add(label);
            }
            newInput.readOnly = true;
            newDiv.appendChild(newInput);
        });
        tableData.appendChild(newDiv);
        DeleteRow(dbName, tableName);
    });

    DeleteRow(dbName, tableName);
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
    const textarea = document.getElementById("sqlEditor");
    const lineNumbers = document.getElementById("lineNumbers");
    const outputScreen = document.querySelector('.outputScreen');
    const popUpQueryWindow = document.querySelector('.popUpQueryWindow');
    const fromDisplay = document.querySelector('.fromDisplay');

    textarea.addEventListener("input", function () {
        updateLineNumbers(textarea, lineNumbers);
    });
    textarea.addEventListener("scroll", () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    });

    updateLineNumbers(textarea, lineNumbers);

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
        fromDisplay.style.zIndex = "0";
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
                outputWindow("Database name cannot be empty!");
                return
            }

            const invalidPattern = /(^[0-9])|[\s\-@#%&*!]|[^\x00-\x7F]/;

            if (invalidPattern.test(newDBname)) {
                let errorMsg =
                    "Invalid database name!\n\n" +
                    "Rules:\n" +
                    "- Must NOT start with a number\n" +
                    "- No spaces\n" +
                    "- No hyphens (-)\n" +
                    "- No special characters (@ # % & * !)\n" +
                    "- No emoji or unicode characters";
                outputWindow(errorMsg);
                removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross, fromDisplay);
                return;
            }

            const existingDBNames = Array.from(tooltipNodeList).map(oneTooltip => oneTooltip.textContent);

            if (existingDBNames.includes(newDBname)) {
                outputWindow("Database name already exists!");
                return;
            }

            createDatabases(newDBname);

            newDBname = "";

            removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross, fromDisplay);
        }
    });

    // Close input field on click event
    CloseCross.onclick = () => {
        removeStyle1(nameInput, addSvg, tooltip, red, yellow, NameInput, routingContainer, CloseCross, fromDisplay);
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
        // NameOfDatabase = dbName;

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
    outputScreenClose(routingContainer);

    makeDraggable(outputScreen);
    makeDraggable(popUpWindow);
    makeDraggable(popUpQueryWindow);

    openOutputScreen(outputScreen);

    settingOpen();
}

function initTableView($location, $rootScope, dbName) {
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
    let dataTypeList;
    let realTbNameForDel = "";
    let TbSvgForRemove = "";
    const AddRow = document.querySelector("#AddRow");
    let rowCount = 0;
    const RemoveRow = document.querySelector("#RemoveRow");
    const resetBtn = document.querySelector("#resetBtn");
    const h3Tag = document.querySelector(".DBTabletTitle");
    let capitalizedDBName = dbName.charAt(0).toUpperCase() + dbName.slice(1);
    h3Tag.textContent = `${capitalizedDBName} database tables`;
    const textarea = document.getElementById("sqlEditor");
    const lineNumbers = document.getElementById("lineNumbers");
    const createBtn = document.querySelector(".createBtn");
    const outputScreen = document.querySelector('.outputScreen');
    const popUpQueryWindow = document.querySelector('.popUpQueryWindow');

    fetchTables(SvgGridTemplate, dbName);

    textarea.addEventListener("input", function () {
        updateLineNumbers(textarea, lineNumbers)
    });

    textarea.addEventListener("scroll", () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    });

    updateLineNumbers(textarea, lineNumbers);

    message.textContent = "Are you sure you want to permanently delete this table? This will remove all data in the table and cannot be undone.";

    // open table creation form on click event
    addSvg.onclick = () => {
        routingContainer.style.filter = "blur(3px)";
        fromDisplay2.style.display = "flex";
        createBtn.textContent = "Create";
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

    // Redirect to table view page
    SvgGridTemplate.addEventListener("click", function (event) {
        const svg = event.target.closest(".SvgBlock > svg[id]");
        if (!svg) return;

        if (event.target.closest(".deleteSvg")) return;
        console.log("Clicked Tb:", svg.id.replace(/Svg$/, ""));

        const tableName = svg.id.replace(/Svg$/, "");
        // NameOfTable = tableName;

        $rootScope.$apply(() => {
            $location.path(`/tableDataView/${dbName}/${tableName}`);
        });
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

        dataTypeList = btn.querySelector(".dataTypeList");
        dataTypeList.style.opacity = "1";
        dataTypeList.style.width = "7rem";
        dataTypeList.style.height = "18.3rem";
    });

    document.addEventListener("click", function (event) {

        // If click is inside any .dataType → do nothing
        if (event.target.closest(".dataType")) return;

        // Otherwise close ALL open dropdowns
        const openLists = document.querySelectorAll(".dataTypeList");

        openLists.forEach((list) => {
            list.removeAttribute("style");
        });
    });

    AddRow.onclick = () => {
        rowCount++;
        const newRow = document.createElement("div");
        newRow.classList.add("row");
        newRow.innerHTML = `
                    <div class="columnNameInputDiv">
                        <input type="text" class="columnName" name="columnName" placeholder="Enter Column Name" required />
                    </div>

                    <button type="button" class="dataType">
                        <p class="selectedDataType">Select Data Type</p>
                        <ul class="dataTypeList">
                            <li>INT()</li>
                            <li>BIGINT()</li>
                            <li>DECIMAL()</li>
                            <li>FLOAT</li>
                            <li>DOUBLE</li>
                            <li>VARCHAR()</li>
                            <li>CHAR()</li>
                            <li>TEXT()</li>
                            <li>DATE</li>
                            <li>DATETIME()</li>
                            <li>TIMESTAMP()</li>
                            <li>BOOLEAN</li>
                        </ul>
                    </button>

                    <div class="sizeInputDiv">
                        <input type="number" class="sizeInput" name="sizeValue" placeholder="size" disabled/>
                    </div>
                    <!-- Only ONE PRIMARY KEY per table -->
                    <input type="radio" id="pk${rowCount}" name="pk" value="pk${rowCount}" hidden />
                    <label for="pk${rowCount}" class="btn Pk">Primary Key</label>

                    <input type="checkbox" id="nn${rowCount}" name="nn" value="nn${rowCount}" hidden />
                    <label for="nn${rowCount}" class="btn NN">Not Null</label>

                    <input type="checkbox" id="uq${rowCount}" name="uq" value="uq${rowCount}" hidden />
                    <label for="uq${rowCount}" class="btn">Unique</label>

                    <input type="checkbox" id="us${rowCount}" name="us" value="us${rowCount}" hidden />
                    <label for="us${rowCount}" class="btn">Unsigned</label>

                    <input type="radio" id="ai${rowCount}" name="ai" value="ai${rowCount}" hidden />
                    <label for="ai${rowCount}" class="btn Ai">Auto Increment</label>

                    <div class="defaultValueDiv">
                        <input type="text" class="expression" name="expression" placeholder="Enter Default Value / Expression" />
                    </div>
        `;
        rowContainer.appendChild(newRow);
        fromDisplay2buttonFeature();
    };

    OptionSelection();

    RemoveRow.onclick = () => {
        // Table must have at least one row
        if (rowCount <= 0) {
            outputWindow("Table create form at least have 1 row");
            return;
        }

        let lastRow = rowContainer.lastChild;
        rowContainer.removeChild(lastRow);
        rowCount--;
        fromDisplay2buttonFeature();
    };

    resetBtn.addEventListener("click", () => {
        let selectedDataTypeList = document.querySelectorAll(".selectedDataType");

        selectedDataTypeList.forEach((selectedDT) => {
            selectedDT.innerText = "Select Data Type";
            if (dataTypeList.style) {
                dataTypeList.removeAttribute("style");
            }
        });
    });

    createBtn.addEventListener("click", () => {
        let allCorrect = ruleChecker();
        if (allCorrect) {
            createTable(dbName);
        }
    });

    fromDisplay2buttonFeature();

    queryRunner(routingContainer);
    outputScreenClose(routingContainer);

    makeDraggable(outputScreen);
    makeDraggable(popUpWindow);
    makeDraggable(popUpQueryWindow);

    openOutputScreen(outputScreen);

    settingOpen();
}

function initTableDataView(dbName, tableName) {
    console.log("this is table data view page = " + dbName + " and " + tableName);
    const h3Tag = document.querySelector(".DBTabletTitle");
    h3Tag.textContent = `Data from ${tableName} table in ${dbName} database`;

    const routingContainer = document.querySelector(".routingContainer");
    const popUpWindow = document.querySelector(".popUpWindow");;
    const textarea = document.getElementById("sqlEditor");
    const lineNumbers = document.getElementById("lineNumbers");
    const outputScreen = document.querySelector('.outputScreen');
    const popUpQueryWindow = document.querySelector('.popUpQueryWindow');

    const tableTemplate = document.querySelector(".tableTemplate");
    fetchTableData(tableTemplate, dbName, tableName);

    textarea.addEventListener("input", function () {
        updateLineNumbers(textarea, lineNumbers)
    });

    textarea.addEventListener("scroll", () => {
        lineNumbers.scrollTop = textarea.scrollTop;
    });

    updateLineNumbers(textarea, lineNumbers);

    queryRunner(routingContainer);
    outputScreenClose(routingContainer);

    makeDraggable(outputScreen);
    makeDraggable(popUpWindow);
    makeDraggable(popUpQueryWindow);

    openOutputScreen(outputScreen);

    settingOpen();

    getChangeData(dbName, tableName, tableTemplate);
    
    const editTableColumn = document.querySelector(".editTableColumn");
    const fromDisplay2 = document.querySelector(".fromDisplay2");
    const CloseCross2 = document.querySelector(".CloseCross2");
    const AddRow = document.querySelector("#AddRow");
    let rowCount = 0;
    const RemoveRow = document.querySelector("#RemoveRow");
    const resetBtn = document.querySelector("#resetBtn");
    const updateBtn = document.querySelector(".updateBtn");
    const rowContainer = document.querySelector(".rowContainer");

    editTableColumn.addEventListener("click", (event) => {
        event.stopPropagation();
        routingContainer.style.filter = "blur(3px)";
        fromDisplay2.style.display = "flex";
        updateBtn.textContent = "Update";
        editColumn(dbName, tableName);
    });

    CloseCross2.onclick = () => {
        fromDisplay2.style.display = "none";
        routingContainer.removeAttribute("style");
    };

    AddRow.onclick = () => {
        rowCount++;
        const newRow = document.createElement("div");
        newRow.classList.add("row");
        newRow.innerHTML = `
                    <div class="columnNameInputDiv">
                        <input type="text" class="columnName" name="columnName" placeholder="Enter Column Name" required />
                    </div>

                    <button type="button" class="dataType">
                        <p class="selectedDataType">Select Data Type</p>
                        <ul class="dataTypeList">
                            <li>INT()</li>
                            <li>BIGINT()</li>
                            <li>DECIMAL()</li>
                            <li>FLOAT</li>
                            <li>DOUBLE</li>
                            <li>VARCHAR()</li>
                            <li>CHAR()</li>
                            <li>TEXT()</li>
                            <li>DATE</li>
                            <li>DATETIME()</li>
                            <li>TIMESTAMP()</li>
                            <li>BOOLEAN</li>
                        </ul>
                    </button>

                    <div class="sizeInputDiv">
                        <input type="number" class="sizeInput" name="sizeValue" placeholder="size" disabled/>
                    </div>
                    <!-- Only ONE PRIMARY KEY per table -->
                    <input type="radio" id="pk${rowCount}" name="pk" value="pk${rowCount}" hidden />
                    <label for="pk${rowCount}" class="btn Pk">Primary Key</label>

                    <input type="checkbox" id="nn${rowCount}" name="nn" value="nn${rowCount}" hidden />
                    <label for="nn${rowCount}" class="btn NN">Not Null</label>

                    <input type="checkbox" id="uq${rowCount}" name="uq" value="uq${rowCount}" hidden />
                    <label for="uq${rowCount}" class="btn">Unique</label>

                    <input type="checkbox" id="us${rowCount}" name="us" value="us${rowCount}" hidden />
                    <label for="us${rowCount}" class="btn">Unsigned</label>

                    <input type="radio" id="ai${rowCount}" name="ai" value="ai${rowCount}" hidden />
                    <label for="ai${rowCount}" class="btn Ai">Auto Increment</label>

                    <div class="defaultValueDiv">
                        <input type="text" class="expression" name="expression" placeholder="Enter Default Value / Expression" />
                    </div>
        `;
        rowContainer.appendChild(newRow);
        fromDisplay2buttonFeature();
    };

    RemoveRow.onclick = () => {
        // Table must have at least one row
        if (rowCount <= 0) {
            outputWindow("Table create form at least have 1 row");
            return;
        }

        let lastRow = rowContainer.lastChild;
        rowContainer.removeChild(lastRow);
        rowCount--;
        fromDisplay2buttonFeature();
    };

    fromDisplay2buttonFeature();

    rowContainer.addEventListener("click", function (event) {
        btn = event.target.closest(".dataType");
        if (!btn) return;

        dataTypeList = btn.querySelector(".dataTypeList");
        dataTypeList.style.opacity = "1";
        dataTypeList.style.width = "7rem";
        dataTypeList.style.height = "18.3rem";
    });

    document.addEventListener("click", function (event) {
        // If click is inside any .dataType → do nothing
        if (event.target.closest(".dataType")) return;
        // Otherwise close ALL open dropdowns
        const openLists = document.querySelectorAll(".dataTypeList");
        openLists.forEach((list) => {
            list.removeAttribute("style");
        });
    });

    OptionSelection();

    resetBtn.addEventListener("click", () => {
        let selectedDataTypeList = document.querySelectorAll(".selectedDataType");

        selectedDataTypeList.forEach((selectedDT) => {
            selectedDT.innerText = "Select Data Type";
            if (dataTypeList.style) {
                dataTypeList.removeAttribute("style");
            }
        });
    });

    updateBtn.addEventListener("click", () => {
        let allCorrect = ruleChecker();
        if (allCorrect) {
            console.log("update metadata");
        }
    });

}

async function editColumn(dbName, tableName) {
    try {
        const response = await fetch(
            `http://localhost:3000/TableSchema?databaseName=${dbName}&tableName=${tableName}`
        );

        const columns = await response.json();
        if (!columns.length) {
            outputWindow("No schema found");
            return;
        }
    
        const tableNameInput = document.querySelector("#tableNameInput");
        tableNameInput.value = tableName;
        let rowContainer = document.querySelector(".rowContainer");
        rowContainer.innerHTML = "";
        
        let rowCount = 0
        columns.forEach(col=> {
            console.log(col);
            rowCount++;
            const newRow = document.createElement("div");
            newRow.classList.add("row");
            newRow.innerHTML = `
                        <div class="columnNameInputDiv">
                            <input type="text" class="columnName" name="columnName" value="${col.columnName}" placeholder="Enter Column Name" required />
                        </div>

                        <button type="button" class="dataType">
                            <p class="selectedDataType">${col.dataType}</p>
                            <ul class="dataTypeList">
                                <li>INT()</li>
                                <li>BIGINT()</li>
                                <li>DECIMAL()</li>
                                <li>FLOAT</li>
                                <li>DOUBLE</li>
                                <li>VARCHAR()</li>
                                <li>CHAR()</li>
                                <li>TEXT()</li>
                                <li>DATE</li>
                                <li>DATETIME()</li>
                                <li>TIMESTAMP()</li>
                                <li>BOOLEAN</li>
                            </ul>
                        </button>

                        <div class="sizeInputDiv">
                            <input type="number" class="sizeInput" name="sizeValue" value="${col.size}" placeholder="size" disabled/>
                        </div>
                        <!-- Only ONE PRIMARY KEY per table -->
                        <input type="radio" id="pk${rowCount}" name="pk" value="pk${rowCount}" hidden />
                        <label for="pk${rowCount}" class="btn Pk">Primary Key</label>

                        <input type="checkbox" id="nn${rowCount}" name="nn" value="nn${rowCount}" hidden />
                        <label for="nn${rowCount}" class="btn NN">Not Null</label>

                        <input type="checkbox" id="uq${rowCount}" name="uq" value="uq${rowCount}" hidden />
                        <label for="uq${rowCount}" class="btn">Unique</label>

                        <input type="checkbox" id="us${rowCount}" name="us" value="us${rowCount}" hidden />
                        <label for="us${rowCount}" class="btn">Unsigned</label>

                        <input type="radio" id="ai${rowCount}" name="ai" value="ai${rowCount}" hidden />
                        <label for="ai${rowCount}" class="btn Ai">Auto Increment</label>

                        <div class="defaultValueDiv">
                            <input type="text" class="expression" name="expression" value="${col.defaultValue}" placeholder="Enter Default Value / Expression" />
                        </div>
            `;
            rowContainer.appendChild(newRow);
            
            const pkEl = document.querySelector(`#pk${rowCount}`);
            const nnEl = document.querySelector(`#nn${rowCount}`);
            const uqEl = document.querySelector(`#uq${rowCount}`);
            const usEl = document.querySelector(`#us${rowCount}`);
            const aiEl = document.querySelector(`#ai${rowCount}`);
            
            if (col.primaryKey) {
                pkEl.checked = true;
            }
            if (col.notNull) {
                nnEl.checked = true;
            }
            if (col.unique) {
                uqEl.checked = true;
            }
            if (col.unsigned) {
                usEl.checked = true;
            }
            if (col.autoIncrement) {
                aiEl.checked = true;
            }

            fromDisplay2buttonFeature();
            OptionSelection();

            console.log(rowCount);
        }); 

    } catch (err) {
        outputWindow(err.message);
    }
}