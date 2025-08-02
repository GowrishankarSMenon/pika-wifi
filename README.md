<img width="3188" height="1202" alt="frame (3)" src="https://github.com/user-attachments/assets/517ad8e9-ad22-457d-9538-a9e62d137cd7" />

# Pika Wifi 🎯

## Basic Details
### Team Name: Strawhats
### Team Members
- Team Lead: Gowrishankar S Menon - Cochin University of Science and Technology
- Member 2: Ebin Amson - Cochin University of Science and Technology

### Project Description
Pika Wifi is a useless-but-delightful desktop application that gamifies your Wi-Fi experience. It provides motivational quotes whose intensity is inversely proportional to your signal strength, maps your connection history, and features an interactive Pikachu, all while running silently in the background.

### The Problem (that doesn't exist)
What if you're in a bad network area and you don't feel like hustling? What if you need a quote to lift your spirits when your bars drop? Productivity plummets when the Wi-Fi bars drop, and there's no cute electric mouse to cheer us on. Who will motivate us in these dark, low-signal times?

### The Solution (that nobody asked for)
We read your signal strength, match it with a perfectly motivational quote, and track where you had this spiritual awakening. All plotted live on a map with your IP-based location history. Because nothing says "productivity" like a Pikachu telling you to believe in yourself when your internet is terrible. You're welcome.

## Technical Details
### Technologies/Components Used
**For Software:**
- **Languages used:** JavaScript, HTML, CSS
- **Frameworks used:** Electron.js
- **Libraries used:** Node.js, Leaflet.js, axios
- **Tools used:** npm, electron-builder, VS Code

**For Hardware:**
- A computer with a Wi-Fi card (obviously)
- A mouse (for clicking Pikachu)
- Speakers (to hear the glorious pika sounds)
- Internet connection (ironically needed to mock your bad connection)

### Implementation
**For Software:**
```bash
# Installation
# Download (Recommended)
Download the executable installer: [Pika Wifi Setup 1.0.0.exe](https://drive.google.com/drive/folders/137EiCXeO1HPJyjuNOaPSheLp9zxXSO1-?usp=sharing)

# Development Setup
git clone https://github.com/GowrishankarSMenon/pika-wifi.git
cd pika-wifi
npm install

# Run from Source
npm start

## 🧪 Testing & Simulation
While running the app from the source (`npm start`), you can use the following keyboard shortcuts to simulate different conditions:

**Wi-Fi Simulation:**
* `1`: Simulates a **Weak** Wi-Fi signal (20%).
* `2`: Simulates a **Medium** Wi-Fi signal (50%).
* `3`: Simulates a **Strong** Wi-Fi signal (90%).
* `0`: Resets to your **real** Wi-Fi signal.

**Location Simulation:**
* `4`: Simulates your location as **Tokyo** 🗼.
* `5`: Simulates your location as **New York** 🗽.
* `6`: Simulates your location as **London** 🎡.
* `9`: Resets to your **real** IP-based location.
* `L`: Manually triggers the "Log Location" action.
```

### Project Documentation
**For Software:**

#### Screenshots (Add at least 3)
![Wi-Fi Motivator Screen](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/screen1.png)
*The main Wi-Fi Motivator screen, displaying the connection status, signal strength, and a motivational quote that gets more intense as your signal gets worse*

![GPS Route Map](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/screen2.png)
*The GPS Route Map view, which plots IP-based locations from the data.csv file as circles with interactive tooltips showing your Wi-Fi journey*

![Interactive Pika Room](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/screen3.png)
*The interactive Pika Room, where users can click on Pikachu or use the Thunderbolt action to experience pure joy and electric sounds*

#### Diagrams
![Data Flow Architecture](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/data-flow.png)
*Data flow architecture showing how Wi-Fi information flows from the OS through the Electron app to the user interface*

![Project Workflow](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/project-workflow.png)
*Project workflow displaying how the app starts, handles user navigation between views, and logs location data*

![Software Architecture](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/software-architechture.png)
*Software architecture diagram showing the Electron main process, preload bridge, and renderer process interactions*

**For Hardware:**
#### Schematic & Circuit
N/A (This is a software-only project, but your Wi-Fi router's circuit is doing the heavy lifting)

#### Build Photos
![Executable File]([https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/build1.jpg](https://drive.google.com/file/d/1ffQeKaDJaj-iDS6l5SxqKFb8JGQ22TBx/view?usp=sharing))
*The final executable installer file (Pika Wifi Setup 1.0.0.exe) created using electron-builder, complete with Pikachu icon and "Connecting to Wi-Fi..." ASCII art*

![Installation Location](https://drive.google.com/file/d/1ffQeKaDJaj-iDS6l5SxqKFb8JGQ22TBx/view?usp=sharing)
*Windows installer setup screen showing the installation destination folder and space requirements (258.9 MB) for the Pika Wifi application*

![Installation Options](https://raw.githubusercontent.com/GowrishankarSMenon/pika-wifi/main/readmeimages/build3.jpg)
*Final installation configuration screen with user permissions options, showing upgrade handling for existing installations*

### Project Demo
#### Video
[Add your demo video link here]
*A thrilling walkthrough of how we conquer low signal zones with motivational quotes, track our spiritual Wi-Fi journey on the map, and interact with Pikachu for maximum productivity*

#### Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- **Gowrishankar S Menon**: Project Lead, Core Application Logic (Wi-Fi Signal Detection, Background Processing), UI/UX Implementation, System Tray Integration
- **Ebin Amson**: Location Tracking & Map Implementation, Data Handling (CSV Operations), Animation Logic, Pikachu Interaction Features

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--25-25?link=https%3A%2F%2Fwww.tinkerhub.org%2Fevents%2FQ2Q1TQKX6Q%2FUseless%2520Projects)
