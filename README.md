Ultimate Mind Reader - C++ OOP Project

📌 Project Overview
The "Ultimate Mind Reader" is a feature-rich, console-based interactive game developed entirely in C++. Utilizing Object-Oriented Programming (OOP) principles and bitwise operations, the program effectively "reads the user's mind" by deducing their chosen numbers, letters, or dates through a series of logical card-based questions. 

This project demonstrates strong foundational knowledge in algorithmic logic, exception handling, and interactive console UI design.

🚀 Key Features
*   **Multiple Game Modes:** The game can guess numbers (1-100), alphabets (A-Z), ages, birth dates, birth months, and the first letter of a user's crush[.
*   **Bitwise Guessing Algorithm:** Uses binary logic and bit manipulation (`num & (1 << i)`) to accurately deduce user choices in minimal attempts.
*   **Zodiac Sign Calculator:** Includes a dedicated feature to calculate a user's astrological sign based on their birth date and month inputs.
*   **Mystery Mode:** A randomized gameplay mode that selects a surprise category for the user.
*   **Data Logging (History):** Automatically records the player's name, game mode, and results with timestamps into a `results.txt` file for persistent history tracking.
*   **Robust Exception Handling:** Implements custom exception classes (`InputException`) to handle invalid inputs, empty strings, and out-of-bounds numbers gracefully without crashing.
*   **Dynamic Console UI:** Features colored text output, delayed "slow print" effects, and formatted grid displays for an engaging user experience.

 💻 Technical Stack
*   **Language:** C++ (Standard Library)
*   **Core Concepts Used:** 
    *   Object-Oriented Programming (Classes, Encapsulation)
    *   Bitwise Operators & Binary Search Logic
    *   File Handling (`<fstream>`)
    *   Exception Handling (`try-catch` blocks)
    *   Time & Threading (`<chrono>`, `<thread>`)

🛠️ How to Run
1. Clone this repository to your local machine.
2. Compile the source code using any standard C++ compiler (e.g., g++, MSVC).
```bash
   g++ Mind_Reader_Game.cpp -o MindReader

   MindReader.exe
     ```
* **Mac/Linux:**
```bash
     ./MindReader
     ```

## 👤 Author
* Developed By:  Muhammad Ahmad
* Designed as a showcase of C++ OOP and algorithmic problem-solving skills.
