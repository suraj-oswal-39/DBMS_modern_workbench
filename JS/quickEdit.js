function initTableView(dbName) {
    const nameInput = document.getElementById("nameInput");
    const addSvg = document.querySelector(".addSvg");
    const tooltip = document.querySelector(".tooltip");
    const red = document.querySelector(".red");
    const yellow = document.querySelector(".yellow");
    const NameInput = document.getElementById("NameInput");
    const SvgGridTemplate = document.querySelector(".SvgGridTemplate");
    const CloseCross = document.querySelector(".CloseCross");
    const popUpWindow = document.querySelector(".popUpWindow");
    const no = document.querySelector(".no");
    const yes = document.querySelector(".yes");
    const message = document.querySelector(".message");
    const rowContainer = document.querySelector(".rowContainer");
    message.textContent = "Are you sure you want to permanently delete this table? This will remove all data in the table and cannot be undone.";
    let realTbNameForDel = "";
    let TbSvgForRemove = "";
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
    // Delete database on click event
    SvgGridTemplate.addEventListener("click", function (event) {
        const deleteBtn = event.target.closest(".deleteSvg");
        if (!deleteBtn) return;
        event.stopPropagation();
        TbSvgForRemove = deleteBtn.closest(".SvgBlock");
        if (!TbSvgForRemove) return;
        realTbNameForDel = TbSvgForRemove.dataset.tableName;
        console.log("Deleted Tb:", realTbNameForDel);
        SvgGridTemplate.style.filter = "blur(3px)";
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
    no.onclick = () => {
        SvgGridTemplate.removeAttribute("style");
        popUpWindow.removeAttribute("style");
    };
    yes.onclick = () => {
        SvgGridTemplate.removeAttribute("style");
        popUpWindow.removeAttribute("style");
        deletionPopUpMessage("tableViewPage", realTbNameForDel, TbSvgForRemove, dbName);
    };
}