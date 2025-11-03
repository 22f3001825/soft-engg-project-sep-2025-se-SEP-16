import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Upload, FileText, MessageSquare, Send, X } from 'lucide-react';
import { orders } from '../../data/dummyData';
import { toast } from 'sonner';

export const NewTicketPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    orderId: '',
    description: '',
  });
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate ticket creation
    const newTicketId = `TKT-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    toast.success(`Ticket ${newTicketId} created successfully!`);

    setTimeout(() => {
      navigate('/customer/tickets');
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border border-gray-200 shadow-lg backdrop-blur-sm p-6 rounded-xl overflow-hidden mx-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/customer/tickets')}
              className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group p-2"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submit a Support Request</h1>
              <p className="text-gray-600">Please provide details about your issue, and our team will respond promptly</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-6 max-w-4xl">
        <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="subject" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="orderId" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Related Order (Optional)
                </Label>
                <Select
                  value={formData.orderId}
                  onValueChange={(value) => setFormData({ ...formData, orderId: value })}
                >
                  <SelectTrigger id="orderId" className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No related order</SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} - {order.items[0]} ({order.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="description" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  required
                  className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm resize-none"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Attachments (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".png,.jpg,.jpeg,.pdf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-gray-400 group-hover:text-blue-500 transition-colors duration-300 mb-4" />
                    <p className="text-base text-gray-600 group-hover:text-blue-700 transition-colors duration-300 mb-2 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Attached files:</p>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                >
                  <Send className="mr-3 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Create Ticket</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/customer/tickets')}
                  className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <ChatBot />
    </div>
  );
};
