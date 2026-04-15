# Ransomware Incident Report

A structured post-mortem analysis of the ransomware simulation, written and formatted as a professional incident report with timeline reconstruction, IOC documentation, MITRE ATT&CK mapping, and remediation guidance.

## Overview

This page presents the ransomware simulation from the perspective of the analyst rather than the victim. It documents what happened, when, what evidence was collected, and what it means — following the structure and terminology used in real incident response work. An interactive evidence carousel walks through eleven annotated screenshots from the simulation. An embedded Figma diagram visualizes the full attack chain.

The report is aligned with NIST 800-61, CompTIA Security+, and Google Cybersecurity Certificate frameworks, making it useful as a reference for understanding how IR documentation is structured in practice.

## Contents

**Executive Summary**
A one-paragraph description of the simulated incident, its scope, and the frameworks applied in the analysis.

**Attack Overview**
A narrative of the incident from initial access through impact, structured around the five observed phases: social engineering, user execution, file discovery, encryption, and shadow copy deletion.

**Timeline of Events**
A table reconstructing eleven discrete events from Sysmon log timestamps — from the initial file download through the final encryption and ransom display.

**Evidence Viewer**
An interactive carousel of eleven annotated screenshots from the simulation, navigated with previous/next buttons. Each figure is captioned to explain what it shows and why it matters:

- Figures 1–2: Social engineering and fake download site
- Figures 3–5: Download, file system baseline, execution warning
- Figures 6–9: Sysmon execution logs, suspicious script activity, file enumeration, encryption events
- Figures 10–11: Post-encryption file system and ransom modal

**Indicators of Compromise (IOCs)**
A table of eight IOC entries extracted from the simulation logs:

| Type | Indicator |
|---|---|
| SHA-256 hash | Malicious binary |
| MD5 hash | Malicious binary |
| Filename | `UnapprovedApp.exe` |
| Process path | `C:\Users\Jack\Downloads\UnapprovedApp.exe` |
| Command line | Executed without arguments |
| Suspicious command | `vssadmin delete shadows /all /quiet` |
| File extension | `.jackcrypt` |
| Targeted files | `invoice.pdf`, `payroll.xlsx`, `benefits.docx`, `ransomware.jpg` |

**MITRE ATT&CK Mapping**
A table mapping five observed behaviors to their MITRE ATT&CK technique IDs:

| Tactic | Technique | ID |
|---|---|---|
| Initial Access | Drive-by Compromise | T1189 |
| Execution | User Execution | T1204.002 |
| Discovery | File and Directory Discovery | T1083 |
| Impact | Data Encrypted for Impact | T1486 |
| Defense Evasion | Inhibit System Recovery | T1490 |

**Attack Flow Diagram**
An embedded Figma diagram showing the full ransomware lifecycle as an interactive attack chain.

**Root Cause Analysis**
An analysis of why the attack succeeded: user execution of unverified software, absence of application allow-listing, insufficient endpoint protection, and lack of user awareness training.

**Recommendations**
Six concrete mitigations: application allow-listing (WDAC / AppLocker), web content filtering, EDR deployment, immutable backup segmentation, cybersecurity awareness training, and Sysmon + SIEM logging.

## Educational Purpose

Incident response documentation is a core skill in cybersecurity operations. This report teaches:

- How to structure an IR report from timeline reconstruction through root cause and remediation
- How Sysmon log fields map to specific attacker actions and MITRE techniques
- What IOCs look like in practice and how they are used to search for lateral movement or additional infections
- How MITRE ATT&CK provides a shared vocabulary for describing observed adversary behavior
- What a well-reasoned set of post-incident recommendations looks like

## Tech Stack

- HTML5
- CSS3 (`../../style.css` + `report.css`)
- Vanilla JavaScript — evidence carousel navigation, `DOMContentLoaded`
- Figma (embedded via `<iframe>`)

No frameworks, no build tools, no external API calls.

## Running Locally

```
open ransomwareDemo/breakdown/index.html
```

No server or installation required. The Figma embed requires an internet connection to load the attack flow diagram; all other content is static and works offline.

## Usage

1. Read through the report sections from top to bottom
2. Use the left/right arrows in the Evidence Viewer to cycle through all eleven screenshots
3. Compare the timeline table timestamps against the log entries visible in the simulation demo
4. Review the IOC table and consider how each entry would be used in a real threat hunt
5. Cross-reference the MITRE ATT&CK table against the attack overview narrative to see how behavior maps to technique IDs

## Ethical Use Notice

This report documents a fully simulated attack against a fictitious workstation environment. All IOCs, hashes, file paths, and log entries are generated by the simulation — they do not correspond to real malware, real systems, or real credentials.

The MITRE ATT&CK technique IDs and Sysmon event formats are real frameworks and real field schemas, included here to accurately reflect how this type of incident would be documented in a professional IR context.

## Limitations

- The evidence carousel images are screenshots captured from the simulation demo — they show simulated content, not real system output
- The Figma attack flow diagram requires an active internet connection to render
- The IOC hashes are placeholder values used for structural illustration; they do not correspond to any real malware sample
- The report covers only the five observed MITRE tactics — persistence and command-and-control are explicitly noted as not observed in this simulation

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
