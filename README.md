# Hostel Hub - Hostel Management System

## Project info

A comprehensive solution for managing hostel attendance, fees, and student complaints.

## How can I run this locally?

The project is split into a frontend and a backend.

### Prerequisites

- Node.js & npm installed

### Setup

1. **Clone the repository**:
   ```sh
   git clone <YOUR_GIT_URL>
   cd hostel-hub
   ```

2. **Frontend Setup**:
   ```sh
   npm install
   npm run dev
   ```

3. **Backend Setup**:
   ```sh
   cd backend
   npm install
   node server.js
   ```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## System Architecture

The Hostel Management System follows a **Client-Server Architecture** with a RESTful API.

### 1. Technology Stack
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Recharts.
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite (managed via Sequelize ORM).
*   **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

### 2. Core Modules
*   **Authentication**: Secure Login/Registration for Students and Admins. Role-based access control (RBAC).
*   **Attendance Management**:
    *   **Admin**: Mark daily attendance, view student list.
    *   **Student**: View personal attendance calendar and stats.
    *   **Status Types**: Present, Absent, Mess Cut, Leave.
*   **Fee & Bill Management**:
    *   **Structure**: Configurable monthly rates (Mess, WiFi, Establishment, Water).
    *   **Generation**: Automated bill calculation based on attendance (Mess Days * Rate).
    *   **Tracking**: Payment status tracking (Paid/Pending).
*   **Complaints**: Ticket-based system for students to report issues and admins to resolve them.

### 3. Backend Structure (`/backend`)
*   **`server.js`**: Entry point, middleware configuration, database sync.
*   **`models/`**: Sequelize definitions for `User`, `Attendance`, `Fee`, `FeeStructure`, `Complaint`.
*   **`routes/`**: API endpoints corresponding to each module.
*   **`middleware/`**: Auth verification and Role checking.

### 4. Database Schema
*   **Users**: Stores Admin and Student profiles.
*   **Attendances**: Daily records linked to Users.
*   **Fees**: Monthly bill records linked to Users.
*   **FeeStructures**: Global rate configurations per month.
*   **Complaints**: Issue reports linked to Users.


## License

MIT
