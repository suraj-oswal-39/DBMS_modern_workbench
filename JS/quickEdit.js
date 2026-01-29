function fetchTables(SvgGridTemplate, databaseName) {
    fetch("http://localhost:8080/Tables", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseName: databaseName })
    })
        .then(res => res.json())
        .then(data =>
            data.forEach(function (Tb) {
                newTbSvg = document.createElement("div");
                newTbSvg.classList.add("SvgBlock");
                newTbSvg.setAttribute("id", `${db.Table}Svg`);
                newTbSvg.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" pointer-events="all" id="${Tb.Table}">
	            <defs>
	            	<linearGradient id="${Tb.Table}SvgGrow" x1="100%" y1="100%" x2="0%" y2="0%">
	            		<stop offset="0%" class="red"/>
	            		<stop offset="100%" class="yellow"/>
	            	</linearGradient>
	            </defs>
	            <style>
                    #${Tb.Table}Svg {
                        background:
                            linear-gradient(#060000, #060000) padding-box,
                            linear-gradient(145deg, #060000, #060000) border-box;
                        border: 0.3rem solid transparent;
                        border-radius: 1rem;
                        padding: 0.5em;
                    }

                    #${Tb.Table}Svg:hover {
                        background:
                            linear-gradient(#060000, #060000) padding-box,
                            linear-gradient(145deg, #ffff00, #ff0000) border-box;
                    }

	            	#${Tb.Table}Svg .red {
	            		stop-color: #303030;
	            	}

	            	#${Tb.Table}Svg .yellow {
	            		stop-color: #303030;
	            	}

	            	#${Tb.Table}Svg:hover .red {
	            		stop-color: #ff0000;
	            	}

	            	#${Tb.Table}Svg:hover .yellow {
	            		stop-color: #ffff00;
	            	}
	            </style>
                <g>
                    <path d="M 3.75 5 C 3.75 9 20.25 9 20.25 5" fill="none" stroke="url(#${Tb.Table}SvgGrow)" stroke-miterlimit="10"/>
                    <path d="M 3.75 5 C 3.75 -0.33 20.25 -0.33 20.25 5 L 20.25 19 C 20.25 24.33 3.75 24.33 3.75 19 Z" fill="none"
                        stroke="url(#${Tb.Table}SvgGrow)" stroke-miterlimit="10"/>
                </g>
            </svg>
            <div class="tooltipWrapper">
                <div class="tooltip">${Tb.Table}</div>
                <div class="deleteSvg">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24px" height="24px" viewBox="0 0 24 24"
                        pointer-events="all" id="${Tb.Table}Delete">
                    <defs>
                        <linearGradient id="${Tb.Table}DelCrossGrow" x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" class="red" />
                           <stop offset="100%" class="yellow" />
                        </linearGradient>
                    </defs>
                    <style>
                    #${Tb.Table}Delete .red {
	            		stop-color: #303030;
	            	}

	            	#${Tb.Table}Delete .yellow {
	            		stop-color: #303030;
	            	}

	            	#${Tb.Table}Delete:hover .red {
	            		stop-color: #ff0000;
	            	}

	            	#${Tb.Table}Delete:hover .yellow {
	            		stop-color: #ffff00;
	            	}
                    </style>
                    <path
                        d="M 0 9.6 L 9.6 9.6 L 9.6 0 L 14.4 0 L 14.4 9.6 L 24 9.6 L 24 14.4 L 14.4 14.4 L 14.4 24 L 9.6 24 L 9.6 14.4 L 0 14.4 Z"
                            fill="url(#${Tb.Table}DelCrossGrow)" stroke="none" />
                    </svg>
                </div>
            </div>
            `;
                SvgGridTemplate.insertBefore(newTbSvg, SvgGridTemplate.firstElementChild);
            })
        )
        .catch(err => alert(err.message));
}
function createTables(newTbName) {
    fetch("http://localhost:8080/create-Table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TbName: newTbName })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            // reloadPage();
            location.reload();
        })
        .catch(err => alert(err));
}
function deleteTables(TbName, TbSvg) {
    fetch("http://localhost:8080/delete-Table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TbName: TbName })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            TbSvg.remove();
        })
        .catch(err => alert(err));
}

function initTableView() {
    const nameInput = document.getElementById("nameInput");
    const addSvg = document.querySelector(".addSvg");
    const tooltip = document.querySelector(".tooltip");
    const red = document.querySelector(".red");
    const yellow = document.querySelector(".yellow");
    const NameInput = document.getElementById("NameInput");
    const SvgGridTemplate = document.querySelector(".SvgGridTemplate");
    const CloseCross = document.querySelector(".CloseCross");
    fetchTables(SvgGridTemplate);
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
            let newTbName = document.getElementById("nameInput").value.trim();
            let tooltipNodeList = document.querySelectorAll(".tooltip");
            if (newTbName === "") {
                alert("Database name cannot be empty!");
                return
            }
            const invalidPattern = /(^[0-9])|[\s\-@#%&*!]|[^\x00-\x7F]/;
            if (invalidPattern.test(newTbName)) {
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
            const existingTbNames = Array.from(tooltipNodeList).map(oneTooltip => oneTooltip.textContent);
            if (existingTbNames.includes(newTbName)) {
                alert("Database name already exists!");
                return;
            }
            createDatabases(newTbName);
            newTbName = "";
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
        const TbSvg = deleteBtn.closest(".SvgBlock");
        if (!TbSvg) return;
        const TbName = TbSvg.id;
        console.log("Deleted Tb:", TbName);
        deleteTables(TbName, TbSvg);
    });
    // Redirect to table data view page
    SvgGridTemplate.addEventListener("click", function (event) {
        const svg = event.target.closest(".SvgBlock > svg[id]");
        if (!svg) return;
        if (event.target.closest(".deleteSvg")) return;
        console.log("Clicked Tb:", svg.id);
        window.location.hash = "#!/tableData";
    });
}