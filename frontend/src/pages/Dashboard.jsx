import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_API_URL from "../data";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from "recharts";
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
  
  // AI Features State
  const [aiInsights, setAiInsights] = useState([]);
  const [revenueForecast, setRevenueForecast] = useState(null);
  const [projectHealthScores, setProjectHealthScores] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [riskScores, setRiskScores] = useState({ project_risks: [], employee_risks: [] });
  const [trendPredictions, setTrendPredictions] = useState(null);
  const [benchmarks, setBenchmarks] = useState({});
  const [nlQuery, setNlQuery] = useState('');
  const [nlResponse, setNlResponse] = useState(null);
  const [showNLQuery, setShowNLQuery] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // Fetch all AI data
  const fetchAIData = async () => {
    try {
      setLoadingAI(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) return;
      
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      // Fetch all AI features in parallel
      const [
        insightsRes,
        forecastRes,
        healthRes,
        anomaliesRes,
        recommendationsRes,
        riskRes,
        trendsRes,
        benchmarkRes
      ] = await Promise.allSettled([
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/insights-comprehensive/`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/revenue-forecast/`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/project-health-scores/`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/anomaly-detection/`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/smart-recommendations/`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/risk-assessment/`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/trend-predictions/?months=6`, { headers }),
        axios.get(`${BASE_API_URL}/peoples/dashboard/ai/performance-benchmark/`, { headers })
      ]);
      
      if (insightsRes.status === 'fulfilled') setAiInsights(insightsRes.value.data.insights || []);
      if (forecastRes.status === 'fulfilled') setRevenueForecast(forecastRes.value.data);
      if (healthRes.status === 'fulfilled') setProjectHealthScores(healthRes.value.data.health_scores || []);
      if (anomaliesRes.status === 'fulfilled') setAnomalies(anomaliesRes.value.data.anomalies || []);
      if (recommendationsRes.status === 'fulfilled') setRecommendations(recommendationsRes.value.data.recommendations || []);
      if (riskRes.status === 'fulfilled') {
        setRiskScores(riskRes.value.data || { project_risks: [], employee_risks: [] });
      }
      if (trendsRes.status === 'fulfilled') setTrendPredictions(trendsRes.value.data);
      if (benchmarkRes.status === 'fulfilled') setBenchmarks(benchmarkRes.value.data);
      
    } catch (error) {
      console.error("Error fetching AI data:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  // Handle natural language query
  const handleNLQuery = async () => {
    if (!nlQuery.trim()) return;
    
    try {
      setLoadingAI(true);
      const accessToken = getToken("accessToken");
      const response = await axios.post(
        `${BASE_API_URL}/peoples/dashboard/ai/natural-language-query/`,
        { query: nlQuery },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNlResponse(response.data);
      setNlQuery('');
    } catch (error) {
      console.error("Error processing NL query:", error);
      setNlResponse({
        message: 'Unable to process query. Please try again.',
        intent: 'error'
      });
    } finally {
      setLoadingAI(false);
    }
  };

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

    // Initial fetch
    fetchKanbanData();
    fetchAIData();
    
    // Auto-refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchKanbanData();
      fetchAIData();
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
    <div className="p-6 bg-gray-100 pb-8" style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
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
                style={{ top: '100%', willChange: 'transform' }}
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
                style={{ top: '100%', willChange: 'transform' }}
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
                style={{ top: '100%', willChange: 'transform' }}
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
                style={{ top: '100%', willChange: 'transform' }}
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
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer relative overflow-visible"
          onClick={() => navigate('/projects')}
          onMouseEnter={() => setHoveredChart('dueDate')}
          onMouseLeave={() => setHoveredChart(null)}
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
              <div className="flex-1 pl-6 overflow-visible">
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
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Due Projects</h4>
                    <div className="space-y-1">
                      {kanbanData.project_due_date.due_projects.slice(0, 6).map((project, idx) => (
                        <div 
                          key={idx} 
                          className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects?id=${project.id}`);
                          }}
                        >
                          • {project.name}
                        </div>
                      ))}
              </div>
            </div>
                )}
              </div>
            </div>
          )}
          
          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredChart === 'dueDate' && (
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-50 pointer-events-none"
                style={{ top: '100%', willChange: 'transform' }}
              >
                <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Due Date Breakdown</h4>
                <div className="space-y-1.5 text-xs">
                  {dueDateData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS.dueDate[idx] }}
                        />
                        <span>{item.name}:</span>
              </div>
                      <span className="font-semibold">{item.value} projects</span>
        </div>
                  ))}
              </div>
                {kanbanData.project_due_date?.due_projects && kanbanData.project_due_date.due_projects.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-600">
                    <div className="font-semibold mb-2 text-xs">Due Projects:</div>
                    <div className="space-y-1">
                      {kanbanData.project_due_date.due_projects.slice(0, 5).map((project, idx) => (
                        <div key={idx} className="text-xs text-gray-300">• {project.name}</div>
                      ))}
            </div>
        </div>
                )}
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
        </motion.div>

        {/* Workload - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer relative"
          style={{ overflow: 'visible' }}
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
          
          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredChart === 'workload' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-[9999] pointer-events-none"
                style={{ bottom: 'calc(100% + 8px)', maxWidth: '90vw' }}
              >
                <h4 className="font-semibold mb-2 text-sm border-b border-gray-600 pb-2">Workload Distribution</h4>
                <div className="space-y-1.5 text-xs">
                  {workloadData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS.workload[idx] }}
                        />
                        <span>{item.name}:</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
                  <div className="mb-1">• Healthy: 5-15 tasks per employee</div>
                  <div className="mb-1">• Underutilised: Less than 5 tasks</div>
                  <div>• Overutilised: More than 15 tasks</div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-blue-300 font-medium">
                  Click chart to view all employees →
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
        </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Project by Project Manager - Horizontal Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer relative"
          style={{ overflow: 'visible' }}
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-72 bg-gray-800 text-white rounded-lg p-4 shadow-xl z-[9999] pointer-events-none"
                    style={{ bottom: 'calc(100% + 8px)', maxWidth: '90vw' }}
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
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
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

        {/* AI-Powered Insights Card */}
        {aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg p-6 shadow-lg text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>AI Insights & Recommendations</span> 
              </h3>
              <button
                onClick={() => fetchAIData()}
                className="text-sm px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                disabled={loadingAI}
              >
                {loadingAI ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {loadingAI && aiInsights.length === 0 ? (
                <div className="text-center py-4 text-white/70">Loading insights...</div>
              ) : aiInsights.length === 0 ? (
                <div className="text-center py-4 text-white/70">No insights available at this time.</div>
              ) : (
                aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg bg-white/10 backdrop-blur-sm border-l-4 ${
                    insight.type === 'error' ? 'border-red-400' :
                    insight.type === 'warning' ? 'border-yellow-400' :
                    'border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-200 mb-1">{insight.category}</div>
                      <div className="font-semibold mb-1">{insight.title}</div>
                      <div className="text-sm text-gray-100">{insight.message}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.priority === 'high' ? 'bg-red-500/50' :
                      insight.priority === 'medium' ? 'bg-yellow-500/50' :
                      'bg-blue-500/50'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Revenue Forecast Chart */}
        {revenueForecast && revenueForecast.forecast && revenueForecast.forecast.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Forecast (Next 3 Months)</h3>
            {loadingAI && !revenueForecast ? (
              <div className="flex items-center justify-center h-[250px] text-gray-500">Loading forecast...</div>
            ) : revenueForecast && revenueForecast.forecast && revenueForecast.forecast.length > 0 ? (
              <>
              <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueForecast.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="predicted_revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              <div>Total Forecast: <span className="font-semibold">{formatCurrency(revenueForecast.total_forecast)}</span></div>
              <div>Growth Rate: <span className="font-semibold">{revenueForecast.growth_rate}%</span></div>
              <div>Avg Confidence: <span className="font-semibold">{revenueForecast.confidence_avg?.toFixed(0)}%</span></div>
            </div>
            </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">No forecast data available</div>
            )}
          </motion.div>
        )}

        {/* Project Health Scores */}
        {projectHealthScores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Health Scores</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {loadingAI && projectHealthScores.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Loading health scores...</div>
              ) : projectHealthScores.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No project health data available</div>
              ) : (
                projectHealthScores.slice(0, 5).map((health, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{health.project_name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {health.factors.length > 0 && `Factors: ${health.factors.join(', ')}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        health.color === 'green' ? 'text-green-600' :
                        health.color === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {health.score}
                      </div>
                      <div className="text-xs text-gray-600">{health.status}</div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      health.color === 'green' ? 'bg-green-500' :
                      health.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Anomaly Detection */}
        {(loadingAI || anomalies.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>Anomaly Detection Alerts</span> 
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {loadingAI && anomalies.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Checking for anomalies...</div>
              ) : anomalies.length === 0 ? (
                <div className="text-center py-4 text-green-600 font-semibold">✓ No anomalies detected</div>
              ) : (
                anomalies.slice(0, 5).map((anomaly, idx) => (
                <div key={idx} className="p-2 bg-red-50 rounded border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-red-800 text-sm">{anomaly.project}</div>
                      <div className="text-xs text-red-600">{anomaly.message}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      anomaly.severity === 'high' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Smart Recommendations */}
        {(loadingAI || recommendations.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>Smart Recommendations</span>
            </h3>
            <div className="space-y-3">
              {loadingAI && recommendations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Generating recommendations...</div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No recommendations at this time</div>
              ) : (
                recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-800 mb-1">{rec.title}</div>
                      <div className="text-sm text-blue-700">{rec.message}</div>
                      {rec.projects && rec.projects.length > 0 && (
                        <div className="text-xs text-blue-600 mt-2">
                          Projects: {rec.projects.join(', ')}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h3>
          {loadingAI && (!riskScores.project_risks?.length && !riskScores.employee_risks?.length) ? (
            <div className="text-center py-4 text-gray-500">Analyzing risks...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Risks */}
              {riskScores.project_risks && riskScores.project_risks.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Project Risks</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {riskScores.project_risks.slice(0, 5).map((risk, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{risk.project_name}</div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            risk.risk_level === 'high' ? 'bg-red-500 text-white' :
                            risk.risk_level === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {risk.risk_score}
                          </span>
                        </div>
                        {risk.factors && risk.factors.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Factors: {risk.factors.join(', ')}
                          </div>
                        )}
                        {/* Team Members Section */}
                        {risk.assigned_team_members !== undefined && (
                          <div className="mt-2">
                            {Array.isArray(risk.assigned_team_members) && risk.assigned_team_members.length > 0 ? (
                              <>
                                <div className="text-xs font-semibold text-gray-600 mb-1">
                                  Assigned Team Members ({risk.assigned_team_members.length}):
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {risk.assigned_team_members.slice(0, 5).map((member, memberIdx) => (
                                    <span
                                      key={memberIdx}
                                      className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                                      title={`${member.name || 'Unknown'}${member.designation ? ` - ${member.designation}` : ''}${member.department ? ` (${member.department})` : ''}`}
                                    >
                                      {member.name || 'Unknown'}
                                    </span>
                                  ))}
                                  {risk.assigned_team_members.length > 5 && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                      +{risk.assigned_team_members.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400 italic">
                                No team members assigned to this project
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No project risks detected</div>
              )}
              
              {/* Employee Risks */}
              {riskScores.employee_risks && riskScores.employee_risks.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Employee Churn Risks</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {riskScores.employee_risks
                      .sort((a, b) => b.risk_score - a.risk_score) // Sort by risk score descending
                      .slice(0, 5)
                      .map((risk, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{risk.employee_name}</div>
                            {risk.factors && risk.factors.length > 0 && risk.factors[0] !== 'No risks detected' && (
                              <div className="text-xs text-gray-500 mt-1">
                                {risk.factors.join(', ')}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            risk.risk_level === 'high' ? 'bg-red-500 text-white' :
                            risk.risk_level === 'medium' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {risk.risk_score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No employee risks detected</div>
              )}
            </div>
          )}
          </motion.div>

        {/* Trend Predictions */}
        {(loadingAI || trendPredictions) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Trend Predictions (6 Months)</h3>
            {loadingAI && !trendPredictions ? (
              <div className="text-center py-4 text-gray-500">Generating predictions...</div>
            ) : trendPredictions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Revenue Trend */}
              {trendPredictions.revenue_trend?.forecast?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Revenue Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendPredictions.revenue_trend.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="predicted_revenue" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Cost Trend */}
              {trendPredictions.cost_trend?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Cost Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendPredictions.cost_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="predicted_cost" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No trend data available</div>
            )}
          </motion.div>
        )}

        {/* Performance Benchmarking */}
        {(loadingAI || Object.keys(benchmarks).length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Benchmarking</h3>
            {loadingAI && Object.keys(benchmarks).length === 0 ? (
              <div className="text-center py-4 text-gray-500">Calculating benchmarks...</div>
            ) : Object.keys(benchmarks).length === 0 ? (
              <div className="text-center py-4 text-gray-500">No benchmark data available</div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benchmarks.revenue && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current:</span>
                      <span className="font-semibold">{formatCurrency(benchmarks.revenue.current)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Historical Avg:</span>
                      <span className="font-semibold">{formatCurrency(benchmarks.revenue.historical_avg)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Change:</span>
                      <span className={`font-semibold ${
                        benchmarks.revenue.change_percent > 0 ? 'text-green-600' :
                        benchmarks.revenue.change_percent < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {benchmarks.revenue.change_percent > 0 ? '+' : ''}{benchmarks.revenue.change_percent}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {benchmarks.project_completion && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Project Completion</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current:</span>
                      <span className="font-semibold">{benchmarks.project_completion.current}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Historical Avg:</span>
                      <span className="font-semibold">{benchmarks.project_completion.historical_avg?.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Change:</span>
                      <span className={`font-semibold ${
                        benchmarks.project_completion.change_percent > 0 ? 'text-green-600' :
                        benchmarks.project_completion.change_percent < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {benchmarks.project_completion.change_percent > 0 ? '+' : ''}{benchmarks.project_completion.change_percent}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </motion.div>
        )}

        {/* Natural Language Query */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>💬</span> Ask Dashboard
            </h3>
            <button
              onClick={() => setShowNLQuery(!showNLQuery)}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showNLQuery ? 'Hide' : 'Ask Question'}
            </button>
          </div>
          
          {showNLQuery && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNLQuery()}
                  placeholder="Ask anything... e.g., 'Show me projects at risk', 'What's the revenue forecast?'"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNLQuery}
                  disabled={loadingAI || !nlQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loadingAI ? 'Processing...' : 'Ask'}
                </button>
              </div>
              
              {nlResponse && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-semibold text-blue-800 mb-2">Response:</div>
                  <div className="text-sm text-blue-700">{nlResponse.message}</div>
                  {nlResponse.data && Object.keys(nlResponse.data).length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      {JSON.stringify(nlResponse.data, null, 2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
