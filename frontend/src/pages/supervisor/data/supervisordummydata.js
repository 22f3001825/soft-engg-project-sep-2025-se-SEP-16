// ================================
// 🔹 SUPERVISOR PORTAL DUMMY DATA
// ================================

// 🔸 Supervisor Profile
export const supervisor = {
  email: "supervisor@intellica.com",
  password: "supervisor123",
  name: "Harsh Mathur",
  role: "supervisor",
};

// 🔸 Dashboard Overview
export const dashboardStats = [
  {
    title: "Total Tickets",
    value: 420,
    icon: "BarChart3",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Avg Resolution Time",
    value: "1h 45m",
    icon: "Activity",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Avg Customer Rating",
    value: "4.7/5",
    icon: "TrendingUp",
    color: "text-success",
    bgColor: "bg-success-light",
  },
  {
    title: "Fraud Prevention",
    value: "Rs.24,830",
    icon: "CheckCircle2",
    color: "text-warning",
    bgColor: "bg-warning-light",
  },
];

// 🔸 Ticket Summary Chart Data
export const ticketChartData = [
  { name: "Open", value: 80 },
  { name: "Assigned", value: 100 },
  { name: "Resolved", value: 160 },
  { name: "Closed", value: 80 },
];

// 🔸 Alerts
export const alerts = [
  { id: 1, message: "High refund requests detected this week", type: "critical" },
  { id: 2, message: "Average response time exceeded 3 hours yesterday", type: "warning" },
];

// 🔸 Team Performance
export const teamPerformance = [
  { name: "Alex Morgan", solved: 142, avg: "1.8h" },
  { name: "Jordan Smith", solved: 128, avg: "2.2h" },
  { name: "Riya Patel", solved: 117, avg: "1.9h" },
  { name: "Priya Shah", solved: 109, avg: "2.0h" },
];

// 🔸 Agents and Tickets
export const agents = [
  {
    name: "Alex Morgan",
    status: "Online",
    tickets: [1, 2, 3, 4, 5, 6],
    rating: 4.8,
    solved: 142,
    avgTime: "1.8h",
  },
  {
    name: "Priya Shah",
    status: "Away",
    tickets: [7, 8, 9, 10],
    rating: 4.3,
    solved: 109,
    avgTime: "2.0h",
  },
  {
    name: "Jordan Smith",
    status: "Busy",
    tickets: [11, 12, 13, 14, 15],
    rating: 3.9,
    solved: 128,
    avgTime: "2.2h",
  },
  {
    name: "Riya Patel",
    status: "Online",
    tickets: [16, 17, 18, 19, 20],
    rating: 4.5,
    solved: 117,
    avgTime: "1.9h",
  },
  {
    name: "Aarav Mehta",
    status: "Online",
    tickets: [21, 22, 23],
    rating: 4.1,
    solved: 95,
    avgTime: "2.1h",
  },
  {
    name: "Rahul Verma",
    status: "Offline",
    tickets: [],
    rating: 2.8,
    solved: 78,
    avgTime: "2.5h",
  },
];

// 🔸 Escalations
export const escalations = [
  { id: 1, customer: "Maria Gomez", reason: "Duplicate Charge", agent: "Priya Shah" },
  { id: 2, customer: "John Lee", reason: "Refund Delay", agent: "Alex Morgan" },
  { id: 3, customer: "Sara Khan", reason: "Incorrect Billing", agent: "Jordan Smith" },
  { id: 4, customer: "Marie", reason: "Payment Failure", agent: "Riya Patel" },
  { id: 5, customer: "Aarav Mehta", reason: "Late Refund", agent: "Alex Morgan" },
  { id: 6, customer: "Rohit Sharma", reason: "Incorrect Billing", agent: "Jordan Smith" },
  { id: 7, customer: "Nina Patel", reason: "Delayed Response", agent: "Priya Shah" },
  { id: 8, customer: "Vikram Nair", reason: "Item Not Delivered", agent: "Riya Patel" },
  { id: 9, customer: "Ananya Verma", reason: "Incorrect Item Sent", agent: "Jordan Smith" },
  { id: 10, customer: "Esha Bansal", reason: "Warranty Claim Delay", agent: "Priya Shah" },
];

// 🔸 Customers (linked with escalations)
export const customers = [
  {
    name: "Maria Gomez",
    status: "Active",
    totalOrders: 12,
    totalTickets: 2,
    activeTickets: 1,
  },
  {
    name: "John Lee",
    status: "Active",
    totalOrders: 8,
    totalTickets: 1,
    activeTickets: 0,
  },
  {
    name: "Sara Khan",
    status: "Active",
    totalOrders: 14,
    totalTickets: 1,
    activeTickets: 0,
  },
  {
    name: "Marie",
    status: "Active",
    totalOrders: 6,
    totalTickets: 1,
    activeTickets: 1,
  },
  {
    name: "Aarav Mehta",
    status: "Active",
    totalOrders: 10,
    totalTickets: 2,
    activeTickets: 1,
  },
  {
    name: "Rohit Sharma",
    status: "Active",
    totalOrders: 9,
    totalTickets: 1,
    activeTickets: 0,
  },
  {
    name: "Nina Patel",
    status: "Active",
    totalOrders: 7,
    totalTickets: 1,
    activeTickets: 1,
  },
  {
    name: "Vikram Nair",
    status: "Active",
    totalOrders: 15,
    totalTickets: 1,
    activeTickets: 0,
  },
  {
    name: "Ananya Verma",
    status: "Active",
    totalOrders: 11,
    totalTickets: 1,
    activeTickets: 0,
  },
  {
    name: "Esha Bansal",
    status: "Active",
    totalOrders: 9,
    totalTickets: 1,
    activeTickets: 1,
  },
];

// 🔸 Settings Configuration
export const settings = {
  autoRefundLimit: 200,
  workingHours: "09:00 - 18:00",
  autoAssignTickets: true,
};
