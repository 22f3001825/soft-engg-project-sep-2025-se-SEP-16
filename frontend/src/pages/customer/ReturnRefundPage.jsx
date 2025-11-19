import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, ArrowRight, Check, Upload, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../../services/api';

export const ReturnRefundPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedOrderId = searchParams.get('orderId');
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    orderId: preSelectedOrderId || '',
    selectedItems: [],
    reason: '',
    description: '',
    refundMethod: 'original',
    attachments: []
  });
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiService.getOrders();
      setOrdersData(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deliveredOrders = ordersData.filter(o => o.status === 'delivered' || o.status === 'DELIVERED');
  const selectedOrder = ordersData.find(o => o.id === formData.orderId);

  const refundReasons = [
    'Product is defective or damaged',
    'Product does not match description',
    'Received wrong item',
    'Product quality is poor',
    'Changed my mind',
    'Found a better price elsewhere',
    'Other'
  ];

  const handleNext = () => {
    if (step === 1 && !formData.orderId) {
      toast.error('Please select an order');
      return;
    }
    if (step === 2 && formData.selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    if (step === 3 && !formData.reason) {
      toast.error('Please select a reason for return');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      const returnData = {
        order_id: formData.orderId,
        items: formData.selectedItems,
        reason: formData.reason,
        description: formData.description
      };
      
      const response = await apiService.requestReturn(returnData);
      
      // Upload attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        try {
          await apiService.uploadAttachment(response.ticket_id, formData.attachments);
          toast.success(`Refund request submitted with ${formData.attachments.length} attachment(s)! Ticket ${response.ticket_id} created.`);
        } catch (uploadError) {
          console.error('Failed to upload attachments:', uploadError);
          toast.success(`Refund request submitted! Ticket ${response.ticket_id} created. (Attachments failed to upload)`);
        }
      } else {
        toast.success(`Refund request submitted successfully! Ticket ${response.ticket_id} created.`);
      }
      
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit return request:', error);
      toast.error('Failed to submit return request. Please try again.');
    }
  };

  const calculateRefund = () => {
    if (!selectedOrder) return 0;
    const itemPrice = selectedOrder.total / selectedOrder.items.length;
    return (itemPrice * formData.selectedItems.length).toFixed(2);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step > stepNum 
                ? 'bg-success text-success-foreground' 
                : step === stepNum 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
            </div>
            <span className="text-xs mt-2 text-center">
              {stepNum === 1 && 'Select Order'}
              {stepNum === 2 && 'Choose Items'}
              {stepNum === 3 && 'Reason'}
              {stepNum === 4 && 'Review'}
            </span>
          </div>
          {stepNum < 4 && (
            <div className={`h-0.5 w-12 md:w-24 mx-2 ${
              step > stepNum ? 'bg-success' : 'bg-muted'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-custom relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customer/orders')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Return & Refund Request</CardTitle>
          </CardHeader>
          <CardContent>
            <StepIndicator />

            {/* Step 1: Select Order */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select the order you want to return</h3>
                <RadioGroup value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                  <div className="space-y-3">
                    {deliveredOrders.map((order) => (
                      <div key={order.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary btn-transition cursor-pointer">
                        <RadioGroupItem value={order.id} id={order.id} />
                        <Label htmlFor={order.id} className="flex-1 cursor-pointer">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <p className="font-semibold">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {(order.items || []).map(item => 
                                  typeof item === 'string' ? item : item.product_name
                                ).join(', ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Select Items */}
            {step === 2 && selectedOrder && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select items to return</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, idx) => {
                    const itemName = typeof item === 'string' ? item : item.product_name;
                    const itemPrice = typeof item === 'string' 
                      ? (selectedOrder.total / selectedOrder.items.length).toFixed(2)
                      : item.price;
                    
                    return (
                      <div key={idx} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <Checkbox
                          id={`item-${idx}`}
                          checked={formData.selectedItems.includes(itemName)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                selectedItems: [...formData.selectedItems, itemName]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedItems: formData.selectedItems.filter(i => i !== itemName)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`item-${idx}`} className="flex-1 cursor-pointer">
                          <p className="font-medium">{itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            ${itemPrice}
                          </p>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Reason & Photos */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Reason for return</h3>
                  <RadioGroup value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                    <div className="space-y-2">
                      {refundReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary btn-transition">
                          <RadioGroupItem value={reason} id={`reason-${idx}`} />
                          <Label htmlFor={`reason-${idx}`} className="flex-1 cursor-pointer">
                            {reason}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional details (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide any additional information..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload photos of damage (Optional)</Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-secondary btn-transition cursor-pointer"
                    onClick={() => document.getElementById('refund-file-input').click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    id="refund-file-input"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        toast.success(`${files.length} file(s) selected for upload`);
                        setFormData({ ...formData, attachments: files });
                      }
                    }}
                  />
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Selected files:</p>
                      <div className="space-y-1">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="text-xs bg-secondary p-2 rounded flex justify-between items-center">
                            <span>{file.name}</span>
                            <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)}KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && selectedOrder && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review your refund request</h3>
                
                <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-semibold">{formData.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items to return:</span>
                      <span className="font-semibold">{formData.selectedItems.length}</span>
                    </div>
                    <div className="border-t pt-4">
                      <ul className="space-y-2 mb-4">
                        {formData.selectedItems.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium text-right max-w-[60%]">{formData.reason}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-semibold flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-success" />
                          Estimated Refund:
                        </span>
                        <span className="text-2xl font-bold text-success">${calculateRefund()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-info-light p-4 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> Your refund request will be reviewed by our team within 2-3 business days. 
                    You will receive a prepaid shipping label via email once approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : navigate('/customer/orders')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {step === 1 ? 'Cancel' : 'Previous'}
              </Button>
              
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Submit Request
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <ChatBot />
    </div>
  );
};
