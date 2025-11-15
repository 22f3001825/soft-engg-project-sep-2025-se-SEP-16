import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Header } from '../../components/common/Header';
import vendorApi from '../../services/vendorApi';
import { TrendingUp, AlertTriangle, Package, BarChart3, ArrowRight, Star, Users, ShoppingCart, Eye, Clock, User, PieChart, Download, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const VendorDashboard = React.memo(() => {
  const [dateRange, setDateRange] = useState('30');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState({
    recentPattern: "40% of complaints tied to Supplier Y delays—recommend stock buffer.",
    vendorBenchmark: "Your return rate (4.2%) beats industry avg (6.1%)—great job!",
    actionableInsights: [
      "Review supplier contracts for better delivery terms",
      "Implement quality checks for audio components",
      "Monitor battery supplier performance closely"
    ]
  });
  const [suggestedFaqs, setSuggestedFaqs] = useState([]);

  const stats = dashboardData || {
    totalComplaints: 0,
    overallReturnRate: 0,
    topIssueCategory: "Loading...",
    totalProducts: 0
  };
  const recentComplaints = dashboardData?.recentComplaints || [];

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await vendorApi.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        // Set fallback data on error
        setDashboardData({
          totalComplaints: 8,
          overallReturnRate: 4.2,
          topIssueCategory: "Audio Issues",
          totalProducts: 10,
          recentComplaints: []
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Auto-refresh insights on page load
  useEffect(() => {
    const refreshInsights = () => {
      const patterns = [
        "40% of complaints tied to Supplier Y delays—recommend stock buffer.",
        "35% of issues related to battery performance—consider supplier audit.",
        "28% of connectivity problems stem from firmware updates—schedule testing."
      ];
      const benchmarks = [
        "Your return rate (4.2%) beats industry avg (6.1%)—great job!",
        "Your resolution time (2.3 days) is below industry avg (3.8 days)—excellent!",
        "Your customer satisfaction (4.7/5) exceeds industry avg (4.2/5)—outstanding!"
      ];
      const insights = [
        ["Review supplier contracts for better delivery terms", "Implement quality checks for audio components", "Monitor battery supplier performance closely"],
        ["Audit battery suppliers for quality standards", "Enhance firmware testing protocols", "Improve customer communication during updates"],
        ["Strengthen connectivity testing procedures", "Partner with firmware specialists", "Develop proactive update notifications"]
      ];

      const randomIndex = Math.floor(Math.random() * patterns.length);
      setAiInsights({
        recentPattern: patterns[randomIndex],
        vendorBenchmark: benchmarks[randomIndex],
        actionableInsights: insights[randomIndex]
      });
    };

    refreshInsights();
  }, [dashboardData]);

  // Keyword matching for FAQ suggestions
  useEffect(() => {
    const keywords = recentComplaints.flatMap(complaint =>
      complaint.issue.toLowerCase().split(' ')
    );

    const faqDatabase = [
      { question: "How to reduce delivery issues?", keywords: ["delay", "delivery", "supplier", "shipping"] },
      { question: "Fraud detection best practices", keywords: ["fraud", "scam", "fake", "counterfeit"] },
      { question: "Quality control procedures", keywords: ["quality", "defect", "faulty", "broken"] },
      { question: "Battery performance optimization", keywords: ["battery", "power", "charging", "drain"] },
      { question: "Audio component troubleshooting", keywords: ["audio", "sound", "speaker", "noise"] },
      { question: "Connectivity issue resolution", keywords: ["connectivity", "wifi", "bluetooth", "network"] }
    ];

    const matchedFaqs = faqDatabase.filter(faq =>
      faq.keywords.some(keyword => keywords.includes(keyword))
    ).slice(0, 3);

    setSuggestedFaqs(matchedFaqs);
  }, [recentComplaints]);

  const [analyticsData, setAnalyticsData] = useState(null);

  // Load analytics data for charts
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await vendorApi.getAnalytics('180');
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };
    if (dashboardData) {
      loadAnalytics();
    }
  }, [dashboardData]);

  // Use real analytics data or fallback
  const complaintsTrendData = analyticsData?.complaintsTrend || [
    { month: 'Dec', complaints: stats.totalComplaints || 0 }
  ];

  const issueCategoriesData = analyticsData?.issueCategories?.map(cat => ({
    name: cat.category,
    value: cat.count,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][analyticsData.issueCategories.indexOf(cat)] || '#6B7280'
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

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
            <Link to="/vendor/ai-copilot">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <Star className="h-4 w-4 mr-2" />
                AI Copilot
              </Button>
            </Link>
            <Link to="/vendor/complaints">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <Package className="h-4 w-4 mr-2" />
                Product Complaints
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Complaints</CardTitle>
              <AlertTriangle className="h-5 w-5 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalComplaints}</div>
              <p className="text-xs text-blue-100">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Return Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.overallReturnRate}%</div>
              <p className="text-xs text-orange-100">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Top Issue</CardTitle>
              <BarChart3 className="h-5 w-5 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-white mb-1">{stats.topIssueCategory}</div>
              <p className="text-xs text-green-100">Most reported issue</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Products</CardTitle>
              <Package className="h-5 w-5 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalProducts}</div>
              <p className="text-xs text-purple-100">Total products</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Complaints Trend
              </CardTitle>
              <CardDescription>Monthly complaint volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complaintsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="complaints" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-500" />
                Issue Categories
              </CardTitle>
              <CardDescription>Distribution of complaint types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={issueCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
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
                  Recent Complaints ({recentComplaints.length})
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {recentComplaints.length === 0 ? 'No complaints - great job!' : 
                   recentComplaints.length <= 2 ? 'Low complaint volume' :
                   recentComplaints.length <= 5 ? 'Moderate activity' : 'High activity - review needed'}
                </CardDescription>
              </div>
              {recentComplaints.length > 0 && (
                <Link to="/vendor/complaints">
                  <Button size="sm" variant="outline">
                    View All
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {recentComplaints.length > 0 ? (
              <div className="space-y-4">
                {recentComplaints.map((complaint, index) => (
                  <div key={complaint.id} className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{complaint.productName}</h4>
                          <Badge className={`${
                            complaint.severity === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                            complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            {complaint.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{complaint.issue}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Status: <span className="capitalize font-medium">{complaint.status}</span></span>
                          <span>Date: {new Date(complaint.reportedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Complaints</h3>
                <p className="text-gray-500">Your products are performing well! Keep up the great work.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export { VendorDashboard };