import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
  MoreVertical
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

  const recentOrders = orders.slice(0, 3);
  const recentTickets = tickets.slice(0, 3);

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
      link: '/customer/tickets',
      trend: '+12%',
    },
    {
      title: 'Active Orders',
      value: dashboardStats.activeOrders,
      icon: Package,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/customer/orders',
      trend: '+5%',
    },
    {
      title: 'Pending Refunds',
      value: dashboardStats.pendingRefunds,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/customer/orders',
      trend: '-2%',
    },
    {
      title: 'Resolved Tickets',
      value: dashboardStats.resolvedTickets,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/customer/tickets',
      trend: '+8%',
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
      <div className="absolute inset-0 opacity-5">
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
            <Link key={index} to={stat.link}>
              <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stat.trend} from last week
                      </p>
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
            </Link>
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
              <Link to="/customer/orders/track/ORD-2024-002">
                <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 group-hover/btn:text-blue-700 transition-colors duration-300">Track Order</span>
                    <p className="text-xs text-gray-600">Monitor shipments</p>
                  </div>
                </Button>
              </Link>
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
              <Link to="/customer/orders/return">
                <Button variant="outline" className="group/btn w-full h-16 justify-start px-4 border-gray-300 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
                  <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 group-hover/btn:text-amber-700 transition-colors duration-300">Request Refund</span>
                    <p className="text-xs text-gray-600">Return process</p>
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
              <Link to="/customer/orders">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
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
              <Link to="/customer/tickets">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
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