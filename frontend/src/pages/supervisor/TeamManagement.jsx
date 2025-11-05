import React, { useState, useEffect } from "react";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { agents as dummyAgents } from "./data/supervisordummydata";

export const TeamManagement = () => {
  const [agents, setAgents] = useState(dummyAgents);

  // Filters & Search
  const [filter, setFilter] = useState("All Agents");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isUnblockAction, setIsUnblockAction] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter logic
  const getFilteredAgents = () => {
    let filtered = [...agents];
    if (filter === "Ratings above 4.5") filtered = filtered.filter((a) => a.rating > 4.5);
    else if (filter === "Ratings above 4") filtered = filtered.filter((a) => a.rating > 4);
    else if (filter === "Ratings above 3") filtered = filtered.filter((a) => a.rating > 3);
    else if (filter === "Ratings below 3") filtered = filtered.filter((a) => a.rating < 3);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.name.toLowerCase().includes(q) || a.status.toLowerCase().includes(q)
      );
    }
    return filtered;
  };
  const filteredAgents = getFilteredAgents();

  // Modal logic
  const handleViewDetails = (a) => {
    setSelectedAgent(a);
    setShowDetailsModal(true);
  };
  const handleBlockClick = (a) => {
    setSelectedAgent(a);
    setIsUnblockAction(a.status === "Blocked");
    setShowBlockModal(true);
  };
  const handleConfirmBlock = () => {
    setAgents((prev) =>
      prev.map((x) =>
        x.name === selectedAgent.name
          ? { ...x, status: isUnblockAction ? "Online" : "Blocked" }
          : x
      )
    );
    setToast({
      type: isUnblockAction ? "success" : "error",
      message: isUnblockAction
        ? `${selectedAgent.name} has been unblocked.`
        : `${selectedAgent.name} has been blocked.`,
    });
    setShowBlockModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* ✨ Animated Background (same as Supervisor Dashboard) */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* 🔔 Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* ---------- Header Section ---------- */}
        <div className="relative bg-white/70 backdrop-blur-md border border-indigo-200 rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              Team Management
            </h1>
            <p className="text-gray-600 text-base mt-2 font-medium">
              Monitor and manage your agents’ performance and assignments.
            </p>
          </div>
        </div>

        {/* ---------- Filters ---------- */}
        <Card className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-md rounded-xl hover:shadow-lg transition-all duration-300">
          <CardContent className="flex flex-wrap justify-between items-center gap-4 p-6">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg p-2 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm text-gray-700 focus:ring-2 focus:ring-indigo-400"
              >
                <option>All Agents</option>
                <option>Ratings above 4.5</option>
                <option>Ratings above 4</option>
                <option>Ratings above 3</option>
                <option>Ratings below 3</option>
              </select>

              <input
                type="text"
                placeholder="Search by agent or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-lg p-2 w-64 bg-white shadow-sm focus:ring-2 focus:ring-indigo-400"
              />

              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all">
                Search
              </Button>
            </div>

            <div className="flex gap-3">
              <Button className="bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 hover:from-blue-200 hover:to-indigo-200 transition-all">
                Bulk Reassign
              </Button>
              <Button className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 hover:from-yellow-200 hover:to-amber-200 transition-all">
                Notify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ---------- Agents Table ---------- */}
        <Card className="shadow-lg border-0 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Agent Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAgents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm uppercase tracking-wide">
                      <th className="p-3 rounded-tl-xl">Agent</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned</th>
                      <th className="p-3">Solved</th>
                      <th className="p-3">Avg Resolution</th>
                      <th className="p-3">Ratings</th>
                      <th className="p-3 rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent, index) => (
                      <tr
                        key={index}
                        className={`border-b last:border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          agent.status === "Blocked" ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="p-3 font-medium text-gray-800 flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shadow-sm">
                            {agent.name.charAt(0)}
                          </div>
                          {agent.name}
                        </td>
                        <td
                          className={`p-3 font-semibold ${
                            agent.status === "Online"
                              ? "text-green-600"
                              : agent.status === "Busy"
                              ? "text-orange-600"
                              : "text-gray-600"
                          }`}
                        >
                          {agent.status}
                        </td>
                        <td className="p-3">{agent.tickets.length}</td>
                        <td className="p-3">{agent.solved}</td>
                        <td className="p-3">{agent.avgTime}</td>
                        <td className="p-3 font-medium text-yellow-600">
                          ⭐ {agent.rating.toFixed(1)}
                        </td>
                        <td className="p-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white"
                            onClick={() => handleViewDetails(agent)}
                          >
                            View Details
                          </Button>
                          {agent.status === "Blocked" ? (
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleBlockClick(agent)}
                            >
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleBlockClick(agent)}
                            >
                              Block
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No agents found.</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ---------- View Details Modal ---------- */}
      {showDetailsModal && selectedAgent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">
              Agent Details
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Name:</strong> {selectedAgent.name}
              </p>
              <p>
                <strong>Status:</strong> {selectedAgent.status}
              </p>
              <p>
                <strong>Tickets Assigned:</strong> {selectedAgent.tickets.length}
              </p>
              <p>
                <strong>Average Resolution Time:</strong> {selectedAgent.avgTime}
              </p>
              <p>
                <strong>Rating:</strong> ⭐ {selectedAgent.rating.toFixed(1)}
              </p>
              <p>
                <strong>Handling Tickets:</strong> {selectedAgent.tickets.join(", ")}
              </p>
            </div>
            <div className="flex justify-end mt-6">
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
      {showBlockModal && selectedAgent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-100">
            <h2
              className={`text-xl font-bold mb-4 ${
                isUnblockAction ? "text-green-600" : "text-red-600"
              }`}
            >
              {isUnblockAction ? "Unblock Agent" : "Block Agent"}
            </h2>
            <p className="text-gray-600 mb-4">
              {isUnblockAction
                ? `Are you sure you want to unblock ${selectedAgent.name}? They will regain access to tickets.`
                : `Are you sure you want to block ${selectedAgent.name}? They will no longer handle tickets.`}
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
