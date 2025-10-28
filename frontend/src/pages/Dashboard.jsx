import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_API_URL from "../data";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    employees: 0,
    projects: 0,
    tasks: 0,
    clients: 0,
  });

  const [counters, setCounters] = useState({
    employees: 0,
    projects: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  // Sample data for charts
  const progressData = [
    { week: 'Mon', progress: 20 },
    { week: 'Tue', progress: 45 },
    { week: 'Wed', progress: 62 },
    { week: 'Thu', progress: 78 },
    { week: 'Fri', progress: 85 },
    { week: 'Sat', progress: 95 },
  ];

  const statusData = [
    { name: 'Complete', value: 65, color: '#06b6d4' },
  ];

  const projectProgressData = [
    { project: 'Project A', progress: 85 },
    { project: 'Project B', progress: 55 },
    { project: 'Project C', progress: 35 },
  ];

  const additionalProgressData = [
    { label: '95%', progress: 95 },
    { label: '25%', progress: 25 },
    { label: '10%', progress: 10 },
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${BASE_API_URL}/peoples/dashboard-summary/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(response.data);
        
        // Animate counters
        animateCounter('employees', response.data.employees || 0);
        animateCounter('projects', response.data.projects || 0);
        animateCounter('completedTasks', response.data.tasks || 0);
        animateCounter('pendingTasks', response.data.clients || 0);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const animateCounter = (key, target) => {
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCounters(prev => ({ ...prev, [key]: Math.round(target) }));
        clearInterval(timer);
      } else {
        setCounters(prev => ({ ...prev, [key]: Math.round(current) }));
      }
    }, duration / steps);
  };

  const COLORS = statusData.map(d => d.color);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Employees Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl shadow-blue-500/20 overflow-hidden group hover:border-blue-400/70 transition-all duration-300"
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          
          <div className="relative">
            <h3 className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Employees</h3>
            <p className="text-5xl font-bold text-white mb-2">{counters.employees}</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-white/60 text-xs">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Projects Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-500/50 rounded-2xl p-6 shadow-2xl shadow-green-500/20 overflow-hidden group hover:border-green-400/70 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          
          <div className="relative">
            <h3 className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Projects</h3>
            <p className="text-5xl font-bold text-white mb-2">{counters.projects}</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/60 text-xs">Ongoing</span>
            </div>
          </div>
        </motion.div>

        {/* Completed Tasks Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-2 border-yellow-500/50 rounded-2xl p-6 shadow-2xl shadow-yellow-500/20 overflow-hidden group hover:border-yellow-400/70 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          
          <div className="relative">
            <h3 className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Completed Tasks</h3>
            <p className="text-5xl font-bold text-white mb-2">{counters.completedTasks}</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-white/60 text-xs">Done</span>
            </div>
          </div>
        </motion.div>

        {/* Pending Tasks Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-red-900/20 to-pink-900/20 border-2 border-red-500/50 rounded-2xl p-6 shadow-2xl shadow-red-500/20 overflow-hidden group hover:border-red-400/70 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          
          <div className="relative">
            <h3 className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Pending Tasks</h3>
            <p className="text-5xl font-bold text-white mb-2">{counters.pendingTasks}</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
              <span className="text-white/60 text-xs">Waiting</span>
            </div>
          </div>
        </motion.div>
        </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Project Progress Section - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-7 relative backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-cyan-500/40 rounded-xl p-6 shadow-lg"
        >
          {/* Title */}
          <h3 className="text-white text-xl font-bold mb-6">Project Progress</h3>
          
          {/* All Progress Bars Together */}
          <div className="space-y-4 mb-8">
            {/* Project A - Blue */}
            <div className="space-y-2">
              <span className="text-white font-medium text-sm">Project A</span>
              <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}
                />
              </div>
            </div>

            {/* Project B - Green */}
            <div className="space-y-2">
              <span className="text-white font-medium text-sm">Project B</span>
              <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' }}
                />
              </div>
            </div>

            {/* Project C - Pink */}
            <div className="space-y-2">
              <span className="text-white font-medium text-sm">Project C</span>
              <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                  className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))' }}
                />
              </div>
            </div>

            {/* 95% - Purple */}
            <div className="flex items-center gap-4">
              <div className="relative h-3 bg-gray-700/50 rounded-full flex-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 1.5, delay: 1.1 }}
                  className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }}
                />
              </div>
              <span className="text-white text-sm font-semibold w-12 text-right">95%</span>
            </div>

            {/* 25% - Light Purple */}
            <div className="flex items-center gap-4">
              <div className="relative h-3 bg-gray-700/50 rounded-full flex-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1.5, delay: 1.3 }}
                  className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-violet-400 to-purple-400 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(196, 181, 253, 0.6))' }}
                />
              </div>
              <span className="text-white text-sm font-semibold w-12 text-right">25%</span>
        </div>

            {/* 10% - Light Blue */}
            <div className="flex items-center gap-4">
              <div className="relative h-3 bg-gray-700/50 rounded-full flex-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '10%' }}
                  transition={{ duration: 1.5, delay: 1.5 }}
                  className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' }}
                />
              </div>
              <span className="text-white text-sm font-semibold w-12 text-right">10%</span>
            </div>
        </div>

          {/* Status Donut Chart */}
          <div className="border-t border-gray-700/50 pt-6">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">Status</h3>
            <div className="flex justify-center">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={[{ name: 'Complete', value: 65 }, { name: 'Remaining', value: 35 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#06b6d4" />
                      <Cell fill="#374151" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-5xl font-bold">65%</p>
                </div>
              </div>
            </div>
        </div>
        </motion.div>

        {/* Progress Line Chart - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-5 relative backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-cyan-500/40 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-white text-lg font-semibold mb-4">Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.3} />
              <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Insights Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-cyan-500/40 rounded-xl p-6 shadow-lg overflow-hidden group"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold">AI Insights</h3>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-white text-sm leading-relaxed"
        >
          Project Alpha is <span className="text-cyan-400 font-semibold">78% complete</span> — expected to finish <span className="text-green-400 font-semibold">3 days ahead</span>.
        </motion.p>
      </motion.div>

    </div>
  );
};

export default Dashboard;
