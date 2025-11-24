import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";

const SprintBurndownChart = ({ sprintId }) => {
  const [burndownData, setBurndownData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBurndownData = async () => {
      try {
        setLoading(true);
        const accessToken = getToken("accessToken");
        if (!accessToken) return;

        const response = await axios.get(
          `${BASE_API_URL}/sprints/${sprintId}/burndown/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Format data for Recharts
        const formattedData = response.data.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          ideal: Math.round(item.ideal_remaining),
          actual: item.actual_remaining,
          completed: item.completed,
        }));

        setBurndownData(formattedData);
      } catch (error) {
        console.error("Error fetching burndown data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sprintId) {
      fetchBurndownData();
    }
  }, [sprintId]);

  if (loading) {
    return (
      <Paper className="p-6">
        <Typography>Loading burndown chart...</Typography>
      </Paper>
    );
  }

  if (burndownData.length === 0) {
    return (
      <Paper className="p-6">
        <Typography>No burndown data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper className="p-6">
      <Typography variant="h6" className="mb-4">
        Sprint Burndown Chart
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={burndownData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#22c55e"
            strokeWidth={3}
            name="Ideal Remaining"
            dot={{ r: 5, fill: "#22c55e" }}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#8b5cf6"
            strokeWidth={3}
            name="Actual Remaining"
            dot={{ r: 5, fill: "#8b5cf6" }}
          />
        </LineChart>
      </ResponsiveContainer>
      <Box className="mt-4 text-sm text-gray-600">
        <Typography variant="body2">
          This chart shows the ideal vs actual remaining tasks throughout the
          sprint.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SprintBurndownChart;

