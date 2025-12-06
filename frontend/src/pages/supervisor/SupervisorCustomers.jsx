import React, { useState, useEffect } from "react";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import supervisorApi from "../../services/supervisorApi";
import { toast } from "sonner";

export const SupervisorCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Customers");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isUnblockAction, setIsUnblockAction] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await supervisorApi.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCustomers = () => {
    let filtered = [...customers];
    if (filter === "Active Customers") filtered = filtered.filter((c) => c.status === "Active");
    else if (filter === "Blocked Customers") filtered = filtered.filter((c) => c.status === "Blocked");

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.status.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleBlockClick = (customer) => {
    setSelectedCustomer(customer);
    setIsUnblockAction(customer.status === "Blocked");
    setShowBlockModal(true);
  };

  const handleConfirmBlock = async () => {
    try {
      // isUnblockAction is true when customer is blocked and we want to unblock them
      const newActiveStatus = isUnblockAction; // true = unblock, false = block
      await supervisorApi.updateCustomerStatus(selectedCustomer.id, newActiveStatus);
      
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, is_active: newActiveStatus, status: newActiveStatus ? "Active" : "Blocked" }
            : c
        )
      );

      setNotification({
        type: isUnblockAction ? "success" : "error",
        message: isUnblockAction
          ? `${selectedCustomer.name} has been unblocked successfully.`
          : `${selectedCustomer.name} has been blocked successfully.`,
      });
    } catch (error) {
      console.error('Failed to update customer status:', error);
      setNotification({
        type: "error",
        message: "Failed to update customer status",
      });
    }

    setShowBlockModal(false);
  };

  return (
    <div className="min-h-screen relative" style={{backgroundColor: '#F4F9E9'}}>
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>
      <Header />

      {/* ✅ Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in
            ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
        >
          {notification.message}
        </div>
      )}

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ---------- Page Header ---------- */}
        <div className="relative bg-white/70 backdrop-blur-md border border-indigo-200 rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              Customer Overview
            </h1>
            <p className="text-gray-600 text-base mt-2 font-medium">
              Manage and monitor customer activity, orders, and support tickets.
            </p>
          </div>
        </div>

        {/* ---------- Filters & Search ---------- */}
        <Card className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-md rounded-xl hover:shadow-lg transition-all duration-300">
          <CardContent className="flex flex-wrap justify-between items-center gap-4 p-6">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg p-2 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm text-gray-700"
              >
                <option>All Customers</option>
                <option>Active Customers</option>
                <option>Blocked Customers</option>
              </select>

              <input
                type="text"
                placeholder="Search by name or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-lg p-2 w-64 bg-white shadow-sm focus:ring-2 focus:ring-indigo-400"
              />

              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Customer Table ---------- */}
        <Card className="shadow-lg border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Customer Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm uppercase tracking-wide">
                      <th className="p-4 rounded-tl-xl">Customer Name</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Total Orders</th>
                      <th className="p-4">Total Tickets</th>
                      <th className="p-4">Active Tickets</th>
                      <th className="p-4 text-center rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer, index) => (
                      <tr
                        key={index}
                        className={`border-b last:border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          customer.status === "Blocked" ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="p-4 font-medium text-gray-800">{customer.name}</td>
                        <td
                          className={`p-4 font-semibold ${
                            customer.status === "Active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {customer.status}
                        </td>
                        <td className="p-4">{customer.total_orders}</td>
                        <td className="p-4">{customer.total_tickets}</td>
                        <td className="p-4">{customer.active_tickets}</td>
                        <td className="p-4 text-center">
                          <div className="relative">
                            <Button
                              size="sm"
                              className="bg-indigo-500 hover:bg-indigo-600 text-white"
                              onClick={() => setDropdownOpen(dropdownOpen === customer.id ? null : customer.id)}
                            >
                              Actions ▼
                            </Button>
                            {dropdownOpen === customer.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                  onClick={() => { handleViewDetails(customer); setDropdownOpen(null); }}
                                >
                                  View Details
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                  onClick={() => { handleBlockClick(customer); setDropdownOpen(null); }}
                                >
                                  {customer.status === "Blocked" ? 'Unblock Customer' : 'Block Customer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No customers found.
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ---------- View Details Modal ---------- */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 w-full max-w-lg border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
              Customer Details
            </h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {selectedCustomer.name}</p>
              <p><strong>Status:</strong> {selectedCustomer.status}</p>
              <p><strong>Total Orders:</strong> {selectedCustomer.total_orders}</p>
              <p><strong>Total Tickets:</strong> {selectedCustomer.total_tickets}</p>
              <p><strong>Active Tickets:</strong> {selectedCustomer.active_tickets}</p>
            </div>
            <div className="flex justify-end mt-5">
              <Button
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Block / Unblock Modal ---------- */}
      {showBlockModal && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2
              className={`text-xl font-bold mb-4 ${
                isUnblockAction ? "text-green-600" : "text-red-600"
              }`}
            >
              {isUnblockAction ? "Unblock Customer" : "Block Customer"}
            </h2>
            <p className="text-gray-600 mb-4">
              {isUnblockAction
                ? `Are you sure you want to unblock ${selectedCustomer.name}?`
                : `Are you sure you want to block ${selectedCustomer.name}?`}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${
                  isUnblockAction
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
                onClick={handleConfirmBlock}
              >
                {isUnblockAction ? "Confirm Unblock" : "Confirm Block"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
