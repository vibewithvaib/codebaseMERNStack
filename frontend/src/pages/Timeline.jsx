import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryAPI } from '../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  GitCommit,
  Calendar,
  Plus,
  Minus,
  FileCode
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Timeline = () => {
  const { id } = useParams();
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'commits'

  useEffect(() => {
    fetchTimeline();
  }, [id]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await repositoryAPI.getTimeline(id);
      setTimelineData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitClick = (commit) => {
    setSelectedCommit(commit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
        <Link to={`/repository/${id}`} className="text-primary-600 hover:text-primary-700">
          ← Back to Repository
        </Link>
      </div>
    );
  }

  const chartData = viewMode === 'daily' 
    ? timelineData?.dailyStats || []
    : (timelineData?.commits || []).slice(0, 50).map(c => ({
        date: format(new Date(c.date), 'MMM d'),
        hash: c.hash,
        filesChanged: c.filesChanged,
        additions: c.additions,
        deletions: c.deletions,
        message: c.message
      }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to={`/repository/${id}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Evolution Timeline</h1>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'daily' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Daily Stats
            </button>
            <button
              onClick={() => setViewMode('commits')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'commits' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              By Commit
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <GitCommit className="w-5 h-5" />
            <span className="text-sm">Total Commits</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{timelineData?.totalCommits || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Total Additions</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            +{(timelineData?.commits || []).reduce((sum, c) => sum + (c.additions || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Minus className="w-5 h-5" />
            <span className="text-sm">Total Deletions</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            -{(timelineData?.commits || []).reduce((sum, c) => sum + (c.deletions || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {viewMode === 'daily' ? 'Activity Over Time' : 'Files Changed Per Commit'}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'daily' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => format(parseISO(value), 'MMM d, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="filesChanged" 
                  stroke="#6366f1" 
                  fill="#c7d2fe" 
                  name="Files Changed"
                />
                <Area 
                  type="monotone" 
                  dataKey="commits" 
                  stroke="#10b981" 
                  fill="#a7f3d0" 
                  name="Commits"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  content={({ active, payload }) => {
