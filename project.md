
Project Summary: Anonymous Social Complaint & Community Engagement Platform

This project is a social-impact full-stack web application designed to help people raise local area issues and engage with their community in a safe and transparent way.

The platform allows users to report problems anonymously to the appropriate municipal authorities, while also providing a public social space where users can openly share content and interact with others.

Key Objectives

Enable citizens to raise complaints without exposing personal identity

Improve transparency between the public and municipal authorities

Build a community-driven social hub for awareness and discussion

Ensure proper authentication and role-based access control

Main Features
🔹 Anonymous Complaint System

Users can submit complaints related to their local area (roads, water, sanitation, safety, etc.)

No personal details (name, email, phone) are shared with municipalities

Complaints are tagged with location/area and category

Each complaint has a status: Raised → In Progress → Resolved

🔹 Public Community Feed (Social Hub)

Users can create posts (text, images, short videos/vlogs)

Users can comment and interact with posts

This section is non-anonymous (user name is visible)

Helps in spreading awareness and community discussion

🔹 User Dashboard

View all complaints raised by the user (anonymous mapping internally)

Track complaint status in real time

View community posts and interactions

Profile management (only for social hub, not for complaints)

🔹 Admin / Authority Dashboard

Admin represents municipal authorities

View complaints area-wise and category-wise

Update complaint status and add resolution notes

Once a complaint is marked Resolved, it is automatically posted to the community feed for public transparency

Proper authentication and authorization for admins

Security & Privacy

Strong role-based authentication (User / Admin)

Anonymous complaint submissions with internal unique identifiers

User identity is never exposed in complaint workflows

Secure APIs and protected admin routes

Technology Stack

Backend: Spring Boot (REST APIs, Security, Role Management)

Frontend: Next.js + TypeScript

Database: PostgreSQL (using Supabase)
