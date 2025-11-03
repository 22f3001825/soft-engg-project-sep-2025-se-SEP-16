import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { orders } from '../../data/dummyData';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-lg font-semibold mb-2">Order not found</h3>
              <Button onClick={() => navigate('/customer/orders')}>Back to Orders</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const trackingSteps = [
    { label: 'Order Placed', icon: Package, completed: true },
    { label: 'Payment Confirmed', icon: CheckCircle2, completed: true },
    { label: 'Packed', icon: Package, completed: order.status !== 'processing' },
    { label: 'Shipped', icon: Truck, completed: order.status === 'in-transit' || order.status === 'delivered' },
    { label: 'In Transit', icon: Truck, completed: order.status === 'in-transit' || order.status === 'delivered', current: order.status === 'in-transit' },
    { label: 'Out for Delivery', icon: Truck, completed: order.status === 'delivered' },
    { label: 'Delivered', icon: CheckCircle2, completed: order.status === 'delivered', current: order.status === 'delivered' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customer/orders')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">Order Tracking</CardTitle>
                  <p className="text-muted-foreground">Order ID: {order.id}</p>
                </div>
                <Badge
                  className="text-base px-4 py-2 w-fit"
                  variant={order.status === 'delivered' ? 'default' : 'secondary'}
                >
                  {order.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Tracking Timeline */}
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />
                
                <div className="space-y-6">
                  {trackingSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-background ${
                          step.current 
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                            : step.completed 
                              ? 'bg-success text-success-foreground' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <h4 className={`font-semibold ${
                            step.current || step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </h4>
                          {step.current && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Current Status
                            </p>
                          )}
                        </div>

                        {/* Checkmark for completed */}
                        {step.completed && !step.current && (
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-3" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Location */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium mb-2">{order.currentLocation}</p>
                <p className="text-sm text-muted-foreground">
                  Expected delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Courier Info */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  Courier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Courier Service</p>
                  <p className="text-foreground font-medium">{order.courierName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="text-foreground font-mono text-sm">{order.trackingNumber}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-foreground">{order.courierContact}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-foreground">{item}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <ChatBot />
    </div>
  );
};
