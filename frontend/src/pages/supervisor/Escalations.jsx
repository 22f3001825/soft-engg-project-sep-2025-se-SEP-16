import React, { useState } from "react";
import { Header } from "../../components/common/Supervisor_header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import { escalations as dummyEscalations, agents as dummyAgents } from "./data/supervisordummydata";

export const Escalations = () => {
  const [filter, setFilter] = useState("Open");

  // 🔹 Escalation Data (linked to dummy data)
  const [tickets, setTickets] = useState(dummyEscalations);
  const [agents] = useState(dummyAgents.map((a) => a.name));

  const [showModal, setShowModal] = useState(null); // 'takeover' | 'reassign' | 'resolve'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  // 🔹 Open modal
  const openModal = (type, ticket) => {
    setSelectedTicket(ticket);
    setShowModal(type);
  };

  // 🔹 Close modal
  const closeModal = () => {
    setShowModal(null);
    setSelectedTicket(null);
    setSelectedAgent("");
  };

  // 🔹 Take Over Action (update table)
  const handleTakeOver = () => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, agent: "Supervisor (You)" } : t
      )
    );
    // alert(`✅ Supervisor has taken over Ticket #${selectedTicket.id}`);
    closeModal();
  };

  // 🔹 Reassign Action (update table)
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
    // alert(`Ticket #${selectedTicket.id} reassigned from ${selectedTicket.agent} to ${selectedAgent}`);
    closeModal();
  };

  // 🔹 Resolve Action (remove from table)
  const handleResolve = () => {
    setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));
    // alert(`✅ Ticket #${selectedTicket.id} resolved successfully`);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="animate-slide-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Escalations
          </h1>
          <p className="text-muted-foreground">
            Review and take action on escalated tickets requiring supervisor attention.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-end gap-3 animate-slide-in-up">
          <Button
            variant={filter === "Open" ? "default" : "outline"}
            className={`rounded-full px-6 ${filter === "Open" ? "bg-primary text-white" : ""}`}
            onClick={() => setFilter("Open")}
          >
            Open
          </Button>
          <Button
            variant={filter === "24h" ? "default" : "outline"}
            className={`rounded-full px-6 ${filter === "24h" ? "bg-primary text-white" : ""}`}
            onClick={() => setFilter("24h")}
          >
            24h
          </Button>
        </div>

        {/* Escalations Table */}
        <Card className="animate-slide-in-up shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-semibold px-6 py-4">
              Escalation Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full border-collapse text-left">
            <table className="w-full border-collapse rounded-2xl text-left">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-4">Ticket #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">#{ticket.id}</td>
                    <td className="p-4 text-gray-700">{ticket.customer}</td>
                    <td className="p-4 text-gray-700">{ticket.reason}</td>
                    <td
                      className={`p-4 font-medium ${
                        ticket.agent.includes("Supervisor") ? "text-orange-600" : "text-gray-800"
                      }`}
                    >
                      {ticket.agent}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <Button
                          size="sm"
                          className="bg-orange-400 hover:bg-orange-500 text-white px-4"
                          onClick={() => openModal("takeover", ticket)}
                        >
                          Take Over
                        </Button>
                        <Button
                          size="sm"
                          className="bg-sky-500 hover:bg-sky-600 text-white px-4"
                          onClick={() => openModal("reassign", ticket)}
                        >
                          Reassign
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white px-4"
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
          </CardContent>
        </Card>

        {/* ---------- MODALS ---------- */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] md:w-[400px] text-center animate-fade-in">
              {/* Take Over Modal */}
              {showModal === "takeover" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Take Over Ticket #{selectedTicket.id}?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to take over this ticket from{" "}
                    <span className="font-semibold">{selectedTicket.agent}</span>?
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleTakeOver}>
                      Confirm
                    </Button>
                  </div>
                </>
              )}

              {/* Reassign Modal */}
              {showModal === "reassign" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Reassign Ticket #{selectedTicket.id}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Currently assigned to <span className="font-semibold">{selectedTicket.agent}</span>.
                  </p>
                  <select
                    className="border rounded-lg w-full p-2 mb-6"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                  >
                    <option value="">Select new agent</option>
                    {agents.map((agent) => (
                      <option key={agent} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={handleReassign}>
                      Confirm
                    </Button>
                  </div>
                </>
              )}

              {/* Resolve Modal */}
              {showModal === "resolve" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Resolve Ticket #{selectedTicket.id}?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to mark this ticket as resolved?
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleResolve}>
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


