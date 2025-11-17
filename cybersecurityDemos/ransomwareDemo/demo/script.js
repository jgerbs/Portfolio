/******************************************************************
   RANSOMWARE SIM DEMO + FULL SPLUNK-STYLE LOG VIEWER
******************************************************************/

/* ==========================================================
   GLOBALS
========================================================== */
let splunkEventsCache = [];

/* Fake File System */
let fileSystem = {
    Documents: {
        expanded: true,
        files: [
            {
                name: "invoice.pdf",
                type: "PDF Document",
                size: "124 KB",
                modified: "2025-10-05 11:42 AM",
                encrypted: false,
                content: "Invoice for October 2025\nAmount Due: $3,200.00\nClient ID: 44892"
            },
            {
                name: "payroll.xlsx",
                type: "Excel Workbook",
                size: "85 KB",
                modified: "2025-10-03 9:18 AM",
                encrypted: false,
                content: "Employee | Hours | Rate | Gross\nA01 | 80 | 24 | 1920\nA02 | 88 | 19 | 1672"
            },
            {
                name: "benefits.docx",
                type: "Word Document",
                size: "52 KB",
                modified: "2025-10-02 8:11 AM",
                encrypted: false,
                content: "Benefit updates for 2025 include extended health coverage..."
            }
        ]
    },

    Pictures: {
        expanded: false,
        files: [
            {
                name: "team-photo.jpg",
                type: "JPEG Image",
                size: "350 KB",
                modified: "2025-09-28 4:17 PM",
                encrypted: false,
                content: src = "../../../images/team-photo.jpg"
            }
        ]
    },

    Downloads: {
        expanded: true,
        files: []
    }
};


/******************************************************************
   PAGE INIT
******************************************************************/
window.onload = () => {
    document.getElementById("introModal").style.display = "flex";
    loadFoogleSearch();
};

document.getElementById("introProceed").onclick = () => {
    document.getElementById("introModal").style.display = "none";
};


/******************************************************************
   UTILS
******************************************************************/
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/******************************************************************
   LOGGING → SPLUNK
******************************************************************/
function log(msg) {

    let severity = "info";  // default

    if (msg.includes("Suspicious")) severity = "warning";
    if (msg.includes("Encrypting")) severity = "critical";
    if (msg.includes("shadow copy")) severity = "critical";
    if (msg.includes("Ransomware finished")) severity = "critical";

    const event = {
        time: new Date().toISOString(),
        host: "EmployeeWorkstation-01",
        source: "ransomware-sim.js",
        raw: msg,
        json: {
            event: msg,
            host: "EmployeeWorkstation-01",
            severity: severity,
            action: "simulation",
            timestamp: Date.now()
        }
    };

    splunkAddEvent(event);
}



/******************************************************************
   FOOGLE SEARCH PAGE
******************************************************************/
function loadFoogleSearch() {
    const left = document.getElementById("leftContent");

    left.innerHTML = `
        <div class="foogle-logo">
            <span>F</span><span>o</span><span>o</span>
            <span>g</span><span>l</span><span>e</span>
        </div>

        <div class="foogle-searchbar">free photo editor windows</div>

        <div class="foogle-result">
            <div class="foogle-link">PhotoStudioPro — Free Photo Editor for Windows</div>
            <div class="foogle-url">https://www.photo-editor-foogle-downloads.com</div>
            <div class="foogle-desc">Fast, powerful, and free editor. RAW support, filters, and more.</div>

            <button id="visitSiteBtn" class="visitBtn">Visit Site</button>
        </div>
    `;

    document.getElementById("visitSiteBtn").onclick = loadFakeSite;
}


/******************************************************************
   FAKE SOFTWARE DOWNLOAD PAGE
******************************************************************/
function loadFakeSite() {
    const left = document.getElementById("leftContent");

    left.innerHTML = `
        <div class="simple-photosite">

            <div class="simple-banner">
                <h2>PhotoStudioPro Photo Editing Software</h2>
                <p>Edit your photos quickly and easily</p>
            </div>

            <div class="simple-flex">
                <div class="simple-left">

                    <ul>
                        <li>Crop, resize, and enhance</li>
                        <li>Retouch photos effortlessly</li>
                        <li>Color filters and effects</li>
                        <li>Creative tools included</li>
                    </ul>

                    <button id="downloadBtn" class="simple-download-btn">
                        Download for Windows
                    </button>

                    <button id="backToSearch" class="simple-back-btn">
                        Back to Foogle
                    </button>

                </div>

                <div class="simple-right">
                    <img src="../../../images/photoeditor.jpg" class="simple-screenshot">
                </div>
            </div>

        </div>
    `;

    document.getElementById("downloadBtn").onclick = handleDownload;
    document.getElementById("backToSearch").onclick = loadFoogleSearch;
}


