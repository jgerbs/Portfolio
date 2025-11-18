/******************************************************************
   EVIDENCE VIEWER CAROUSEL — FIXED (Runs After DOM Loads)
******************************************************************/

window.addEventListener("DOMContentLoaded", () => {

    const evidenceItems = [
        {
            src: "../../../images/incidentReport/fooglesim.png",
            caption: "Figure 1: User searches for a free photo editor and encounters the deceptive Foogle result."
        },
        {
            src: "../../../images/incidentReport/fakesite.png",
            caption: "Figure 2: Fake software download page used to lure the user into downloading malware."
        },
        {
            src: "../../../images/incidentReport/download.png",
            caption: "Figure 3: Sysmon log showing the malicious executable dropped into the Downloads folder."
        },
        {
            src: "../../../images/incidentReport/files.png",
            caption: "Figure 4: Baseline file system prior to encryption activity."
        },
        {
            src: "../../../images/incidentReport/warning.png",
            caption: "Figure 5: Security warning displayed before running the unapproved executable."
        },
        {
            src: "../../../images/incidentReport/executed.png",
            caption: "Figure 6: Sysmon Event ID 1 confirming execution of UnapprovedApp.exe."
        },
        {
            src: "../../../images/incidentReport/suspicious.png",
            caption: "Figure 7: Suspicious post-install script activity triggered by the malware."
        },
        {
            src: "../../../images/incidentReport/scanning.png",
            caption: "Figure 8: File enumeration — malware scanning documents prior to encryption."
        },
        {
            src: "../../../images/incidentReport/encrypt.png",
            caption: "Figure 9: Sysmon Event ID 11 logs confirming file encryption events."
        },
        {
            src: "../../../images/incidentReport/ransom-jack.png",
            caption: "Figure 10: File system after encryption — .jackcrypt extensions applied."
        },
        {
            src: "../../../images/incidentReport/ransom.png",
            caption: "Figure 11: Ransom modal shown after the encryption finishes."
        }
    ];

    let evIndex = 0;

    function updateEvidence() {
        document.getElementById("evImage").src = evidenceItems[evIndex].src;
        document.getElementById("evCaption").innerHTML = evidenceItems[evIndex].caption;
    }

    // Button handlers
    document.getElementById("evPrev").onclick = () => {
        evIndex = (evIndex - 1 + evidenceItems.length) % evidenceItems.length;
        updateEvidence();
    };

    document.getElementById("evNext").onclick = () => {
        evIndex = (evIndex + 1) % evidenceItems.length;
        updateEvidence();
    };

    updateEvidence();  // Initialize viewer

});
