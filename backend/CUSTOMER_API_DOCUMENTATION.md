# Customer Portal API Documentation

## Overview
Complete REST API implementation for the Customer Portal with all required endpoints for dashboard, orders, tickets, profile, settings, and notifications.

## Authentication
All customer APIs require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## Dashboard APIs

### `GET /api/v1/customer/dashboard`
Get customer dashboard data with statistics and recent activity.

**Response:**
```json
{
  "stats": {
    "open_tickets": 2,
    "active_orders": 1,
    "pending_refunds": 0,
    "resolved_tickets": 3
  },
  "recent_orders": [
    {
      "id": "ORD123",
      "status": "SHIPPED",
      "total": 299.99,
      "created_at": "2024-01-15T10:30:00Z",
      "item_count": 2
    }
  ],
  "recent_tickets": [
    {
      "id": "TKT456",
      "subject": "Product inquiry",
      "status": "OPEN",
      "priority": "MEDIUM",
      "created_at": "2024-01-14T15:20:00Z"
    }
  ]
}
```

## Orders APIs

### `GET /api/v1/customer/orders`
Get customer orders with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by order status (all, processing, shipped, delivered, etc.)
- `search` (optional): Search by order ID

**Response:**
```json
[
  {
    "id": "ORD123",
    "status": "DELIVERED",
    "total": 299.99,
    "created_at": "2024-01-10T10:00:00Z",
    "estimated_delivery": "2024-01-15T18:00:00Z",
    "tracking_number": "TRK123456789",
    "items": [
      {
        "id": "ITEM1",
        "product_name": "Wireless Headphones",
        "quantity": 1,
        "price": 299.99,
        "subtotal": 299.99
      }
    ]
  }
]
```

### `GET /api/v1/customer/orders/{order_id}`
Get specific order details.

### `GET /api/v1/customer/orders/track/{order_id}`
Get order tracking information with delivery steps.

**Response:**
```json
{
  "order_id": "ORD123",
  "status": "SHIPPED",
  "tracking_number": "TRK123456789",
  "current_location": "Mumbai Hub",
  "estimated_delivery": "2024-01-15T18:00:00Z",
  "courier_name": "FastShip Express",
  "courier_contact": "+91-1800-123-4567",
  "steps": [
    {"label": "Order Placed", "completed": true, "current": false},
    {"label": "Payment Confirmed", "completed": true, "current": false},
    {"label": "Packed", "completed": true, "current": false},
    {"label": "Shipped", "completed": true, "current": true},
    {"label": "Delivered", "completed": false, "current": false}
  ]
}
```

### `POST /api/v1/customer/orders/return`
Request order return/refund.

**Request Body:**
```json
{
  "order_id": "ORD123",
  "items": ["Wireless Headphones"],
  "reason": "Product is defective",
  "description": "The left speaker is not working properly"
}
```

## Tickets APIs

### `GET /api/v1/customer/tickets`
Get customer tickets with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by ticket status (all, open, in-progress, resolved)
- `search` (optional): Search by ticket subject or ID

### `POST /api/v1/customer/tickets`
Create new support ticket.

**Request Body:**
```json
{
  "subject": "Product inquiry",
  "description": "I need help with my recent order",
  "order_id": "ORD123",
  "priority": "MEDIUM"
}
```

### `GET /api/v1/customer/tickets/{ticket_id}`
Get ticket details with all messages.

**Response:**
```json
{
  "id": "TKT456",
  "subject": "Product inquiry",
  "status": "OPEN",
  "priority": "MEDIUM",
  "created_at": "2024-01-14T15:20:00Z",
  "updated_at": "2024-01-14T16:30:00Z",
  "messages": [
    {
      "id": "MSG1",
      "sender_id": 1,
      "sender_name": "Ali Jawad",
      "content": "I need help with my order",
      "timestamp": "2024-01-14T15:20:00Z",
      "is_internal": false
    }
  ]
}
```

### `POST /api/v1/customer/tickets/{ticket_id}/messages`
Add message to existing ticket.

**Request Body:**
```json
{
  "content": "Thank you for the quick response!"
}
```

## Profile APIs

### `GET /api/v1/customer/profile`
Get customer profile information.

**Response:**
```json
{
  "id": 1,
  "email": "ali.jawad@example.com",
  "full_name": "Ali Jawad",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=AliJawad",
  "preferences": {
    "language": "en",
    "notifications": true,
    "theme": "light"
  },
  "total_orders": 12,
  "total_tickets": 5,
  "member_since": "2024-01-01T00:00:00Z"
}
```

### `PUT /api/v1/customer/profile`
Update customer profile.

**Request Body:**
```json
{
  "full_name": "Ali Jawad Updated",
  "preferences": {
    "language": "en",
    "notifications": false,
    "theme": "dark"
  }
}
```

## Settings APIs

### `GET /api/v1/customer/settings`
Get customer settings and preferences.

**Response:**
```json
{
  "notifications": {
    "email": true,
    "order_updates": true,
    "refund_updates": true,
    "support_replies": true
  },
  "general": {
    "theme": "light",
    "timezone": "UTC+0",
    "currency": "USD"
  }
}
```

### `PUT /api/v1/customer/settings`
Update customer settings.

**Request Body:**
```json
{
  "notifications": {
    "email": false,
    "order_updates": true
  },
  "general": {
    "theme": "dark",
    "currency": "EUR"
  }
}
```

## Notifications APIs

### `GET /api/v1/customer/notifications`
Get customer notifications.

**Query Parameters:**
- `unread_only` (optional): Get only unread notifications (default: false)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Order Update",
    "message": "Your order ORD123 has been shipped",
    "type": "ORDER",
    "read": false,
    "timestamp": "2024-01-14T10:00:00Z"
  }
]
```

### `PUT /api/v1/customer/notifications/{notification_id}/read`
Mark notification as read.

## Usage Examples

### Authentication Flow
```javascript
// 1. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'ali.jawad@example.com',
    password: 'customer123'
  })
});

const { access_token } = await loginResponse.json();

// 2. Use token for API calls
const dashboardResponse = await fetch('/api/v1/customer/dashboard', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### Create Support Ticket
```javascript
const ticketResponse = await fetch('/api/v1/customer/tickets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Need help with my order',
    description: 'I have a question about delivery',
    order_id: 'ORD123',
    priority: 'MEDIUM'
  })
});
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Testing

Run the test script to verify all APIs:
```bash
cd backend
python test_customer_apis.py
```

## Frontend Integration Ready

All APIs are designed to work seamlessly with the existing frontend pages:
- CustomerDashboard.jsx
- OrdersPage.jsx  
- OrderTrackingPage.jsx
- TicketsPage.jsx
- NewTicketPage.jsx
- TicketDetailsPage.jsx
- ProfilePage.jsx
- SettingsPage.jsx
- ReturnRefundPage.jsx

The APIs return data in the exact format expected by the frontend components!