/******************************************************************
   HANDLE DOWNLOAD (Add UnapprovedApp.exe)
******************************************************************/
function handleDownload() {

    fileSystem.Downloads.files.push({
        name: "UnapprovedApp.exe",
        type: "Application",
        size: "3.1 MB",
        modified: new Date().toLocaleString(),
        encrypted: false,
        content: "Executable placeholder"
    });

    renderFileSystem();
    log("Downloaded UnapprovedApp.exe into Downloads folder.");
}


/******************************************************************
   FILE SYSTEM RENDERING
******************************************************************/
function renderFileSystem() {
    const fx = document.getElementById("fileExplorer");
    fx.innerHTML = "";

    for (const folderName in fileSystem) {
        const folder = fileSystem[folderName];

        /* Folder header */
        const row = document.createElement("div");
        row.className = "folder-row";
        row.innerHTML = `
            <span class="caret">${folder.expanded ? "▼" : "▶"}</span>
            <span class="folder-name">${folderName}</span>
        `;

        row.onclick = () => {
            folder.expanded = !folder.expanded;
            renderFileSystem();
        };

        fx.appendChild(row);

        /* Folder contents */
        if (folder.expanded) {
            folder.files.forEach((file, index) => {

                const fileRow = document.createElement("div");
                fileRow.className = "file-row";

                if (file.encrypted) fileRow.classList.add("encrypted");

                fileRow.innerHTML = `
                    <img src="../../../images/file-icon.png" class="file-icon">
                    <span>${file.name}</span>
                    <span>${file.type}</span>
                    <span>${file.size}</span>
                    <span>${file.modified}</span>
                `;

                fileRow.onclick = (event) => {
                    event.stopPropagation();

                    if (file.name === "UnapprovedApp.exe" && !file.encrypted) {
                        document.getElementById("executeModal").style.display = "flex";
                        return;
                    }

                    if (file.encrypted) {
                        openEncryptedWarning(file);
                        return;
                    }

                    openFilePreview(file);
                };

                fx.appendChild(fileRow);
            });
        }
    }
}

renderFileSystem();


/******************************************************************
   FILE PREVIEW MODAL
******************************************************************/
function openFilePreview(file) {
    document.getElementById("fileModal").style.display = "flex";
    document.getElementById("fileModalTitle").textContent = `${file.name} (Preview)`;
    document.getElementById("fileModalContent").textContent = file.content;
}

document.getElementById("fileModalClose").onclick = () => {
    document.getElementById("fileModal").style.display = "none";
};
document.getElementById("ransomClose").onclick = () => {
    document.getElementById("ransomModal").style.display = "none";
};


/******************************************************************
   ENCRYPTED FILE OPEN → RANSOM MODAL
******************************************************************/
function openEncryptedWarning(file) {
    document.getElementById("ransomModal").style.display = "flex";

    const preview = document.getElementById("ransomEncryptedContent");
    preview.textContent = fakeEncrypt(file.content);
}


/******************************************************************
   SAFE ENCRYPT / DECRYPT
******************************************************************/
function fakeEncrypt(txt) {
    return btoa(txt).split("").reverse().join("");
}

function fakeDecrypt(txt) {
    return atob(txt.split("").reverse().join(""));
}


/******************************************************************
   EXECUTE .EXE → WARNING
******************************************************************/
document.getElementById("execCancel").onclick = () => {
    document.getElementById("executeModal").style.display = "none";
};

document.getElementById("execConfirm").onclick = () => {
    document.getElementById("executeModal").style.display = "none";
    runSimulation();
};


/******************************************************************
   RUN RANSOMWARE (Silent Encrypt)
******************************************************************/
async function runSimulation() {

    // Start LED: ON and pulsing
    setStatus("Ransomware Running", true);

    log("User executed UnapprovedApp.exe");
    await wait(700);

    setStatus("Suspicious Activity Detected", true);
    log("Suspicious post-install script triggered.");
    await wait(800);

    setStatus("Scanning Files...", true);
    log("Scanning files silently...");
    await wait(800);

    /* Encrypt each file */
    for (const folderName in fileSystem) {
        const folder = fileSystem[folderName];

        for (let file of folder.files) {

            setStatus(`Encrypting ${file.name}...`, true);
            log("Encrypting " + file.name);

            file.encrypted = true;
            file.content = fakeEncrypt(file.content);
            file.name = file.name + ".jackcrypt";

            renderFileSystem();
            await wait(600);
        }
    }

    setStatus("Deleting Shadow Copies...", true);
    log("Attempting shadow copy deletion (simulated).");
    await wait(600);

    setStatus("Files Encrypted", false);
    log("Ransomware finished encrypting files.");
}



