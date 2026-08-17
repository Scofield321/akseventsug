# AKS Events Uganda — Events Management System

A full-stack event management and portfolio system for **AKS Events Uganda**.

The system allows AKS Events Uganda to manage events from an administrative dashboard and display upcoming, past, and completed events on the public website.

---

## 📌 About the Project

The AKS Events website is designed to showcase the company's event management services and previous work.

The system consists of two main parts:

1. **Public Website** — what clients and visitors see.
2. **Admin System** — used by the AKS Events team to manage events and website content.

The system also includes a **Moments** page that acts as a visual portfolio of events AKS Events Uganda has worked on.

---

## ✨ Features

### Public Website

- Home page
- About page
- Events page
- Moments / portfolio page
- Contact information
- Responsive design
- Event details
- Event images
- Upcoming events
- Past events

### Admin System

Administrators can:

- Log in securely
- Create events
- Edit events
- Delete events
- View all events
- Manage event information
- Manage event images
- Control event visibility

---

## 📸 Moments

The **Moments** page is the visual portfolio of AKS Events Uganda.

It showcases events that the company has successfully worked on.

Each event can contain information such as:

- Event name
- Event date
- Location
- Event category
- Description
- Cover image
- Gallery images

Example categories include:

- Corporate Events
- Weddings
- Conferences
- Product Launches
- Private Parties
- Concerts
- Other Events

The Moments page will continue to grow as AKS Events Uganda completes more projects.

---

# 🏗️ System Architecture

```text
                    AKS EVENTS WEBSITE
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       PUBLIC WEBSITE              ADMIN SYSTEM
             │                           │
     ┌───────┼────────┐                  │
     │       │        │                  ▼
     ▼       ▼        ▼             Authentication
   Home    Events   Moments               │
     │       │        │                   ▼
     └───────┴────────┘             Admin Dashboard
             │                           │
             │                           ▼
             │                    Event Management
             │                           │
             └──────────────┬────────────┘
                            │
                            ▼
                       BACKEND API
                            │
                            ▼
                        DATABASE