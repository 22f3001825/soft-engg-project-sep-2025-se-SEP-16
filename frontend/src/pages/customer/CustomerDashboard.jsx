import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import {
  Package,
  Ticket,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  FileText,
  CheckCircle2,
  Activity,
  PieChart,
  Calendar,
  Clock,
  Users,
  Award,
  Target,
  MoreVertical,
  HelpCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { dashboardStats, orders, tickets } from '../../data/dummyData';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const recentOrders = orders.slice(0, 3);
  const recentTickets = tickets.slice(0, 3);

  // FAQ data
  const faqData = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by visiting the Orders page and clicking on any order to view its current status and tracking information."
    },
    {
      question: "How do I request a refund?",
      answer: "To request a refund, go to the Orders page, select the order you want to refund, and click on the 'Request Refund' button. Follow the instructions provided."
    },
    {
      question: "How do I create a support ticket?",
      answer: "Click on 'Create Ticket' in the Quick Actions section or visit the Tickets page and click 'New Ticket' to submit your support request."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Payment options are displayed during checkout."
    },
    {
      question: "How do I update my account information?",
      answer: "Visit the Profile page from the navigation menu to update your personal information, shipping addresses, and payment methods."
    },
    {
      question: "What is your return policy?",
      answer: "Items can be returned within 30 days of delivery. The item must be in its original condition and packaging. Visit the Orders page to initiate a return."
    }
  ];

  // Chart data
  const orderActivity = [
    { month: "Jan", orders: 5 },
    { month: "Feb", orders: 8 },
    { month: "Mar", orders: 12 },
    { month: "Apr", orders: 15 },
    { month: "May", orders: 18 },
    { month: "Jun", orders: 22 },
  ];

  const spendData = [
    { name: "Electronics", value: 35 },
    { name: "Clothing", value: 25 },
    { name: "Home & Garden", value: 20 },
    { name: "Books", value: 10 },
    { name: "Others", value: 10 },
  ];

  const COLORS = ['#1E40AF', '#059669', '#7C3AED', '#374151', '#DC2626'];

  const stats = [
    {
      title: 'Open Tickets',
      value: dashboardStats.openTickets,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Orders',
      value: dashboardStats.activeOrders,
      icon: Package,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Pending Refunds',
      value: dashboardStats.pendingRefunds,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Resolved Tickets',
      value: dashboardStats.resolvedTickets,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'open':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-300/30 to-blue-300/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-white via-slate-50 to-gray-50 border-b border-gray-200/50 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="text-left animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent animate-gradient-x">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-500 mt-2 text-base animate-fade-in-up animation-delay-200 font-medium">Here's what's happening with your account today</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  </div>
                  <div className="relative">
                    <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Activity Chart */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Order Activity Trend</span>
                <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              </CardTitle>
              <p className="text-sm text-gray-600">Monthly order performance</p>
            </CardHeader>
            <CardContent className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="url(#gradientLine)"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5, stroke: '#ffffff' }}
                    activeDot={{ r: 8, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                  <defs>
                    <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending Distribution */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Spending Distribution</span>
                <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
              </CardTitle>
              <p className="text-sm text-gray-600">Product category breakdown</p>
            </CardHeader>
            <CardContent className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={spendData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={85}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {spendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Quick Actions</span>
              <div className="ml-2 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
            </CardTitle>
            <p className="text-sm text-gray-600">Frequently used tasks</p>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 border-gray-300 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                      <HelpCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-900 group-hover/btn:text-purple-700 transition-colors duration-300">FAQ</span>
                      <p className="text-xs text-gray-600">Frequently asked questions</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/80 to-gray-50/60 border-0 shadow-2xl">
                  <DialogHeader className="text-center pb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-t-lg"></div>
                    <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                      <HelpCircle className="h-10 w-10 text-white" />
                    </div>
                    <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                      Frequently Asked Questions
                    </DialogTitle>
                    <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto leading-relaxed text-center">
                      Find quick answers to the most common questions about our platform and services
                    </p>
                    <div className="flex justify-center mt-4">
                      <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-6 mt-8 px-4">
                    {faqData.map((faq, index) => (
                      <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100/80 hover:shadow-2xl hover:border-blue-200/60 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-start gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mt-1">
                            <span className="text-white font-bold text-lg leading-none">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-bold text-gray-900 mb-4 text-xl leading-tight group-hover:text-blue-700 transition-colors duration-300">
                              {faq.question}
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-base font-medium">{faq.answer}</p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-pink-50/30 rounded-b-lg"></div>
                    <div className="relative py-6">
                      <p className="text-slate-500 text-sm font-medium">
                        For additional assistance, please contact our support team
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Link to="/customer/tickets/new">
                <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 border-gray-300 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 group-hover/btn:text-green-700 transition-colors duration-300">Create Ticket</span>
                    <p className="text-xs text-gray-600">Get support</p>
                  </div>
                </Button>
              </Link>
              <Link to="/customer/orders">
                <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 border-gray-300 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
                  <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 group-hover/btn:text-amber-700 transition-colors duration-300">Request Refund</span>
                    <p className="text-xs text-gray-600">View orders to request refund</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Orders</CardTitle>
                <p className="text-sm text-gray-600">Your latest purchases</p>
              </div>
              <Button
                onClick={() => navigate('/customer/orders')}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
              >
                View More <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                        <p className="text-xs text-gray-600">
                          {order.itemCount} items • ${order.total}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {order.date}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-xs font-medium`}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Tickets</CardTitle>
                <p className="text-sm text-gray-600">Your support requests</p>
              </div>
              <Button
                onClick={() => navigate('/customer/tickets')}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/customer/tickets/${ticket.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Ticket className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
                          <p className="text-xs text-gray-600">{ticket.id}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {ticket.date}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(ticket.status)} text-xs font-medium`}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <ChatBot />
    </div>
  );
};