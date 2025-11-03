import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Header } from '../../components/common/Header';
import { vendorDashboardStats, productComplaints, vendorProducts } from '../../data/dummyData';
import { TrendingUp, AlertTriangle, Package, BarChart3, ArrowRight, Star, Users, ShoppingCart, Eye, Clock, User, PieChart, Download, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const VendorDashboard = React.memo(() => {
  const [dateRange, setDateRange] = useState('30');
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

  const stats = vendorDashboardStats;
  const recentComplaints = useMemo(() => productComplaints.slice(0, 5), []);

  // Chart data - made more logical based on dashboard stats
  const complaintsTrendData = [
    { month: 'Jul', complaints: 110 },
    { month: 'Aug', complaints: 125 },
    { month: 'Sep', complaints: 130 },
    { month: 'Oct', complaints: 140 },
    { month: 'Nov', complaints: 135 },
    { month: 'Dec', complaints: stats.totalComplaintsThisMonth } // Align with current month total
  ];

  const issueCategoriesData = [
    { name: 'Audio Issues', value: 45, color: '#3B82F6' },
    { name: 'Battery Problems', value: 35, color: '#10B981' },
    { name: 'Connectivity', value: 30, color: '#F59E0B' },
    { name: 'Hardware Defects', value: 25, color: '#EF4444' }
  ];

  // Auto-refresh insights on page load
  useEffect(() => {
    const refreshInsights = () => {
      // Simulate dynamic data refresh
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
  }, []);

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
                Product Complaints
              </Button>
            </Link>
            {/* AI Copilot Sidebar */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Star className="h-4 w-4 mr-2" />
                  AI Copilot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Star className="h-6 w-6 text-purple-600" />
                    AI Copilot Assistant
                  </DialogTitle>
                  <DialogDescription>
                    Smart insights and recommendations to optimize your product performance
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* AI Insights Section */}
                  <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Star className="h-5 w-5 text-purple-600" />
                        AI Insights
                      </CardTitle>
                      <CardDescription>Auto-updated summary (refreshes on page load)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-2">Recent Pattern</p>
                        <p className="text-sm text-blue-700">{aiInsights.recentPattern}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-800 mb-2">Vendor Benchmark</p>
                        <p className="text-sm text-green-700">{aiInsights.vendorBenchmark}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-800">Actionable Insights:</p>
                        <ul className="space-y-2">
                          {aiInsights.actionableInsights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-gray-100">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="text-sm text-gray-700">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Auto-Updated FAQs Section */}
                  <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                        Recommended FAQs
                      </CardTitle>
                      <CardDescription>Dynamically pulled FAQs based on recent complaint patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {suggestedFaqs.length > 0 ? (
                          suggestedFaqs.map((faq, index) => (
                            <AccordionItem key={index} value={`faq-${index}`} className="border-b border-blue-100">
                              <AccordionTrigger className="text-left hover:text-blue-700 transition-colors">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-gray-600 pb-4">
                                Based on recent complaint patterns, this FAQ addresses common issues related to {faq.keywords.join(', ')}.
                                For detailed guidance, please refer to our comprehensive vendor support documentation or contact our support team.
                              </AccordionContent>
                            </AccordionItem>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No specific FAQs matched current complaint patterns.</p>
                            <p className="text-sm">FAQs will appear here as complaint trends emerge.</p>
                          </div>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-8">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 bg-white shadow-lg border-0">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">3 months</SelectItem>
              <SelectItem value="180">6 months</SelectItem>
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
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Return Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 mb-1">{stats.overallReturnRate}%</div>
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
              <p className="text-xs text-purple-600">Products with Complaints</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Complaints Trend Chart */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Complaints Trend
              </CardTitle>
              <CardDescription>Last 6 months</CardDescription>
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

          {/* Issue Categories Chart */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <PieChart className="h-5 w-5 text-green-600" />
                Issue Categories
              </CardTitle>
              <CardDescription>Breakdown of complaint types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={issueCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                  Recent Product Complaints
                </CardTitle>
                <CardDescription className="text-gray-600">Latest customer feedback across your products</CardDescription>
              </div>
              <div className="flex gap-3">
                <Button className="group border-2 border-green-500 bg-white text-green-600 hover:bg-green-600 hover:text-white hover:shadow-md transition-all duration-200 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Link to="/vendor/complaints">
                  <Button className="group border-2 border-blue-500 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all duration-200 flex items-center">
                    View All <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
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
});

export { VendorDashboard };
