import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Header } from '../../components/common/Header';
import { vendorProducts } from '../../data/dummyData';
import { Download, ArrowLeft, Package, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [selectedIssue, setSelectedIssue] = useState(null);

  const product = vendorProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/vendor/complaints')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadReport = () => {
    // Mock download functionality
    const data = {
      product: product.name,
      complaints: product.totalComplaints,
      returnRate: product.returnRate,
      topIssues: product.topIssues,
      trend: product.complaintsTrend
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name.replace(/\s+/g, '_')}_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/vendor/complaints')}
            variant="outline"
            className="mb-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-lg">{product.category}</p>
              </div>
            </div>
            <Button onClick={handleDownloadReport} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 text-black">
              <Download className="h-4 w-4 mr-2" />
              <span className="inline">Download Report</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Overview Stats */}
          <Card className="shadow-lg border-2 border-gray-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700 font-medium">Total Complaints</span>
                  <span className="font-bold text-red-700 text-xl">{product.totalComplaints}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-gray-700 font-medium">Return Rate</span>
                  <span className="font-bold text-orange-700 text-xl">{product.returnRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints Trend Chart (Simplified) */}
          <Card className="shadow-lg border-2 border-gray-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Complaints Trend
              </CardTitle>
              <CardDescription className="text-gray-600">Last 3 months</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {product.complaintsTrend.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <span className="text-sm font-medium text-gray-700 w-12">{data.month}</span>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(data.count / Math.max(...product.complaintsTrend.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-800 w-8">{data.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issue Breakdown */}
        <Card className="shadow-lg border-2 border-gray-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              Issue Breakdown
            </CardTitle>
            <CardDescription className="text-gray-600">Main problem categories and their frequency</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-300" onClick={() => setSelectedIssue(issue)}>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 text-blue-700 font-medium">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-gray-800">{issue}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {Math.floor(Math.random() * 20) + 5} reports
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Details Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedIssue} - Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)} className="hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors">
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Total Reports
                    </h4>
                    <p className="text-3xl font-bold text-blue-700">{Math.floor(Math.random() * 20) + 5}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Severity Level
                    </h4>
                    <p className="text-3xl font-bold text-red-700">High</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Recent Complaints
                  </h4>
                  <div className="space-y-3">
                    {[
                      "Customer reported issue with product functionality",
                      "Multiple users experiencing the same problem",
                      "Issue persists after multiple attempts to fix",
                      "Customer demands immediate resolution",
                      "Similar complaints from different regions"
                    ].map((complaint, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border-l-4 border-blue-500 shadow-sm border-2 border-gray-200">
                        <p className="text-sm text-gray-700">{complaint}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reported {Math.floor(Math.random() * 30) + 1} days ago
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h4 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Common Solutions
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    <li>Check product specifications and compatibility</li>
                    <li>Verify installation and setup procedures</li>
                    <li>Update firmware/software to latest version</li>
                    <li>Replace defective components if applicable</li>
                    <li>Provide customer support training materials</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-semibold mb-2 text-yellow-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Impact Analysis
                  </h4>
                  <div className="bg-white p-3 rounded border-l-4 border-yellow-500 border-2 border-gray-200">
                    <p className="text-sm text-gray-700">
                      This issue affects approximately {Math.floor(Math.random() * 15) + 5}% of customers
                      and has resulted in {Math.floor(Math.random() * 10) + 1} product returns this month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ProductDetailsPage };
