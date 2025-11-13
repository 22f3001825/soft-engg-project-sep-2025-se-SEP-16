# Portal API Documentation

## Authentication APIs (`/auth`)

### POST `/auth/register`
**Purpose**: Register new user account
**Body**: `{email, password, full_name, role}`
**Returns**: JWT token + user info

### POST `/auth/login` 
**Purpose**: User login
**Body**: `{username, password, role}` (form data)
**Returns**: JWT token + user info

### GET `/auth/me`
**Purpose**: Get current user profile
**Returns**: User details

---

## Agent APIs (`/agent`)

### GET `/agent/dashboard`
**Purpose**: Agent dashboard stats
**Returns**: Ticket counts, recent tickets

### GET `/agent/tickets`
**Purpose**: Get agent's tickets (assigned + available)
**Query**: `status`, `priority`, `assigned_only`
**Returns**: Filtered ticket list

### GET `/agent/tickets/{ticket_id}`
**Purpose**: Get ticket details with messages
**Returns**: Full ticket info + conversation

### PUT `/agent/tickets/{ticket_id}/assign`
**Purpose**: Assign ticket to agent
**Body**: `{agent_id}`

### PUT `/agent/tickets/{ticket_id}/status`
**Purpose**: Update ticket status
**Body**: `{status}`

### PUT `/agent/tickets/{ticket_id}/resolve`
**Purpose**: Mark ticket as resolved

### POST `/agent/tickets/{ticket_id}/messages`
**Purpose**: Add agent reply to ticket
**Body**: `{content, is_internal}`

### GET `/agent/customers`
**Purpose**: Get customers assigned to agent
**Query**: `search`
**Returns**: Customer list with stats

### GET `/agent/customers/{customer_id}`
**Purpose**: Get customer profile with orders/tickets
**Returns**: Complete customer history

### GET `/agent/settings`
**Purpose**: Get agent preferences
**Returns**: Notification settings, signature

### PUT `/agent/settings`
**Purpose**: Update agent settings
**Body**: Settings object

---

## Customer APIs (`/customer`)

### GET `/customer/dashboard`
**Purpose**: Customer overview
**Returns**: Order/ticket stats, charts, recent activity

### GET `/customer/orders`
**Purpose**: Get customer orders
**Query**: `status`, `search`
**Returns**: Order list with items

### GET `/customer/orders/{order_id}`
**Purpose**: Get order details
**Returns**: Full order info + tracking

### GET `/customer/orders/track/{order_id}`
**Purpose**: Track order status
**Returns**: Tracking info + delivery steps

### POST `/customer/orders/return`
**Purpose**: Request order return/refund
**Body**: `{order_id, items, reason, description}`
**Returns**: Creates support ticket

### GET `/customer/tickets`
**Purpose**: Get customer support tickets
**Query**: `status`, `search`
**Returns**: Ticket list

### POST `/customer/tickets`
**Purpose**: Create new support ticket
**Body**: `{subject, description, priority, order_id}`
**Returns**: Ticket ID

### GET `/customer/tickets/{ticket_id}`
**Purpose**: Get ticket conversation
**Returns**: Messages + ticket details

### POST `/customer/tickets/{ticket_id}/messages`
**Purpose**: Reply to support ticket
**Body**: `{content}`

### POST `/customer/tickets/{ticket_id}/attachments`
**Purpose**: Upload files to ticket
**Body**: File upload (multipart)
**Returns**: File info

### GET `/customer/profile`
**Purpose**: Get customer profile
**Returns**: Personal info + preferences

### PUT `/customer/profile`
**Purpose**: Update profile
**Body**: `{full_name, preferences}`

### GET `/customer/settings`
**Purpose**: Get notification preferences
**Returns**: Settings object

### PUT `/customer/settings`
**Purpose**: Update preferences
**Body**: Settings object

### GET `/customer/notifications`
**Purpose**: Get notifications
**Query**: `unread_only`
**Returns**: Notification list

### PUT `/customer/notifications/{id}/read`
**Purpose**: Mark notification as read

---

## Supervisor APIs (`/supervisor`)

### GET `/supervisor/dashboard`
**Purpose**: Supervisor overview
**Returns**: Team stats, ticket distribution, performance metrics

### GET `/supervisor/tickets`
**Purpose**: Get all tickets (system-wide)
**Query**: `status`, `priority`, `search`
**Returns**: All tickets with agent assignments

### GET `/supervisor/agents`
**Purpose**: Get all agents
**Query**: `search`, `status_filter`
**Returns**: Agent list with workload stats

### GET `/supervisor/customers`
**Purpose**: Get all customers
**Query**: `search`, `status_filter`
**Returns**: Customer list with activity stats

### PUT `/supervisor/tickets/{ticket_id}/reassign`
**Purpose**: Reassign ticket to different agent
**Body**: `{agent_id}`

### PUT `/supervisor/tickets/{ticket_id}/resolve`
**Purpose**: Force resolve ticket

### PUT `/supervisor/tickets/{ticket_id}/close`
**Purpose**: Close ticket

### PUT `/supervisor/agents/{agent_id}/status`
**Purpose**: Block/unblock agent
**Body**: `{is_active}`

### PUT `/supervisor/customers/{customer_id}/status`
**Purpose**: Block/unblock customer
**Body**: `{is_active}`

### GET `/supervisor/analytics`
**Purpose**: Get system analytics
**Query**: `time_range` (24h/7d/30d)
**Returns**: Performance metrics, trends

---

## Vendor APIs (`/vendor`)

### GET `/vendor/dashboard`
**Purpose**: Vendor overview
**Returns**: Product complaints, return rates, recent issues

### GET `/vendor/analytics`
**Purpose**: Vendor analytics
**Query**: `date_range`
**Returns**: Complaint trends, issue categories

### GET `/vendor/complaints`
**Purpose**: Get product complaints
**Returns**: Per-product complaint stats

### GET `/vendor/profile`
**Purpose**: Get vendor profile
**Returns**: Company info, business details

### PUT `/vendor/profile`
**Purpose**: Update vendor profile
**Body**: `{company_name, business_type, contact_email, etc}`

### GET `/vendor/settings`
**Purpose**: Get vendor preferences
**Returns**: Dashboard settings, notifications

---

## Common Response Formats

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

### Authentication
- All endpoints (except `/auth/register` and `/auth/login`) require JWT token
- Include in header: `Authorization: Bearer <token>`

### HTTP Status Codes
- `200`: Success
- `400`: Bad request/validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

### Query Parameters
- Most list endpoints support filtering via query parameters
- Common filters: `status`, `search`, `priority`
- Pagination not implemented (returns all results)

### File Uploads
- Supported formats: PNG, JPG, PDF, DOC, DOCX, TXT
- Max size: 10MB per file
- Endpoint: `/customer/tickets/{ticket_id}/attachments`