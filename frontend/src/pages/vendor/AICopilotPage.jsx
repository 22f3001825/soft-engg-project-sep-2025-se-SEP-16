import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Header } from '../../components/common/Header';
import { TrendingUp, BarChart3, ArrowRight, Sparkles, RefreshCw, Lightbulb, Target, AlertTriangle } from 'lucide-react';

const AICopilotPage = () => {
  const [insights, setInsights] = useState({
    recentPattern: "40% of complaints tied to Supplier Y delays—recommend stock buffer.",
    vendorBenchmark: "Your return rate (4.2%) beats industry avg (6.1%)—great job!",
    actionableInsights: [
      "Review supplier contracts for better delivery terms",
      "Implement quality checks for audio components",
      "Monitor battery supplier performance closely"
    ]
  });
  
  const [loading, setLoading] = useState(false);

  const refreshInsights = () => {
    setLoading(true);
    setTimeout(() => {
      const patterns = [
        "40% of complaints tied to Supplier Y delays—recommend stock buffer.",
        "35% of issues related to battery performance—consider supplier audit.",
        "28% of connectivity problems stem from firmware updates—schedule testing.",
        "45% of returns due to packaging damage—review shipping protocols.",
        "32% of complaints about product descriptions—update listings."
      ];
      const benchmarks = [
        "Your return rate (4.2%) beats industry avg (6.1%)—great job!",
        "Your resolution time (2.3 days) is below industry avg (3.8 days)—excellent!",
        "Your customer satisfaction (4.7/5) exceeds industry avg (4.2/5)—outstanding!",
        "Your response time (4.2 hours) is faster than industry avg (8.1 hours)—impressive!",
        "Your product quality score (94%) surpasses industry avg (87%)—exceptional!"
      ];
      const insightsList = [
        ["Review supplier contracts for better delivery terms", "Implement quality checks for audio components", "Monitor battery supplier performance closely"],
        ["Audit battery suppliers for quality standards", "Enhance firmware testing protocols", "Improve customer communication during updates"],
        ["Strengthen connectivity testing procedures", "Partner with firmware specialists", "Develop proactive update notifications"],
        ["Upgrade packaging materials and processes", "Train shipping partners on handling", "Implement damage tracking system"],
        ["Collaborate with marketing on accurate descriptions", "Add more detailed product specifications", "Include customer usage scenarios"]
      ];

      const randomIndex = Math.floor(Math.random() * patterns.length);
      setInsights({
        recentPattern: patterns[randomIndex],
        vendorBenchmark: benchmarks[randomIndex],
        actionableInsights: insightsList[randomIndex]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              AI Vendor Copilot
            </h1>
            <p className="text-gray-600 text-lg">Smart insights and recommendations for your vendor operations</p>
          </div>
          <Button 
            onClick={refreshInsights}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Refresh Insights'}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Pattern Analysis */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl text-gray-800">Recent Pattern Analysis</span>
                  <p className="text-sm text-gray-600 font-normal">AI-detected trends in your data</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{insights.recentPattern}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Benchmark */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl text-gray-800">Performance Benchmark</span>
                  <p className="text-sm text-gray-600 font-normal">How you compare to industry standards</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{insights.vendorBenchmark}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Insights */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl text-gray-800">Actionable Insights</span>
                <p className="text-sm text-gray-600 font-normal">Recommended actions to improve your operations</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.actionableInsights.map((insight, index) => (
                <div key={index} className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-lg p-4 border border-orange-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Predictive Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Get forecasts for upcoming trends and potential issues.</p>
              <Button variant="outline" className="w-full">
                View Predictions
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Smart Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">AI-powered suggestions to optimize your vendor operations.</p>
              <Button variant="outline" className="w-full">
                Get Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICopilotPage;