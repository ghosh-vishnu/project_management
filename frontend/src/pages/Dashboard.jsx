import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_API_URL from "../data";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getToken } from "../Token";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const [kanbanData, setKanbanData] = useState({
    project_status: {},
    project_due_date: { on_time: 0, due: 0, over_due: 0, due_projects: [] },
    workload: { healthy: 85, underutilised: 13, overutilised: 2 },
    project_managers: [],
    financial: {
      total_projects: { actual: 0, planned: 0 },
      total_revenue: { actual: 0, planned: 0 },
      total_cost: { actual: 0, planned: 0 },
      total_margin: { actual: 0, planned: 0 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [projectsList, setProjectsList] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredChart, setHoveredChart] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);

  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        setLoading(true);
        const accessToken = getToken("accessToken");
        if (!accessToken) {
          console.error("No access token found. Please login again.");
          return;
        }
        
        const headers = { Authorization: `Bearer ${accessToken}` };
        const [kanbanResponse, projectsResponse] = await Promise.all([
          axios.get(`${BASE_API_URL}/peoples/dashboard/kanban-data/`, { headers }),
          axios.get(`${BASE_API_URL}/project/`, { 
            headers,
            params: { page_size: 100 }
          }).catch(() => ({ data: { results: [] } }))
        ]);
        
        if (kanbanResponse.data) {
          setKanbanData(kanbanResponse.data);
        }
        
        if (projectsResponse.data?.results) {
          setProjectsList(projectsResponse.data.results);
        }
      } catch (error) {
        console.error("Error fetching Kanban data:", error);
        if (error.response?.status === 401) {
          console.error("Authentication failed. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanData();
    
    // Auto-refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchKanbanData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate percentages for KPI cards
  const calculatePercentage = (actual, planned) => {
    if (planned === 0) return 0;
    return Math.round((actual / planned) * 100);
  };

  // Format currency in INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare data for charts with colors
  const projectStatusData = [
    { name: 'In Progress', value: kanbanData.project_status?.in_progress || 0, color: '#3b82f6' }, // Blue
    { name: 'Completed', value: kanbanData.project_status?.completed || 0, color: '#10b981' }, // Green
    { name: 'Planned', value: kanbanData.project_status?.planning || 0, color: '#8b5cf6' }, // Purple
    { name: 'On Hold', value: kanbanData.project_status?.paused || 0, color: '#f59e0b' }, // Orange/Amber
    { name: 'Cancelled', value: kanbanData.project_status?.cancelled || 0, color: '#ef4444' }, // Red
  ];

  const dueDateData = [
    { name: 'On time', value: kanbanData.project_due_date?.on_time || 0 },
    { name: 'Due', value: kanbanData.project_due_date?.due || 0 },
    { name: 'Over Due', value: kanbanData.project_due_date?.over_due || 0 },
  ];

  const workloadData = [
    { name: 'Healthy', value: kanbanData.workload?.healthy || 85 },
    { name: 'Underutilised', value: kanbanData.workload?.underutilised || 13 },
    { name: 'Overutilised', value: kanbanData.workload?.overutilised || 2 },
  ];

  const COLORS = {
    dueDate: ['#10b981', '#3b82f6', '#f97316'], // Green, Blue, Orange
    workload: ['#10b981', '#3b82f6', '#f97316'], // Green, Blue, Orange
    managers: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'], // Blue, Green, Purple, Orange, Red
  };

  const financial = kanbanData.financial || {};

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Management Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg cursor-pointer relative"
          onClick={() => navigate('/projects')}
          onMouseEnter={() => setHoveredCard('projects')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 className="text-sm font-medium mb-4">Total Project</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-3xl font-bold">{financial.total_projects?.actual || 0}</p>
              <p className="text-sm opacity-90">Planned: {financial.total_projects?.planned || 0}</p>
            </div>
          </div>
          
          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredCard === 'projects' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                style={{ top: '100%' }}
              >
                <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Project Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="font-semibold">{kanbanData.project_status?.in_progress || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-semibold">{kanbanData.project_status?.completed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planning:</span>
                    <span className="font-semibold">{kanbanData.project_status?.planning || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On Hold:</span>
                    <span className="font-semibold">{kanbanData.project_status?.paused || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled:</span>
                    <span className="font-semibold">{kanbanData.project_status?.cancelled || 0}</span>
                  </div>
                  {projectsList.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-600">
                      <div className="font-semibold mb-2 text-xs">Recent Projects:</div>
                      <div className="space-y-1">
                        {projectsList.slice(0, 3).map((p, idx) => (
                          <div key={idx} className="truncate text-xs">• {p.title}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-green-300 font-medium">Click to view all projects →</div>
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{calculatePercentage(financial.total_projects?.actual || 0, financial.total_projects?.planned || 1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculatePercentage(financial.total_projects?.actual || 0, financial.total_projects?.planned || 1)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-white rounded-full h-2"
              />
            </div>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg cursor-pointer relative"
          onClick={() => navigate('/invoices')}
          onMouseEnter={() => setHoveredCard('revenue')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 className="text-sm font-medium mb-4">Total Revenue</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(financial.total_revenue?.actual || 0)}</p>
              <p className="text-sm opacity-90">Planned: {formatCurrency(financial.total_revenue?.planned || 0)}</p>
            </div>
          </div>
          
          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredCard === 'revenue' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                style={{ top: '100%' }}
              >
                <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Revenue Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Actual:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_revenue?.actual || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planned:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_revenue?.planned || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difference:</span>
                    <span className="font-semibold">{formatCurrency((financial.total_revenue?.planned || 0) - (financial.total_revenue?.actual || 0))}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-semibold">{calculatePercentage(financial.total_revenue?.actual || 0, financial.total_revenue?.planned || 1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-blue-300 font-medium">Click to view invoices →</div>
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{calculatePercentage(financial.total_revenue?.actual || 0, financial.total_revenue?.planned || 1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculatePercentage(financial.total_revenue?.actual || 0, financial.total_revenue?.planned || 1)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="bg-white rounded-full h-2"
              />
            </div>
          </div>
        </motion.div>

        {/* Total Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg p-6 text-white shadow-lg cursor-pointer relative"
          onClick={() => navigate('/expenses')}
          onMouseEnter={() => setHoveredCard('cost')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 className="text-sm font-medium mb-4">Total Cost</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(financial.total_cost?.actual || 0)}</p>
              <p className="text-sm opacity-90">Planned: {formatCurrency(financial.total_cost?.planned || 0)}</p>
            </div>
          </div>
          
          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredCard === 'cost' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                style={{ top: '100%' }}
              >
                <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Cost Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Actual:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_cost?.actual || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planned:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_cost?.planned || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difference:</span>
                    <span className="font-semibold">{formatCurrency((financial.total_cost?.planned || 0) - (financial.total_cost?.actual || 0))}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-semibold">{calculatePercentage(financial.total_cost?.actual || 0, financial.total_cost?.planned || 1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-orange-300 font-medium">Click to view expenses →</div>
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{calculatePercentage(financial.total_cost?.actual || 0, financial.total_cost?.planned || 1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculatePercentage(financial.total_cost?.actual || 0, financial.total_cost?.planned || 1)}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="bg-white rounded-full h-2"
              />
            </div>
          </div>
        </motion.div>

        {/* Total Margin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg cursor-pointer relative"
          onClick={() => navigate('/invoices')}
          onMouseEnter={() => setHoveredCard('margin')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 className="text-sm font-medium mb-4">Total Margin</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(financial.total_margin?.actual || 0)}</p>
              <p className="text-sm opacity-90">Planned: {formatCurrency(financial.total_margin?.planned || 0)}</p>
            </div>
          </div>
          
          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredCard === 'margin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                style={{ top: '100%' }}
              >
                <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Margin Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Actual:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_margin?.actual || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planned:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_margin?.planned || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_revenue?.actual || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-semibold">{formatCurrency(financial.total_cost?.actual || 0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="flex justify-between">
                      <span>Margin %:</span>
                      <span className="font-semibold">{financial.total_revenue?.actual > 0 ? Math.round((financial.total_margin?.actual / financial.total_revenue?.actual) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-purple-300 font-medium">Click to view financial details →</div>
                {/* Arrow */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{calculatePercentage(financial.total_margin?.actual || 0, financial.total_margin?.planned || 1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculatePercentage(financial.total_margin?.actual || 0, financial.total_margin?.planned || 1)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white rounded-full h-2"
              />
            </div>
          </div>
        </motion.div>
        </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project by Status - Vertical Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer relative"
          onClick={() => navigate('/projects')}
          onMouseEnter={() => setHoveredChart('projectStatus')}
          onMouseLeave={() => {
            setHoveredChart(null);
            setSelectedBar(null);
          }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project by Status</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 8, 8, 0]}
                    onClick={(data, index, e) => {
                      if (e) {
                        e.stopPropagation(); // Prevent chart container click
                      }
                      if (data && data.name) {
                        const barData = projectStatusData.find(item => item.name === data.name);
                        if (barData) {
                          setSelectedBar({
                            name: barData.name,
                            value: barData.value,
                            color: barData.color
                          });
                        }
                      }
                    }}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Hover Tooltip - Chart Overview */}
              <AnimatePresence>
                {hoveredChart === 'projectStatus' && !selectedBar && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                    style={{ top: '100%' }}
                  >
                    <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Status Breakdown</h4>
                    <div className="space-y-1.5 text-xs">
                      {projectStatusData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}:</span>
                          </div>
                          <span className="font-semibold">{item.value} projects</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-blue-300 font-medium">
                      Click chart to view all projects →
              </div>
                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
            </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar Details Tooltip - When bar is clicked */}
              <AnimatePresence>
                {selectedBar && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Bar Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: selectedBar.color || '#3b82f6' }}
                        />
                        <span className="font-semibold text-sm">{selectedBar.name}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Total Projects:</span>
                          <span className="font-semibold">{selectedBar.value} projects</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-semibold">{selectedBar.name}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <div className="text-xs text-gray-400">
                            Click on chart area to view all projects
                          </div>
                        </div>
              </div>
            </div>
                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* Project by Due Date - Donut Chart */}
                <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project by Due Date</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dueDateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dueDateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.dueDate[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 pl-6">
                <div className="space-y-3">
                  {dueDateData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS.dueDate[index] }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-800 ml-auto">{item.value}</span>
              </div>
                  ))}
            </div>
                {kanbanData.project_due_date?.due_projects && kanbanData.project_due_date.due_projects.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Due</h4>
                    <div className="space-y-1">
                      {kanbanData.project_due_date.due_projects.slice(0, 6).map((project, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {project.name}
              </div>
                      ))}
            </div>
              </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Workload - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer relative"
          onClick={() => navigate('/employee')}
          onMouseEnter={() => setHoveredChart('workload')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Workload</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={workloadData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {workloadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.workload[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 pl-6">
                <div className="space-y-3">
                  {workloadData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS.workload[index] }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-800 ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Project by Project Manager - Horizontal Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer relative"
          onClick={() => navigate('/projects')}
          onMouseEnter={() => setHoveredChart('managers')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project by Project Manager</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : kanbanData.project_managers && kanbanData.project_managers.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kanbanData.project_managers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {kanbanData.project_managers.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS.managers[index % COLORS.managers.length]}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Hover Tooltip */}
              <AnimatePresence>
                {hoveredChart === 'managers' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                    style={{ top: '100%' }}
                  >
                    <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Top Project Managers</h4>
                    <div className="space-y-1.5 text-xs">
                      {kanbanData.project_managers.slice(0, 5).map((manager, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS.managers[idx % COLORS.managers.length] }}
                            />
                            <span>{manager.name}:</span>
                          </div>
                          <span className="font-semibold">{manager.count} projects</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-blue-300 font-medium">
                      Click chart to view all projects →
                    </div>
                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No project manager data available
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
