// Dummy data for Intellica Customer Service Platform

export const users = {
  customer: {
    email: 'customer@intellica.com',
    password: 'customer123',
    name: 'Ali Jawad',
    role: 'customer',
  },
  agent: {
    email: 'agent@intellica.com',
    password: 'agent123',
    name: 'Mayank Agent',
    role: 'agent'
  },
  supervisor: {
    email: 'supervisor@intellica.com',
    password: 'supervisor123',
    name: 'Harsh Mathur',
    role: 'supervisor'
  },
  vendor: {
    email: 'vendor@intellica.com',
    password: 'vendor123',
    name: 'Rachita',
    role: 'vendor'
  }
};

export const orders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    items: ['Wireless Headphones', 'USB-C Cable'],
    itemCount: 2,
    total: 129.99,
    status: 'delivered',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-20',
    currentLocation: 'Delivered',
    courierName: 'FastShip Express',
    courierContact: '+1-800-FAST-SHIP'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    items: ['Smart Watch Pro'],
    itemCount: 1,
    total: 299.99,
    status: 'in-transit',
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-01-28',
    currentLocation: 'New York Distribution Center',
    courierName: 'QuickDeliver',
    courierContact: '+1-800-QUICK-DEL'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-22',
    items: ['Laptop Stand', 'Wireless Mouse', 'Keyboard Cover'],
    itemCount: 3,
    total: 89.97,
    status: 'processing',
    trackingNumber: 'TRK456789123',
    estimatedDelivery: '2024-01-30',
    currentLocation: 'Warehouse - Being Packed',
    courierName: 'FastShip Express',
    courierContact: '+1-800-FAST-SHIP'
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-10',
    items: ['Bluetooth Speaker'],
    itemCount: 1,
    total: 79.99,
    status: 'delivered',
    trackingNumber: 'TRK741852963',
    estimatedDelivery: '2024-01-15',
    currentLocation: 'Delivered',
    courierName: 'QuickDeliver',
    courierContact: '+1-800-QUICK-DEL'
  }
];

export const tickets = [
  {
    id: 'TKT-001',
    subject: 'Defective Wireless Headphones',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-23T10:30:00',
    orderId: 'ORD-2024-001',
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Ali Jawad',
        message: 'I received the wireless headphones but the left ear piece is not working properly. It keeps cutting out.',
        timestamp: '2024-01-23T10:30:00',
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        senderName: 'Deepti',
        message: "I'm sorry to hear about the issue with your headphones. Let me help you with that. Can you please try resetting the device by holding the power button for 10 seconds?",
        timestamp: '2024-01-23T11:15:00',
        attachments: []
      },
      {
        id: 3,
        sender: 'customer',
        senderName: 'Ali Jawad',
        message: 'I tried that but the problem persists. The left side still cuts in and out.',
        timestamp: '2024-01-23T14:20:00',
        attachments: []
      }
    ]
  },
  {
    id: 'TKT-002',
    subject: 'Refund Request - Smart Watch',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-22T14:45:00',
    orderId: 'ORD-2024-002',
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Ali Jawad',
        message: 'I would like to return the smart watch as it does not meet my expectations. The battery life is much shorter than advertised.',
        timestamp: '2024-01-22T14:45:00',
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        senderName: 'Mayank',
        message: 'I understand your concern. We can process a return for you. Please initiate a return request from the My Orders section, and we will send you a prepaid shipping label.',
        timestamp: '2024-01-22T15:30:00',
        attachments: []
      }
    ]
  },
  {
    id: 'TKT-003',
    subject: 'Missing Item in Order',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-01-18T09:15:00',
    orderId: 'ORD-2024-003',
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Ali Jawad',
        message: 'My order was supposed to include 3 items but I only received 2. The keyboard cover is missing.',
        timestamp: '2024-01-18T09:15:00',
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        senderName: 'Deepti',
        message: 'I apologize for this oversight. Let me check the shipment details... I can confirm that the keyboard cover was missed. We are shipping it to you immediately at no extra cost.',
        timestamp: '2024-01-18T10:00:00',
        attachments: []
      },
      {
        id: 3,
        sender: 'customer',
        senderName: 'Ali Jawad',
        message: 'Thank you! I received the missing item today. Everything is perfect now.',
        timestamp: '2024-01-20T16:30:00',
        attachments: []
      }
    ]
  },
  {
    id: 'TKT-004',
    subject: 'Question about Warranty',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-15T11:20:00',
    orderId: 'ORD-2024-004',
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Ali Jawad',
        message: 'What is the warranty period for the Bluetooth speaker I purchased?',
        timestamp: '2024-01-15T11:20:00',
        attachments: []
      },
      {
        id: 2,
        sender: 'agent',
        senderName: 'Mayank',
        message: 'Your Bluetooth speaker comes with a 1-year manufacturer warranty covering defects in materials and workmanship. You can find more details in the warranty card included with your product.',
        timestamp: '2024-01-15T12:00:00',
        attachments: []
      }
    ]
  }
];

export const aiChatHistory = [
  {
    id: 1,
    sender: 'ai',
    message: 'Hello! I\'m Intellica AI Assistant. How can I help you today?',
    timestamp: new Date().toISOString()
  }
];

export const dashboardStats = {
  openTickets: 2,
  activeOrders: 2,
  pendingRefunds: 1,
  resolvedTickets: 2
};

export const notifications = [
  {
    id: 1,
    title: 'Order Shipped',
    message: 'Your order ORD-2024-002 has been shipped',
    timestamp: '2024-01-23T09:00:00',
    read: false,
    type: 'order'
  },
  {
    id: 2,
    title: 'Ticket Update',
    message: 'New response on ticket TKT-001',
    timestamp: '2024-01-23T11:15:00',
    read: false,
    type: 'ticket'
  },
  {
    id: 3,
    title: 'Refund Processed',
    message: 'Your refund request has been approved',
    timestamp: '2024-01-22T16:30:00',
    read: true,
    type: 'refund'
  }
];
