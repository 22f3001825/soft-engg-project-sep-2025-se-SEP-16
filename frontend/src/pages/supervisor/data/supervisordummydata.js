// SUPERVISOR PORTAL DUMMY DATA

// 🔹 Supervisor Profile
export const supervisor = {
  email: "supervisor@intellica.com",
  password: "supervisor123",
  name: "Harsh Mathur",
  role: "supervisor",
};

// 🔹 Dashboard Overview
export const dashboardStats = [
  {
    title: "Total Tickets",
    value: 320,
    icon: "BarChart3",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Avg Resolution Time",
    value: "2h 10m",
    icon: "Activity",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "CSAT Score",
    value: "94%",
    icon: "TrendingUp",
    color: "text-success",
    bgColor: "bg-success-light",
  },
  {
    title: "Fraud Prevention",
    value: "$18,540",
    icon: "CheckCircle2",
    color: "text-warning",
    bgColor: "bg-warning-light",
  },
];

// 🔹 Ticket Summary Chart Data
export const ticketChartData = [
  { name: "Resolved", value: 60 },
  { name: "Pending", value: 25 },
  { name: "Escalated", value: 15 },
];

// 🔹 Alerts
export const alerts = [
  { id: 1, message: "Refund surge detected in Asia region", type: "critical" },
  { id: 2, message: "High response delay on weekend shifts", type: "warning" },
];

// 🔹 Team Performance
export const teamPerformance = [
  { name: "Alex Morgan", solved: 124, avg: "2h", csat: "95%" },
  { name: "Jordan Smith", solved: 112, avg: "2.5h", csat: "91%" },
  { name: "Riya Patel", solved: 98, avg: "1.8h", csat: "97%" },
  { name: "Priya Shah", solved: 106, avg: "2.2h", csat: "92%" },
];

// 🔹 Agents and Tickets (linked by ticket IDs)
export const agents = [
  {
    name: "Alex Morgan",
    status: "Online",
    tickets: [1, 2, 3, 4, 5],
    rating: 4.9,
    csat: "95%",
  },
  {
    name: "Priya Shah",
    status: "Away",
    tickets: [6, 7, 8, 9],
    rating: 4.2,
    csat: "90%",
  },
  {
    name: "Jordan Smith",
    status: "Busy",
    tickets: [10, 11, 12, 13, 14],
    rating: 3.5,
    csat: "93%",
  },
  {
    name: "Riya Patel",
    status: "Online",
    tickets: [15, 16, 17, 18, 19, 20],
    rating: 2.9,
    csat: "96%",
  },
];

// 🔹 Escalations (linked directly with ticket IDs and agent names)
export const escalations = [
  { id: 1, customer: "Maria Gomez", reason: "Duplicate Charge", agent: "Priya Shah" },
  { id: 2, customer: "John Lee", reason: "Refund Delay", agent: "Alex Morgan" },
  { id: 3, customer: "Sara Khan", reason: "Incorrect Billing", agent: "Jordan Smith" },
  { id: 4, customer: "Marie", reason: "Payment Failure", agent: "Riya Patel" },
  { id: 5, customer: "Gomez", reason: "Delayed Refund", agent: "Alex Morgan" },
  { id: 6, customer: "Rohit", reason: "Incorrect Billing", agent: "Jordan Smith" },
  { id: 7, customer: "Aarav", reason: "Duplicate Payment", agent: "Priya Shah" },
  { id: 8, customer: "Nina", reason: "Late Delivery", agent: "Riya Patel" },
  { id: 9, customer: "Krishna", reason: "Refund Not Processed", agent: "Priya Shah" },
  { id: 10, customer: "Vikram", reason: "Item Not Delivered", agent: "Jordan Smith" },
  { id: 11, customer: "Ananya", reason: "Incorrect Item Sent", agent: "Riya Patel" },
  { id: 12, customer: "Liam", reason: "Product Damage", agent: "Alex Morgan" },
  { id: 13, customer: "Esha", reason: "Warranty Claim", agent: "Priya Shah" },
  { id: 14, customer: "Noah", reason: "Partial Refund Issue", agent: "Jordan Smith" },
  { id: 15, customer: "Meera", reason: "Subscription Cancel Issue", agent: "Riya Patel" },
  { id: 16, customer: "Karan", reason: "Fraudulent Charge", agent: "Alex Morgan" },
  { id: 17, customer: "Aditi", reason: "Account Access Issue", agent: "Jordan Smith" },
  { id: 18, customer: "Sam", reason: "Double Delivery", agent: "Riya Patel" },
  { id: 19, customer: "Neha", reason: "Missing Accessories", agent: "Priya Shah" },
  { id: 20, customer: "Ravi", reason: "Late Refund", agent: "Alex Morgan" },
];

// 🔹 Settings Configuration
export const settings = {
  autoRefundLimit: 150,
  workingHours: "09:00 - 18:00",
  teamAccess: true,
  fraudChecks: true,
  csatSurveys: true,
};
