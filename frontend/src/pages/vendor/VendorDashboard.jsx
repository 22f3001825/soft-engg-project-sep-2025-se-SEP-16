import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Header } from '../../components/common/Header';
import { vendorDashboardStats, productComplaints, vendorProducts } from '../../data/dummyData';
import { TrendingUp, AlertTriangle, Package, BarChart3, ArrowRight, Star, Users, ShoppingCart, Eye, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
  const [dateRange, setDateRange] = useState('30');

  const stats = vendorDashboardStats;
  const recentComplaints = productComplaints.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Vendor Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Monitor product performance and customer satisfaction</p>
          </div>
          <div className="flex gap-3">
            <Link to="/vendor/complaints">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <Package className="h-4 w-4 mr-2" />
                View Products
              </Button>
            </Link>
            <Link to="/vendor/analytics">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="inline">Analytics</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-8">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 bg-white shadow-lg border-0">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Total Complaints</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 mb-1">{stats.totalComplaintsThisMonth}</div>
              <p className="text-xs text-red-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Return Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 mb-1">{stats.overallReturnRate}%</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                -2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Top Issue</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-blue-700 mb-1">{stats.topIssueCategory}</div>
              <p className="text-xs text-blue-600">Most reported issue</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Products</CardTitle>
              <Package className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 mb-1">{stats.totalProducts}</div>
              <p className="text-xs text-purple-600 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Some performing bad
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-100 transition-colors">Product Analytics</h3>
                  <p className="text-blue-100 text-sm">Deep dive into product performance</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200 group-hover:text-white transition-colors" />
              </div>
              <Link to="/vendor/analytics">
                <Button variant="secondary" className="mt-4 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-200">
                  View Analytics <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-green-100 transition-colors">Customer Insights</h3>
                  <p className="text-green-100 text-sm">Understand customer behavior</p>
                </div>
                <Users className="h-8 w-8 text-green-200 group-hover:text-white transition-colors" />
              </div>
              <Button variant="secondary" className="mt-4 bg-white text-green-600 hover:bg-green-50 hover:scale-105 transition-all duration-200">
                View Insights <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-100 transition-colors">Quick Actions</h3>
                  <p className="text-purple-100 text-sm">Manage products and orders</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-200 group-hover:text-white transition-colors" />
              </div>
              <Link to="/vendor/complaints">
                <Button variant="secondary" className="mt-4 bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all duration-200">
                  Manage Products <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Complaints Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Recent Product Complaints
                </CardTitle>
                <CardDescription className="text-gray-600">Latest customer feedback across your products</CardDescription>
              </div>
              <Link to="/vendor/complaints">
                <Button className="group border-2 border-blue-500 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all duration-200 flex items-center">
                  View All <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-700 py-4">
                      <Package className="h-4 w-4 inline mr-2" />
                      Product
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      Issue
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <TrendingUp className="h-4 w-4 inline mr-2" />
                      Severity
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <User className="h-4 w-4 inline mr-2" />
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentComplaints.map((complaint, index) => (
                    <TableRow key={complaint.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <TableCell className="font-medium text-gray-900 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          {complaint.productName}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="max-w-xs truncate" title={complaint.issue}>
                          {complaint.issue}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          complaint.severity === 'high' ? 'destructive' :
                          complaint.severity === 'medium' ? 'default' : 'secondary'
                        } className="font-medium shadow-sm">
                          {complaint.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          complaint.status === 'open' ? 'destructive' :
                          complaint.status === 'in-progress' ? 'default' : 'secondary'
                        } className="font-medium shadow-sm">
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium">
                        {new Date(complaint.reportedDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { VendorDashboard };
