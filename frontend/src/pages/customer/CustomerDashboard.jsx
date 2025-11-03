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

  const COLORS = ['#6366f1', '#14b8a6', '#f43f5e', '#8b5cf6', '#f59e0b'];

  const stats = [
    {
      title: 'Open Tickets',
      value: dashboardStats.openTickets,
      icon: Ticket,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Active Orders',
      value: dashboardStats.activeOrders,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Pending Refunds',
      value: dashboardStats.pendingRefunds,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      title: 'Resolved Tickets',
      value: dashboardStats.resolvedTickets,
      icon: CheckCircle2,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'in-transit':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'open':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'in-progress':
        return 'bg-violet-50 text-violet-700 border border-violet-200';
      case 'resolved':
        return 'bg-teal-50 text-teal-700 border border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border border-gray-200 shadow-lg backdrop-blur-sm p-6 rounded-xl overflow-hidden mx-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
              <p className="text-gray-600">Here's what's happening with your account today</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br ${stat.bgColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`} style={{borderColor: stat.bgColor.replace('from-', '').replace('to-', '').replace('-50', '-400').replace('-100', '-400')}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 text-white`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <p className="text-xs text-gray-100">Current status</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Activity Chart */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-cyan-50 border-2 border-indigo-200 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Order Activity Trend</span>
                <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
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
                    dot={{ fill: '#6366f1', strokeWidth: 3, r: 5, stroke: '#ffffff' }}
                    activeDot={{ r: 8, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                  <defs>
                    <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending Distribution */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-200 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Spending Distribution</span>
                <MoreVertical className="h-4 w-4 text-gray-400 group-hover:text-violet-500 transition-colors duration-300" />
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
        <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 border-2 border-indigo-200/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <CardHeader className="relative">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Quick Actions</span>
              <div className="ml-2 w-2 h-2 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full animate-pulse"></div>
            </CardTitle>
            <p className="text-sm text-gray-600">Frequently used tasks</p>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 bg-white/90 backdrop-blur-sm border-slate-300 hover:border-violet-400 hover:bg-white hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
                    <div className="p-2 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                      <HelpCircle className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-gray-900 group-hover/btn:text-violet-700 transition-colors duration-300">FAQ</span>
                      <p className="text-xs text-gray-600">Frequently asked questions</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/80 to-gray-50/60 border-0 shadow-2xl">
                  <DialogHeader className="text-center pb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-violet-600/5 to-fuchsia-600/5 rounded-t-lg"></div>
                    <div className="relative mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <HelpCircle className="h-8 w-8 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                      Frequently Asked Questions
                    </DialogTitle>
                    <p className="text-slate-600 text-base font-medium max-w-xl mx-auto leading-relaxed text-center">
                      Find quick answers to the most common questions about our platform and services
                    </p>
                  </DialogHeader>
                  <div className="space-y-4 mt-6 px-4">
                    {faqData.map((faq, index) => (
                      <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100/80 hover:shadow-lg hover:border-indigo-200/60 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/20 via-transparent to-violet-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight group-hover:text-indigo-700 transition-colors duration-300">
                            {faq.question}
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-sm font-medium">{faq.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-violet-50/30 to-fuchsia-50/30 rounded-b-lg"></div>
                    <div className="relative py-4">
                      <p className="text-slate-500 text-sm font-medium">
                        For additional assistance, please contact our support team
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Link to="/customer/tickets/new">
                <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 bg-white/90 backdrop-blur-sm border-slate-300 hover:border-emerald-400 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                  <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 group-hover/btn:text-emerald-700 transition-colors duration-300">Create Ticket</span>
                    <p className="text-xs text-gray-600">Get support</p>
                  </div>
                </Button>
              </Link>
              <Link to="/customer/orders">
                <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 bg-white/90 backdrop-blur-sm border-slate-300 hover:border-amber-400 hover:bg-white hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
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
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 border-2 border-indigo-200/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Orders</CardTitle>
                <p className="text-sm text-gray-600">Your latest purchases</p>
              </div>
              <Button
                onClick={() => navigate('/customer/orders')}
                variant="outline"
                size="sm"
                className="text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
              >
                View More <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-200 bg-white/90 shadow-sm hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg border border-indigo-200">
                        <ShoppingBag className="h-4 w-4 text-indigo-600" />
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
                    <Badge className={`${getStatusColor(order.status)} text-xs font-medium border-2`}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 border-2 border-indigo-200/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Tickets</CardTitle>
                <p className="text-sm text-gray-600">Your support requests</p>
              </div>
              <Button
                onClick={() => navigate('/customer/tickets')}
                variant="outline"
                size="sm"
                className="text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/customer/tickets/${ticket.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-200 bg-white/90 shadow-sm hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-violet-100 rounded-lg border border-violet-200">
                          <Ticket className="h-4 w-4 text-violet-600" />
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
                      <Badge className={`${getStatusColor(ticket.status)} text-xs font-medium border-2`}>
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