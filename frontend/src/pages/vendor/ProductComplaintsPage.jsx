import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Header } from '../../components/common/Header';
import vendorApi from '../../services/vendorApi';
import { TrendingUp, Eye, Package, AlertTriangle, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load complaints data
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await vendorApi.getComplaints();
        setComplaintsData(data);
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    loadComplaints();
  }, []);

  const handleViewDetails = (productId) => {
    navigate(`/vendor/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Product Complaints
          </h1>
          <p className="text-gray-600 text-lg">Monitor complaint trends and return rates for your products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaintsData.map((product, index) => (
            <Card key={product.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">{product.name}</CardTitle>
                    <CardDescription className="text-gray-600">{product.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700 font-medium">Total Complaints</span>
                    </div>
                    <span className="font-bold text-red-700 text-lg">{product.totalComplaints}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-700 font-medium">Return Rate</span>
                    </div>
                    <span className="font-bold text-orange-700 text-lg">{product.returnRate}%</span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-700 font-medium">Top Issues</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.topIssues.map((issue, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewDetails(product.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProductComplaintsPage };
