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
  CheckCircle2
} from 'lucide-react';
import { dashboardStats, orders, tickets } from '../../data/dummyData';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  
  const recentOrders = orders.slice(0, 3);
  const recentTickets = tickets.slice(0, 3);

  const stats = [
    {
      title: 'Open Tickets',
      value: dashboardStats.openTickets,
      icon: Ticket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      link: '/customer/tickets'
    },
    {
      title: 'Active Orders',
      value: dashboardStats.activeOrders,
      icon: Package,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      link: '/customer/orders'
    },
    {
      title: 'Pending Refunds',
      value: dashboardStats.pendingRefunds,
      icon: DollarSign,
      color: 'text-warning',
      bgColor: 'bg-warning-light',
      link: '/customer/orders'
    },
    {
      title: 'Resolved Tickets',
      value: dashboardStats.resolvedTickets,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success-light',
      link: '/customer/tickets'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'in-transit':
        return 'bg-info text-info-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'open':
        return 'bg-info text-info-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="animate-slide-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg btn-transition cursor-pointer group animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 btn-transition`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="animate-slide-in-up">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/customer/orders/track/ORD-2024-002">
                <Button variant="outline" className="w-full h-auto flex-col py-4 space-y-2 hover:bg-primary hover:text-primary-foreground btn-transition">
                  <Package className="h-6 w-6" />
                  <span className="font-medium">Track Order</span>
                </Button>
              </Link>
              <Link to="/customer/tickets/new">
                <Button variant="outline" className="w-full h-auto flex-col py-4 space-y-2 hover:bg-accent hover:text-accent-foreground btn-transition">
                  <FileText className="h-6 w-6" />
                  <span className="font-medium">Create Ticket</span>
                </Button>
              </Link>
              <Link to="/customer/orders/return">
                <Button variant="outline" className="w-full h-auto flex-col py-4 space-y-2 hover:bg-warning hover:text-warning-foreground btn-transition">
                  <TrendingUp className="h-6 w-6" />
                  <span className="font-medium">Request Refund</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders and Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="animate-slide-in-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <Link to="/customer/orders">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary btn-transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} • ${order.total}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="animate-slide-in-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recent Tickets</CardTitle>
              <Link to="/customer/tickets">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/customer/tickets/${ticket.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary btn-transition cursor-pointer">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Ticket className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">{ticket.id}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
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
