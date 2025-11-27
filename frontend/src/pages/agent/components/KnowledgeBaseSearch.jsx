import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  Search, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  X,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import agentApi from '../../../services/agentApi';

export const KnowledgeBaseSearch = ({ isCollapsible = false, defaultExpanded = true }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 500);
    } else if (query.trim().length === 0) {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, category]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await agentApi.getKnowledgeCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Don't show error toast for categories, just log it
    } finally {
      setCategoriesLoading(false);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await agentApi.searchKnowledgeBase(query, category || null);
      setResults(data.results || []);
      
      if (data.results && data.results.length === 0) {
        toast.info('No results found', {
          description: 'Try different keywords or remove filters'
        });
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Unable to search knowledge base');
      toast.error('Search failed', {
        description: 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setCategory('');
    setResults([]);
    setError(null);
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'Billing': 'bg-blue-100 text-blue-700 border-blue-300',
      'Technical': 'bg-purple-100 text-purple-700 border-purple-300',
      'Product': 'bg-green-100 text-green-700 border-green-300',
      'Shipping': 'bg-orange-100 text-orange-700 border-orange-300',
      'Refund': 'bg-red-100 text-red-700 border-red-300',
      'Return': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Policy': 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[cat] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getRelevanceLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  // Document viewer modal
  if (selectedDocument) {
    return (
      <Card className="shadow-lg border-2 border-blue-500/20 bg-gradient-to-br from-background via-blue-500/5 to-accent/5">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
              {selectedDocument.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseDocument}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={getCategoryColor(selectedDocument.category)}>
              {selectedDocument.category}
            </Badge>
            {selectedDocument.subcategory && (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-xs">
                {selectedDocument.subcategory}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[500px] pr-4">
            <div className="prose prose-sm max-w-none">
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                {selectedDocument.content || selectedDocument.excerpt}
              </div>
              
              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseDocument}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(selectedDocument.content || selectedDocument.excerpt);
                toast.success('Content copied to clipboard');
              }}
              className="flex-1"
            >
              Copy Content
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main search widget
  return (
    <Card className="shadow-lg border-2 border-blue-500/20 bg-gradient-to-br from-background via-blue-500/5 to-accent/5">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search knowledge base..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
              />
              {query && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Results */}
          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm text-muted-foreground">Searching knowledge base...</p>
              </div>
            ) : error ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Search Error</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              </div>
            ) : query.trim().length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Search for policies, procedures, and guides</p>
                <p className="text-xs mt-1">Type at least 2 characters to search</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-1">Try different keywords or remove filters</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {results.map((doc, index) => (
                    <div
                      key={index}
                      className="border-2 border-blue-200/50 rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewDocument(doc)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={getCategoryColor(doc.category)}>
                              {doc.category}
                            </Badge>
                            {doc.subcategory && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-xs">
                                {doc.subcategory}
                              </Badge>
                            )}
                            {doc.relevance_score !== undefined && (
                              <Badge 
                                variant="outline" 
                                className="bg-blue-50 text-blue-700 border-blue-300 text-xs"
                              >
                                <span className={getRelevanceColor(doc.relevance_score)}>
                                  {getRelevanceLabel(doc.relevance_score)} Relevance
                                </span>
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                        {doc.excerpt}
                      </p>

                      {/* Tags */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                              +{doc.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer Info */}
          {results.length > 0 && (
            <div className="pt-3 border-t text-xs text-muted-foreground text-center">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
