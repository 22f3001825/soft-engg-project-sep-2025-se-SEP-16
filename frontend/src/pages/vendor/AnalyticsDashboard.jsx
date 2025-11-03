import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Header } from '../../components/common/Header';
import { Download, Lightbulb, ChevronDown, ChevronUp, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const [showInsights, setShowInsights] = useState(true);
  const [faqsOpen, setFaqsOpen] = useState({});
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Logical dummy data with proper periods
  const allComplaintsTrend = [
    // 6 months (180 days): Jul-Dec
    { month: 'Jul', complaints: 190, period: '180' },
    { month: 'Aug', complaints: 165, period: '180' },
    { month: 'Sep', complaints: 175, period: '180' },
    { month: 'Oct', complaints: 155, period: '180' },
    { month: 'Nov', complaints: 145, period: '180' },
    { month: 'Dec', complaints: 160, period: '180' },
    // 3 months (90 days): Oct-Dec
    { month: 'Oct', complaints: 155, period: '90' },
    { month: 'Nov', complaints: 145, period: '90' },
    { month: 'Dec', complaints: 160, period: '90' },
    // 1 month (30 days): Dec
    { month: 'Dec', complaints: 160, period: '30' }
  ];

  const allIssueCategories = [
    { category: 'Audio Issues', count: 45, percentage: 30, color: '#3B82F6', period: 'all' },
    { category: 'Battery Problems', count: 35, percentage: 23, color: '#10B981', period: 'all' },
    { category: 'Connectivity', count: 30, percentage: 20, color: '#F59E0B', period: 'all' },
    { category: 'Hardware Defects', count: 25, percentage: 17, color: '#EF4444', period: 'all' },
    { category: 'Other', count: 15, percentage: 10, color: '#8B5CF6', period: 'all' }
  ];

  // Filter data based on date range
  const filteredData = useMemo(() => {
    const filteredTrend = allComplaintsTrend.filter(item => item.period === dateRange);

    // Scale issue categories based on filtered complaints
    const totalComplaints = filteredTrend.reduce((sum, item) => sum + item.complaints, 0);
    const avgComplaints = filteredTrend.length > 0 ? totalComplaints / filteredTrend.length : 0;

    const filteredCategories = allIssueCategories.map(cat => ({
      ...cat,
      count: Math.round((cat.percentage / 100) * avgComplaints),
      percentage: cat.percentage
    }));

    return {
      complaintsTrend: filteredTrend,
      issueCategories: filteredCategories,
      totalComplaints,
      trendChange: filteredTrend.length > 1 ?
        ((filteredTrend[filteredTrend.length - 1].complaints - filteredTrend[0].complaints) / filteredTrend[0].complaints * 100) : 0
    };
  }, [dateRange]);

  const { complaintsTrend, issueCategories, totalComplaints, trendChange } = filteredData;

  const aiInsights = [
    `Recent Pattern: ${trendChange > 0 ? 'Increasing' : 'Decreasing'} trend of ${Math.abs(trendChange).toFixed(1)}% in complaints over selected period.`,
    "Vendor Benchmark: Your return rate (4.2%) beats industry avg (6.1%)—great job!",
    "Actionable: Implement quality checks for audio components to reduce complaints by 25%."
  ];

  const faqs = [
    { question: "How to reduce delivery issues?", answer: "Implement buffer stock and diversify suppliers." },
    { question: "Fraud detection best practices", answer: "Monitor unusual return patterns and verify customer data." },
    { question: "Improving product quality", answer: "Conduct regular quality audits and gather customer feedback." }
  ];

  const handleExportPDF = () => {
    alert('PDF export functionality would generate a full analytical report with charts and summaries.');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Month,Complaints\n" +
      complaintsTrend.map(row => `${row.month},${row.complaints}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaints_trend_${dateRange}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFaq = (index) => {
    setFaqsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const maxComplaints = Math.max(...complaintsTrend.map(d => d.complaints));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600 text-lg">Advanced analytics and insights for product performance</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-gray-700 hover:text-blue-700 border-gray-300 px-4 py-2">
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Export PDF</span>
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200 text-gray-700 hover:text-green-700 border-gray-300 px-4 py-2">
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 bg-white shadow-lg border-0">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Enhanced Bar Chart - Complaints Trend */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Complaints Trend
                  </CardTitle>
                  <CardDescription>Monthly complaints over selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaintsTrend.map((data, index) => (
                      <div key={index} className="flex items-center gap-4 group">
                        <span className="text-sm font-medium w-12 text-gray-600">{data.month}</span>
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded-full h-10 flex items-center shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full transition-all duration-700 ease-out shadow-md"
                              style={{ width: `${(data.complaints / maxComplaints) * 100}%` }}
                              onMouseEnter={() => setHoveredBar(index)}
                              onMouseLeave={() => setHoveredBar(null)}
                            ></div>
                          </div>
                          <span className="absolute right-3 top-2 text-sm font-bold text-white drop-shadow-md">
                            {data.complaints}
                          </span>
                          {hoveredBar === index && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                              {data.month}: {data.complaints} complaints
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Pie Chart - Issue Categories */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Issue Categories
                  </CardTitle>
                  <CardDescription>Breakdown of complaint types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Enhanced Pie Chart Visualization */}
                    <div className="flex justify-center mb-6">
                      <div className="relative w-40 h-40 group">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                          {issueCategories.map((issue, index) => {
                            const previousPercentage = issueCategories.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0);
                            const startAngle = (previousPercentage / 100) * 360;
                            const endAngle = ((previousPercentage + issue.percentage) / 100) * 360;
                            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                            const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                            const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                            const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                            const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

                            return (
                              <path
                                key={index}
                                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                fill={hoveredPieSlice === index ? issue.color : issue.color}
                                stroke="white"
                                strokeWidth="2"
                                className="transition-all duration-300 cursor-pointer hover:opacity-80"
                                onMouseEnter={() => setHoveredPieSlice(index)}
                                onMouseLeave={() => setHoveredPieSlice(null)}
                              />
                            );
                          })}
                        </svg>
                        {hoveredPieSlice !== null && !showTooltip && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-lg text-sm font-medium border">
                              {issueCategories[hoveredPieSlice].category}
                              <br />
                              {issueCategories[hoveredPieSlice].count} ({issueCategories[hoveredPieSlice].percentage}%)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div className="space-y-3">
                      {issueCategories.map((issue, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredPieSlice(index)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: issue.color }}
                            ></div>
                            <span className="text-sm font-medium">{issue.category}</span>
                          </div>
                          <div className="text-sm font-bold text-gray-700">
                            {issue.count} <span className="text-gray-500">({issue.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>

          {/* AI Insights Panel */}
          {!showInsights && (
            <div className="w-80">
              <Button onClick={() => setShowInsights(true)} className="w-full">
                Show Insights
              </Button>
            </div>
          )}
          {showInsights && (
            <div className="w-80">
              <Card className="shadow-lg border-2 border-gray-200 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-lg text-gray-800">AI Insights</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInsights(false)}
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-800">Auto-Updated Summary</h4>
                    <ul className="space-y-2 text-sm">
                      {aiInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-800">FAQs</h4>
                    <div className="space-y-2">
                      {faqs.map((faq, index) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger
                            className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded transition-colors"
                            onClick={() => toggleFaq(index)}
                          >
                            <span className="text-sm font-medium text-gray-700">{faq.question}</span>
                            {faqsOpen[index] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-2 pb-2">
                            <p className="text-sm text-gray-600">{faq.answer}</p>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;