import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  escalations as dummyEscalations,
  agents as dummyAgents,
} from "./data/supervisordummydata";

export const TicketManagement = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Open");
  const [tickets, setTickets] = useState(dummyEscalations);
  const [agents] = useState(dummyAgents.map((a) => a.name));
  const [showModal, setShowModal] = useState(null); // 'details' | 'reassign' | 'resolve'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const openModal = (type, ticket = null) => {
    setSelectedTicket(ticket);
    setShowModal(type);
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedTicket(null);
    setSelectedAgent("");
  };

  // Reassign Ticket
  const handleReassign = () => {
    if (!selectedAgent) {
      alert("Please select an agent before confirming reassign.");
      return;
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, agent: selectedAgent } : t
      )
    );

    setToast({
      type: "success",
      message: `Ticket #${selectedTicket.id} reassigned to ${selectedAgent}`,
    });

    closeModal();
  };

  // Resolve Ticket
  const handleResolve = () => {
    setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));

    setToast({
      type: "success",
      message: `Ticket #${selectedTicket.id} resolved successfully`,
    });

    closeModal();
  };

  const filteredTickets = tickets.filter((t) => {
    if (searchQuery.trim() === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      t.customer.toLowerCase().includes(query) ||
      t.id.toString().includes(query)
    );
  });

  const getFilteredAgentsForDropdown = () => {
    if (!selectedTicket) return agents;
    return agents.filter((a) => a !== selectedTicket.agent);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 🌤️ Matching Background (same as SupervisorDashboard & TeamManagement) */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* 🔔 Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* ---------- Page Header ---------- */}
        <div className="relative bg-white/70 backdrop-blur-md border border-indigo-200 rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              Ticket Management
            </h1>
            <p className="text-gray-600 text-base mt-2 font-medium">
              Review and take action on tickets requiring supervisor attention.
            </p>
          </div>
        </div>

        {/* ---------- Search + Filters ---------- */}
        <Card className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-md rounded-xl hover:shadow-lg transition-all duration-300">
          <CardContent className="flex flex-wrap justify-between items-center gap-4 p-6">
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search by customer or ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-lg p-2 w-72 bg-white shadow-sm focus:ring-2 focus:ring-indigo-400"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                Search
              </Button>

              <Button
                className="bg-gradient-to-r from-gray-100 via-white to-gray-200 text-gray-800 font-semibold border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-300"
                onClick={() => navigate("/supervisor/supervisor_customers")}
              >
                View All Customers
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant={filter === "Open" ? "default" : "outline"}
                className={`rounded-full px-6 ${
                  filter === "Open"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setFilter("Open")}
              >
                Open
              </Button>
              <Button
                variant={filter === "24h" ? "default" : "outline"}
                className={`rounded-full px-6 ${
                  filter === "24h"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setFilter("24h")}
              >
                24h
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Ticket Table ---------- */}
        <Card className="shadow-lg border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Tickets Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm uppercase tracking-wide">
                      <th className="p-4 rounded-tl-xl">Ticket #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Assigned Agent</th>
                      <th className="p-4 text-center rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b last:border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                      >
                        <td className="p-4 font-medium text-gray-800">#{ticket.id}</td>
                        <td className="p-4 text-gray-700">{ticket.customer}</td>
                        <td className="p-4 text-gray-700">{ticket.reason}</td>
                        <td
                          className={`p-4 font-medium ${
                            ticket.agent.includes("Supervisor")
                              ? "text-orange-600"
                              : "text-gray-800"
                          }`}
                        >
                          {ticket.agent}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                              onClick={() => openModal("details", ticket)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="bg-sky-500 hover:bg-sky-600 text-white"
                              onClick={() => openModal("reassign", ticket)}
                            >
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => openModal("resolve", ticket)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No tickets found for your search.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ---------- MODALS ---------- */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-indigo-100 backdrop-blur-md">
              {showModal === "details" && (
                <>
                  <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
                    Ticket Details #{selectedTicket.id}
                  </h2>
                  <div className="text-left text-gray-700 space-y-2 mb-6">
                    <p><strong>Customer:</strong> {selectedTicket.customer}</p>
                    <p><strong>Reason:</strong> {selectedTicket.reason}</p>
                    <p><strong>Assigned Agent:</strong> {selectedTicket.agent}</p>
                    <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Active</span></p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}

              {showModal === "reassign" && (
                <>
                  <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
                    Reassign Ticket #{selectedTicket.id}
                  </h2>
                  <select
                    className="border rounded-lg w-full p-2 mb-6 focus:ring-2 focus:ring-indigo-400"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                  >
                    <option value="">Select new agent</option>
                    {getFilteredAgentsForDropdown().map((agent) => (
                      <option key={agent} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-3">
                    <Button
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-sky-500 hover:bg-sky-600 text-white"
                      onClick={handleReassign}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              )}

              {showModal === "resolve" && (
                <>
                  <h2 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">
                    Resolve Ticket #{selectedTicket.id}?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to mark this ticket as resolved?
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleResolve}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