/******************************************************************
   DECRYPT (Simulated Payment)
******************************************************************/
document.getElementById("decryptBtn").onclick = () => {

    for (const folderName in fileSystem) {
        const folder = fileSystem[folderName];

        folder.files.forEach(file => {
            file.encrypted = false;
            file.content = fakeDecrypt(file.content);
            file.name = file.name.replace(".jackcrypt", "");
        });
    }

    renderFileSystem();

    log("Files restored after simulated ransom payment.");
    document.getElementById("ransomModal").style.display = "none";

    document.getElementById("statusBar").textContent = "Status: Files restored.";
};


/******************************************************************
   SPLUNK ENGINE — REAL SEARCH & HIGHLIGHT
******************************************************************/

function splunkAddEvent(event) {
    splunkEventsCache.push(event);
    renderSplunkEvents(splunkEventsCache);
}

/* Highlight */
function highlight(text, query) {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(safe, "gi"), m => `<mark class="splunk-highlight">${m}</mark>`);
}

/* Syntax color JSON */
function syntaxHighlightJSON(obj) {
    return JSON.stringify(obj, null, 2)
        .replace(/\"([^"]+)\"(?=\:)/g, '<span class="json-key">"$1"</span>')
        .replace(/\"([^"]+)\"/g, '<span class="json-string">"$1"</span>')
        .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
        .replace(/\b([0-9]+)\b/g, '<span class="json-number">$1</span>');
}

/* Parse Splunk-like queries */
function parseQuery(q) {
    const parts = q.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const filters = { raw: [], fields: {} };

    parts.forEach(p => {
        if (p.includes("=")) {
            const [field, val] = p.split("=");
            filters.fields[field.toLowerCase()] = val.replace(/"/g, "").toLowerCase();
        } else {
            filters.raw.push(p.replace(/"/g, "").toLowerCase());
        }
    });

    return filters;
}

/* Match event using query */
function splunkMatchEvent(ev, filters) {

    // field=value filters
    for (const field in filters.fields) {
        const val = filters.fields[field];
        const src =
            (ev[field] ||
                ev.json[field] ||
                "").toString().toLowerCase();

        if (!src.includes(val)) return false;
    }

    // raw text search
    for (const kw of filters.raw) {
        const raw = (ev.raw + " " + JSON.stringify(ev.json)).toLowerCase();
        if (!raw.includes(kw)) return false;
    }

    return true;
}


/******************************************************************
   RENDER SPLUNK EVENTS
******************************************************************/

function renderSplunkEvents(events, query = "") {
    const container = document.getElementById("splunkEvents");
    container.innerHTML = "";

    const filters = parseQuery(query);

    events
        .filter(ev => splunkMatchEvent(ev, filters))
        .forEach(ev => {

            const severity = ev.json.severity?.toLowerCase() || "info";
            const sevClass = "sev-" + severity;

            const row = document.createElement("div");
            row.className = "splunk-event " + sevClass;

            const sevTag = `<span class="splunk-severity-tag">${severity.toUpperCase()}</span>`;

            row.innerHTML = `
                <div class="splunk-time">${highlight(ev.time, filters.raw[0])}</div>
                <div class="splunk-host">${highlight(ev.host, filters.fields["host"])}</div>
                <div class="splunk-source">${highlight(ev.source, filters.fields["source"])}</div>
                <div class="splunk-raw">
                    ${highlight(ev.raw, filters.raw[0])}
                    ${sevTag}
                </div>
            `;

            let expanded = null;

            row.onclick = () => {
                if (expanded) {
                    expanded.remove();
                    expanded = null;
                } else {
                    expanded = document.createElement("div");
                    expanded.className = "splunk-expanded";
                    expanded.innerHTML = syntaxHighlightJSON(ev.json);
                    row.insertAdjacentElement("afterend", expanded);
                }
            };

            container.appendChild(row);
        });
}


/******************************************************************
   SEARCH BUTTON + ENTER
******************************************************************/
document.getElementById("splunkSearchBtn").onclick = () => {
    renderSplunkEvents(splunkEventsCache, document.getElementById("splunkSearchInput").value);
};

document.getElementById("splunkSearchInput").onkeydown = e => {
    if (e.key === "Enter") {
        renderSplunkEvents(splunkEventsCache, e.target.value);
    }
};

/******************************************************************
    Status LED
******************************************************************/
function setStatus(text, active = false) {
    const led = document.getElementById("statusLed");
    const label = document.getElementById("statusLabel");

    label.textContent = text;

    if (active) {
        led.classList.add("active");
    } else {
        led.classList.remove("active");
    }
}
