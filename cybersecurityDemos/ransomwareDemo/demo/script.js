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
                name: "ransomware.jpg",
                type: "JPEG Image",
                size: "350 KB",
                modified: "2025-09-28 4:17 PM",
                encrypted: false,
                content: "../../../images/ransomware.jpg"
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
   REALISTIC SYSMon-STYLE LOGGING
******************************************************************/
function logSysmonLike(msg, fileTarget = null, severity = "info") {

    const event = {
        time: new Date().toISOString(),
        host: "EmployeeWorkstation-01",
        source: "Sysmon",
        event_id: determineEventId(msg),
        severity: severity,
        raw: msg,

        user: "WORKSTATION\\Jack",

        process: {
            image: "C:\\Users\\Jack\\Downloads\\UnapprovedApp.exe",
            commandLine: "\"C:\\Users\\Jack\\Downloads\\UnapprovedApp.exe\"",
            processId: 5824,
            parentProcessId: 4321,
            parentImage: "C:\\Windows\\explorer.exe",
            integrityLevel: "Medium",
            hashes: {
                MD5: "a2c9d4f65ff83e1a",
                SHA256: "921eab0c980d4cd3c72cbc88a901f45d0dd..."
            }
        },

        file: fileTarget
            ? {
                targetFilename: fileTarget,
                action: msg.includes("Encrypting") ? "FileEncrypted" : "FileAccessed"
            }
            : null,

        message: msg
    };

    splunkAddEvent(event);
}

function determineEventId(msg) {
    if (msg.includes("executed")) return 1;          // Process Create
    if (msg.includes("Encrypting")) return 11;       // File Write/Create
    if (msg.includes("shadow copy")) return 1;       // vssadmin.exe
    return 3;                                       // Generic activity
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
            <div class="foogle-link">PhotoStudioPro: Free Photo Editor for Windows</div>
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
                <h2>PhotoStudioPro: Free Photo Editing Suite</h2>
                <p>Fast, powerful, and easy-to-use tools for photographers and creators. Completely free to use!!! (this is a simulated unapproved app, download and execute the .exe below to learn more)</p>
            </div>

            <div class="simple-flex">

                <!-- LEFT SIDE (FEATURES + DOWNLOAD BUTTON) -->
                <div class="simple-left">

                    <h3 class="simple-section-title">Key Features</h3>

                    <ul class="simple-features">
                        <li><strong>AI Auto-Enhance</strong>: Instantly fixes exposure, color, and sharpness.</li>
                        <li><strong>Retouch Tools</strong>: Remove blemishes, smooth skin, clean backgrounds.</li>
                        <li><strong>120+ Filters</strong>: Cinematic, HDR, retro film, portrait presets.</li>
                        <li><strong>Layer Editing</strong>: Add text, overlays, and creative effects.</li>
                        <li><strong>RAW Support</strong>: Compatible with DSLR & mirrorless cameras.</li>
                        <li><strong>One-Click Export</strong>: Save for web, print, or social instantly.</li>
                    </ul>

                    <div class="simple-version-box">
                        <p><strong>Version:</strong> 4.7.2</p>
                        <p><strong>Updated:</strong> Oct 2025</p>
                        <p><strong>Size:</strong> 78 MB</p>
                        <p><strong>OS:</strong> Windows 10/11 (64-bit)</p>
                    </div>

                    <button id="downloadBtn" class="simple-download-btn">
                        Download for Windows
                    </button>

                    <div class="simple-safe-note">
                        <span>Secure digital signature verified</span>
                    </div>

                    <button id="backToSearch" class="simple-back-btn">
                        Back to Foogle
                    </button>

                </div>

                <!-- RIGHT SIDE (YOUR ORIGINAL IMAGE) -->
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
   HANDLE DOWNLOAD (Adds UnapprovedApp.exe)
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
    logSysmonLike("Downloaded UnapprovedApp.exe into Downloads folder.", 
        "C:\\Users\\Jack\\Downloads\\UnapprovedApp.exe",
        "info"
    );
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

    const box = document.getElementById("fileModalContent");

    if (file.type.includes("Image")) {
        box.innerHTML = `<img src="${file.content}" class="preview-image">`;
    } else {
        box.textContent = file.content;
    }
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

    setStatus("Ransomware Running", true);

    logSysmonLike("User executed UnapprovedApp.exe", null, "info");
    await wait(700);

    setStatus("Suspicious Activity Detected", true);
    logSysmonLike("Suspicious post-install script triggered.", null, "warning");
    await wait(800);

    setStatus("Scanning Files...", true);
    logSysmonLike("Scanning files silently...", null, "info");
    await wait(800);

    /* Encrypt each file */
    for (const folderName in fileSystem) {
        const folder = fileSystem[folderName];

        for (let file of folder.files) {

            setStatus(`Encrypting ${file.name}...`, true);

            const targetFile =
                `C:\\Users\\Jack\\${folderName}\\${file.name}`;

            logSysmonLike("Encrypting " + file.name, targetFile, "critical");

            file.encrypted = true;
            file.content = fakeEncrypt(file.content);
            file.name = file.name + ".jackcrypt";

            renderFileSystem();
            await wait(600);
        }
    }

    setStatus("Deleting Shadow Copies...", true);
    logSysmonLike("Attempting shadow copy deletion (simulated).",
        "C:\\Windows\\System32\\vssadmin.exe",
        "critical"
    );
    await wait(600);

    setStatus("Files Encrypted", false);
    logSysmonLike("Ransomware finished encrypting files.", null, "critical");
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

    logSysmonLike("Files restored after simulated ransom payment.", null, "info");
    document.getElementById("ransomModal").style.display = "none";

    setStatus("Files Restored", false);
};


/******************************************************************
   SPLUNK ENGINE — REAL SEARCH & HIGHLIGHT
******************************************************************/
function splunkAddEvent(event) {
    splunkEventsCache.push(event);
    renderSplunkEvents(splunkEventsCache);
}

/* Highlight search matches */
function highlight(text, query) {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(safe, "gi"), m => `<mark class="splunk-highlight">${m}</mark>`);
}

/* Syntax-highlight JSON */
function syntaxHighlightJSON(obj) {
    return JSON.stringify(obj, null, 2)
        .replace(/\"([^"]+)\"(?=\:)/g, '<span class="json-key">"$1"</span>')
        .replace(/\"([^"]+)\"/g, '<span class="json-string">"$1"</span>')
        .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
        .replace(/\b([0-9]+)\b/g, '<span class="json-number">$1</span>');
}

/* Parse Splunk-style queries */
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

/* Query matching engine */
function splunkMatchEvent(ev, filters) {

    // field=value filters
    for (const field in filters.fields) {
        const val = filters.fields[field];
        const src = (ev[field] || ev.json[field] || "").toString().toLowerCase();
        if (!src.includes(val)) return false;
    }

    // raw search
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

            const severity = ev.severity?.toLowerCase() || "info";
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
                    expanded.innerHTML = syntaxHighlightJSON(ev);
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
   STATUS LED SYSTEM
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
