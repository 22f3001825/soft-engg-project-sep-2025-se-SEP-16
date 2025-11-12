import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Package, Search, MapPin, RotateCcw, Filter } from 'lucide-react';
import { orders } from '../../data/dummyData';
import apiService from '../../services/api';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders(statusFilter, searchQuery);
      setOrdersData(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrdersData(orders); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = ordersData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'in-transit':
        return 'bg-info text-info-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
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
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border border-gray-200 shadow-lg backdrop-blur-sm p-6 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600">Track and manage your orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl px-6 py-4 border border-blue-100/50 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  {filteredOrders.length}
                </div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Orders</div>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-blue-200 to-indigo-200"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 mb-1 capitalize">
                  {statusFilter !== 'all' ? statusFilter.replace('-', ' ') : 'All'}
                </div>
                <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Filter Applied</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search orders by ID or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/90 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
                />
              </div>
              <div className="md:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 bg-white/90 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-50/50 to-slate-50/50 border-2 border-gray-200/50 shadow-xl">
                <CardContent className="py-16 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="group bg-white/95 backdrop-blur-sm border-2 border-blue-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{order.id}</h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} font-semibold px-3 py-1 text-xs uppercase tracking-wide`}>
                      {order.status.replace('-', ' ')}
                    </Badge>
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Items Ordered:</p>
                      <ul className="space-y-1.5">
                        {(order.items || []).map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="font-medium">
                              {typeof item === 'string' ? item : `${item.product_name} (${item.quantity}x)`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-600">${order.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => navigate(`/customer/orders/track/${order.id}`)}
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 h-12 transition-colors duration-200 w-full"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Track Order
                      </Button>
                      {order.status === 'delivered' || order.status === 'DELIVERED' ? (
                        <Button
                          onClick={() => navigate(`/customer/orders/return?orderId=${order.id}`)}
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 h-12 transition-colors duration-200 w-full"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Return
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="bg-gray-100 border border-gray-300 text-gray-500 font-semibold py-3 px-4 h-12 cursor-not-allowed w-full"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          No Actions
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <ChatBot />
    </div>
  );
};
