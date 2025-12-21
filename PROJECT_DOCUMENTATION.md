# Hostel Management Portal - Project Documentation

## 1. Project Overview
The **Hostel Management Portal** is a comprehensive web application designed to digitize and streamline the daily operations of a hostel. It serves three distinct user roles: **Admin**, **Staff**, and **Student**, providing tailored workflows for each to ensure efficient management of rooms, attendance, complaints, and student records.

**Platform**: Web Application (Responsive/Mobile-Optimized)
**Version**: 1.0.0

---

## 2. Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router Architecture)
- **Language**: TypeScript (Strict typing for robustness)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first framework)
- **UI Components**: Custom components with **Framer Motion** for animations and Skeleton loaders for performance states.
- **Icons**: React Icons (Fa/Lucide)
- **Charts**: [Recharts](https://recharts.org/) for data visualization (Occupancy, Attendance trends).

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **Database**: [MongoDB](https://www.mongodb.com/) (NoSQL Database)
- **ORM**: [Prisma](https://www.prisma.io/) (Type-safe database client)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Secure, role-based session management)
- **Security**: Bcrypt.js for password hashing.

---

## 3. Database Architecture (Schema)

The application uses a relational-like schema on top of MongoDB using Prisma.

### Key Models:
1.  **User**: Central entity. Stores `email`, `password`, `role` (ADMIN/STAFF/STUDENT), and links to other entities.
2.  **Profile**: Extended details for a user (Phone, Address, Academic details, Guardian info). One-to-One with User.
3.  **Room**: Represents a hostel room. Contains `roomNumber`, `capacity`, `type` (Single/Double), `block`. One-to-Many with User (Occupants).
4.  **Attendance**: Tracks presence. Linked to User and Date. Stores status (PRESENT/ABSENT/LEAVE).
5.  **Complaint**: Issues raised by students. Contains `title`, `description`, `status` (PENDING/RESOLVED). Linked to Student.
6.  **LeaveRequest**: OUTPASS/LEAVE requests.
7.  **Notification & Message**: Internal communication system.

---

## 4. Role-Based Workflows

### A. Admin Workflow
The **Admin** has full control over the system configuration and data.

1.  **Dashboard**:
    *   **Real-time Stats**: Total Students, Staff, Rooms, Occupancy rates.
    *   **Visualizations**: Attendance Pie Charts, Room Occupancy Bar Charts, Activity Trends.
    *   **Quick Actions**: Add User, Manage Rooms.
2.  **Room Management**:
    *   **Create Rooms**: Define Room Number, Capacity, and Block.
    *   **Allocation**: Assign students to specific rooms.
    *   **Monitoring**: View current occupancy status (e.g., 2/3 beds full).
3.  **User Management**:
    *   **Onboarding**: Create accounts for Staff and Students.
    *   **Role Assignment**: Assign specific roles and permissions.
4.  **Reports & Monitoring**:
    *   View system-wide attendance reports.
    *   Track complaint resolution rates.

### B. Staff Workflow
**Staff** members (Wardens/Caretakers) manage daily ground-level operations.

1.  **Dashboard**:
    *   Quick overview of today's attendance and pending complaints.
2.  **Attendance Management**:
    *   **Mark Attendance**: Digital roster to mark students Present/Absent.
    *   **History**: View past attendance records.
    *   *Upcoming Feature*: AI Face Recognition integration.
3.  **Complaint Resolution**:
    *   View list of complaints raised by students in their block.
    *   Update status (e.g., mark as "In Progress" or "Resolved").
4.  **Student Directory**:
    *   Access student emergency contacts and room details instantly.
5.  **Messaging**:
    *   Send notifications or chat with students/admin.

### C. Student Workflow
**Students** use the portal for transparency and requests.

1.  **Dashboard**:
    *   View personal attendance stats.
    *   See Room details.
2.  **Complaints**:
    *   **Raise Complaint**: Submit issues (e.g., "Fan not working", "Water leakage").
    *   **Track Status**: Real-time updates on complaint resolution.
3.  **Profile & Room**:
    *   View allocated room and roommate details.
    *   Manage personal profile (Phone, Address).
4.  **Leave Requests**:
    *   Apply for Outpass/Leave digitally.

---

## 5. Key Technical Features

### **Security & Performance**
-   **Role-Based Access Control (RBAC)**: Middleware protects routes. Admins cannot access Student pages and vice versa.
-   **Skeleton Loading**: Custom UI skeletons prevent layout shifts (CLS) while data fetches.
-   **Optimized API**:
    -   User lists use server-side pagination/limiting to prevent slow loads.
    -   Heavy data (like images) is fetched primarily on demand or via optimized metadata fields.

### **UI/UX Design**
-   **Responsive**: Fully mobile-compatible for Staff on rounds.
-   **Theme**: Clean, professional interface with consistent color coding (Violet/Blue for Admin, Emerald for Staff).
-   **Feedback**: Toast notifications for success/error actions.

---

## 6. Setup & Installation

1.  **Clone Repository**:
    ```bash
    git clone <repo-url>
    cd hostel-management-portal
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create `.env` file:
    ```env
    DATABASE_URL="mongodb+srv://..."
    NEXTAUTH_SECRET="your-secret"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Sync**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---
*Generated by Antigravity AI*
