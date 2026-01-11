# Hostel Management Portal

A comprehensive web application designed to digitize and streamline hostel operations, providing tailored workflows for Admins, Staff, and Students.

## 🚀 Overview

The **Hostel Management Portal** simplifies the daily management of rooms, attendance, complaints, and student records. It empowers distinct user roles to ensure efficient and transparent operations.

-   **Role-Based Access**: Specialized dashboards for Admin, Staff, and Students.
-   **Real-time Monitoring**: Live stats for occupancy, attendance, and complaints.
-   **Digital Workflows**: Seamless processes for leave requests, complaints, and onboarding.

## 🛠️ Technology Stack

Built with a robust and modern tech stack for performance and scalability.

-   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Backend**: Node.js (via Next.js API Routes)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Prisma ORM](https://www.prisma.io/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **UI/UX**: Framer Motion, React Icons, Recharts

## ✨ Key Features

### 🛡️ Admin
-   **Dashboard**: Real-time stats on students, staff, and room occupancy.
-   **Room Management**: Create rooms, manage blocks, and allocate students.
-   **User Management**: Onboard staff/students and assign roles.
-   **Reports**: Monitor attendance and complaint resolution trends.

### 👔 Staff (Warden/Caretaker)
-   **Attendance**: Mark daily attendance (AI verification coming soon).
-   **Complaints**: View and resolve student complaints.
-   **Directory**: Quick access to student details and emergency contacts.
-   **Messaging**: Communicate with students and admins.

### 🎓 Student
-   **Dashboard**: View personal attendance and room details.
-   **Complaints**: Raise and track maintenance or other issues.
-   **Leave Requests**: Apply for outpasses or leave digitally.
-   **Profile**: Manage personal and contact information.

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js** (v18+ recommended)
-   **MongoDB** (Local or Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/saurabhkr21/hostel-managment-portal.git
    cd hostel-managment-portal
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add the following:
    ```env
    DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/hostel_db"
    NEXTAUTH_SECRET="your-super-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Sync Database**
    Push the Prisma schema to your MongoDB database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

6.  **Open the App**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm start`: Runs the built production application.
-   `npm run lint`: Runs ESLint to check for code quality.
-   `npx prisma db push`: Pushes the schema state to the database.
