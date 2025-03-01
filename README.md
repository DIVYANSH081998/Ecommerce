# E-commerce Order Management System

A full-stack application for managing orders built with Node.js, React, and PostgreSQL.

## Features

- View all orders with their products
- Create new orders
- Edit existing orders
- Delete orders
- Search orders by ID or description
- Select multiple products for each order

## Tech Stack

- Backend: Node.js with Express
- Frontend: React with Material-UI
- Database: PostgreSQL

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Setup Instructions

### Database Setup

1. Create a PostgreSQL database named `ecommerce`
2. Navigate to the backend directory `.env`, then add your database credentials
3. Create a `.env` file in the backend directory with your PostgreSQL credentials:
   ```
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecommerce
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## API Endpoints and Their Usage

### GET `/api/orders`
- Called when the page initially loads
- Called when clicking the "Show All" button
- Returns all orders in the system

### GET `/api/orders/:id`
- Called when clicking the Search button or Search icon
- Called when entering an order ID in the search box
- Returns specific order details

### POST `/api/orders`
- Called when clicking "Create Order" button in the dialog
- Creates a new order with selected products
- Requires order description and at least one product selected

### PUT `/api/orders/:id`
- Called when clicking "Update Order" in the edit dialog
- Updates existing order details and products
- Triggered from the edit icon in the table row

### DELETE `/api/orders/:id`
- Called when clicking the delete icon in the table row
- Removes the order from the system
- Requires confirmation before deletionder

## Notes

- The frontend is configured to connect to the backend at `http://localhost:5000`
- Make sure both the backend server and PostgreSQL database are running before starting the frontend
- Initial product data is loaded automatically during database setup#   E c o m m e r c e 
 
 
