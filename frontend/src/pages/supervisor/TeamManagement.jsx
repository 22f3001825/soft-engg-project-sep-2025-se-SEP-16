import React, { useState } from "react";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronDown } from "lucide-react";
import { agents as dummyAgents } from "./data/supervisordummydata"; 

export const TeamManagement = () => {
  // 🔹 Using imported dummy data
  const [agents, setAgents] = useState(dummyAgents);

  // 🔹 Dropdown and Search States
  const [filter, setFilter] = useState("All Agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  // 🔹 Modal States
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [reassignTo, setReassignTo] = useState("");
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveTicket, setResolveTicket] = useState("");

  // 🔹 Filter logic
  const getFilteredAgents = () => {
    let filtered = [...agents];
    if (filter === "Ratings above 4.5") filtered = filtered.filter((a) => a.rating > 4.5);
    else if (filter === "Ratings above 4") filtered = filtered.filter((a) => a.rating > 4);
    else if (filter === "Ratings above 3") filtered = filtered.filter((a) => a.rating > 3);
    else if (filter === "Ratings below 3") filtered = filtered.filter((a) => a.rating < 3);

    if (searchTriggered && searchQuery.trim()) {
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredAgents = getFilteredAgents();

  // 🔹 Reassign & Resolve Handlers
  const handleReassignClick = (agent) => {
    setSelectedAgent(agent);
    setSelectedTicket("");
    setReassignTo("");
    setShowReassignModal(true);
  };

  const handleResolveClick = (agent) => {
    setSelectedAgent(agent);
    setResolveTicket("");
    setShowResolveModal(true);
  };

  const handleConfirmReassign = () => {
    if (!selectedTicket || !reassignTo) {
      alert("Please select both a ticket and an agent to reassign.");
      return;
    }

    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.name === selectedAgent.name) {
          return {
            ...agent,
            tickets: agent.tickets.filter((t) => t !== parseInt(selectedTicket)),
          };
        }
        if (agent.name === reassignTo) {
          return {
            ...agent,
            tickets: [...agent.tickets, parseInt(selectedTicket)],
          };
        }
        return agent;
      })
    );

    setShowReassignModal(false);
    // alert(`Ticket #${selectedTicket} reassigned from ${selectedAgent.name} to ${reassignTo}.`);
  };

  const handleConfirmResolve = () => {
    if (!resolveTicket) {
      alert("Please select a ticket to resolve.");
      return;
    }

    setAgents((prev) =>
      prev.map((agent) =>
        agent.name === selectedAgent.name
          ? { ...agent, tickets: agent.tickets.filter((t) => t !== parseInt(resolveTicket)) }
          : agent
      )
    );

    setShowResolveModal(false);
    // alert(`Ticket #${resolveTicket} resolved for ${selectedAgent.name}.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-gray-600">Monitor and manage your team’s activity and assignments.</p>
        </div>

        {/* 🔹 Filter + Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg p-2 bg-white shadow-sm"
            >
              <option>All Agents</option>
              <option>Ratings above 4.5</option>
              <option>Ratings above 4</option>
              <option>Ratings above 3</option>
              <option>Ratings below 3</option>
            </select>

            <input
              type="text"
              placeholder="Search agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg p-2 w-64"
            />
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setSearchTriggered(true)}
            >
              Search
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              Bulk Reassign
            </Button>
            <Button variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
              Notify
            </Button>
            <Button variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
              Auto-assign
            </Button>
          </div>
        </div>

        {/* 🔹 Team Table */}
        <Card className="overflow-x-auto rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Agent Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAgents.length > 0 ? (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-3 rounded-tl-xl">Agent</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned</th>
                    <th className="p-3">Performance</th>
                    <th className="p-3 rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50 transition">
                      <td className="p-3 font-medium">{agent.name}</td>
                      <td className="p-3">{agent.status}</td>
                      <td className="p-3">{agent.tickets.length}</td>
                      <td className="p-3">
                        Rating: {agent.rating} <br /> CSAT: {agent.csat}
                      </td>
                      <td className="p-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-sky-500 hover:bg-sky-600 text-white"
                          onClick={() => handleReassignClick(agent)}
                        >
                          Reassign
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleResolveClick(agent)}
                        >
                          Resolve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-4">No agents found.</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 🔹 Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reassign Ticket</h2>
            <p className="text-gray-600 mb-3">
              Reassign ticket from <strong>{selectedAgent.name}</strong>:
            </p>

            <label className="block mb-2 text-sm font-medium">Select Ticket</label>
            <select
              value={selectedTicket}
              onChange={(e) => setSelectedTicket(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            >
              <option value="">Select Ticket</option>
              {selectedAgent.tickets.map((ticketId) => (
                <option key={ticketId} value={ticketId}>
                  Ticket #{ticketId}
                </option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-medium">Reassign To</label>
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            >
              <option value="">Select Agent</option>
              {agents
                .filter((a) => a.name !== selectedAgent.name)
                .map((agent, index) => (
                  <option key={index} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowReassignModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-sky-500 text-white hover:bg-sky-600"
                onClick={handleConfirmReassign}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Resolve Ticket</h2>
            <p className="text-gray-600 mb-3">
              Resolve ticket for <strong>{selectedAgent.name}</strong>:
            </p>

            <label className="block mb-2 text-sm font-medium">Select Ticket</label>
            <select
              value={resolveTicket}
              onChange={(e) => setResolveTicket(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            >
              <option value="">Select Ticket</option>
              {selectedAgent.tickets.map((ticketId) => (
                <option key={ticketId} value={ticketId}>
                  Ticket #{ticketId}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-3">
              <Button
                variant="secondary"
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowResolveModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={handleConfirmResolve}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

