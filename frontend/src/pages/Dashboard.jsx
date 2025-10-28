import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_API_URL from "../data"; // tumhara API base URL

const Dashboard = () => {
  const [summary, setSummary] = useState({
    employees: 0,
    projects: 0,
    tasks: 0,
    clients: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${BASE_API_URL}/peoples/dashboard-summary/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg">Employees</h3>
          <p className="text-2xl font-bold">{summary.employees}</p>
        </div>

        <div className="bg-green-500 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg">Projects</h3>
          <p className="text-2xl font-bold">{summary.projects}</p>
        </div>

        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg">Tasks</h3>
          <p className="text-2xl font-bold">{summary.tasks}</p>
        </div>

        <div className="bg-red-500 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg">Clients</h3>
          <p className="text-2xl font-bold">{summary.clients}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
