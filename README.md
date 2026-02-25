# Hostel Hub - Hostel Management System 🎯

## Basic Details
**Team Name:** [Your Team Name]
### Team Members
*   **Member 1:** [Your Name] - [Your College]
*   **Member 2:** [Partner Name] - [Partner College]

### Hosted Project Link
[Link to be added after hosting]

## Project Description
Hostel Hub is a comprehensive full-stack management platform designed to automate and streamline daily hostel operations. It integrates attendance tracking, dynamic fee calculation, grievance management, and community interactions into a single, user-friendly interface.

## The Problem Statement
Traditional hostel management relies on manual registers for attendance and billing, leading to human errors, delayed responses to student complaints, and a lack of organized community engagement within the hostel premises.

## The Solution
We have developed a digital ecosystem that:
*   Automates mess bill generation by linking it directly to attendance records.
*   Provides a transparent, ticket-style complaint system for students and admins.
*   Creates a social "Community Circle" to foster student engagement and announcements.
*   Implements role-based security to ensure data integrity for admins and students.

## Technical Details
### Technologies/Components Used
#### For Software:
*   **Languages used:** JavaScript (ES6+), TypeScript, HTML5, CSS3
*   **Frameworks used:** React (Vite), Express.js
*   **Libraries used:** Sequelize (ORM), Axios, Shadcn UI, Tailwind CSS, Recharts, Lucide React, JWT, Bcryptjs
*   **Tools used:** VS Code, Git, GitHub, SQLite

## Features
*   **Feature 1: Smart Attendance Management:** Admins can mark daily attendance (Present, Absent, Leave, Mess Cut), which students can track via a personal calendar.
*   **Feature 2: Dynamic Fee Calculation:** Automatically generates monthly bills (Wifi, Water, Establishment, Mess) where the mess fee is calculated based on the actual number of days the student utilized the mess.
*   **Feature 3: Ticket-Based Complaint System:** Students can file complaints with priority levels, and admins can update statuses (Pending, In Progress, Resolved) in real-time.
*   **Feature 4: Community Circles:** A social hub for students to join interest groups, share posts, and interact through likes and comments.

## Implementation
### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Fathimasahalak/Hostel-hub.git
    cd hostel-hub
    ```
2.  **Install Frontend dependencies:**
    ```sh
    npm install
    ```
3.  **Install Backend dependencies:**
    ```sh
    cd backend
    npm install
    ```

### Run
1.  **Start Backend Server:**
    ```sh
    # From the /backend directory
    node server.js
    ```
2.  **Start Frontend Development Server:**
    ```sh
    # From the root directory
    npm run dev
    ```

## Project Documentation
### Screenshots (Placeholder)
![Dashboard](public/placeholder.svg) 
*Caption: Admin Dashboard showing real-time statistics of attendance and pending complaints.*

![Attendance Page](public/placeholder.svg) 
*Caption: Student View of the monthly attendance calendar.*

![Community Page](public/placeholder.svg) 
*Caption: Community Circles where students interact and post updates.*

### Diagrams
#### System Architecture:
The system follows a **Client-Server Architecture**. 
*   **Frontend**: Built with React and TypeScript, handling state with Context API and fetching data via Axios.
*   **Backend**: A Node.js/Express server that serves as a RESTful API.
*   **Database**: SQLite managed through Sequelize ORM for efficient data persistence and schema management.

#### Application Workflow:
1.  **Authentication**: User logs in -> Server verifies JWT -> User redirected based on Role (Admin/Student).
2.  **Data Flow**: Admin updates attendance -> Database triggers update -> Frontend Recharts reflects the new statistics.
3.  **Billing**: At month-end, the backend calculates (Mess Rate * Days Present) and generates a PDF/Invoice record in the Fees table.

## Additional Documentation
### API Documentation
**Base URL:** `http://localhost:5000`

#### Endpoints
**POST /api/auth/login**
*   **Description:** Authenticates a user and returns a token.
*   **Request Body:** `{"email": "...", "password": "..."}`
*   **Response:** `{"status": "success", "token": "...", "user": {...}}`

**GET /api/attendance/student**
*   **Description:** Fetches the logged-in student's attendance history.
*   **Parameters:** `token` (Header)
*   **Response:** `{"status": "success", "data": [...]}`

**POST /api/complaints**
*   **Description:** Submits a new student complaint.
*   **Request Body:** `{"title": "...", "description": "...", "category": "..."}`
*   **Response:** `{"status": "success", "message": "Complaint registered"}`

## AI Tools Used
**Tool Used:** Antigravity (Google Deepmind)
*   **Purpose:** Development assistance, debugging async database queries, and structured project documentation.
*   **Percentage of AI-generated code:** Approximately 40%

**Human Contributions:**
*   System architecture design and logic planning.
*   Custom UI design decisions and component styling.
*   Database schema design and business logic implementation for fee calculation.

## Team Contributions
*   **[Member 1]**: Backend development, Database design, API integration.
*   **[Member 2]**: Frontend UI development, State management, Documentation.

## License
This project is licensed under the **MIT License** - see the LICENSE file for details.
