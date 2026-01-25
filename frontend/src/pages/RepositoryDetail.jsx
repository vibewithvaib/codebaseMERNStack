import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryAPI } from '../services/api';
import { 
  ArrowLeft,
  GitBranch,
  FileCode,
  FunctionSquare,
  Network,
  Clock,
  MessageSquare,
  History,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderTree,
  GitCommit
} from 'lucide-react';
import { format } from 'date-fns';

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [files, setFiles] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repoRes, filesRes, funcsRes, commitsRes] = await Promise.all([
        repositoryAPI.getOne(id),
        repositoryAPI.getFiles(id),
        repositoryAPI.getFunctions(id),
        repositoryAPI.getCommits(id)
      ]);
      
      setRepository(repoRes.data.data);
      setFiles(filesRes.data.data);
      setFunctions(funcsRes.data.data);
      setCommits(commitsRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch repository data');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      await repositoryAPI.reanalyze(id);
      alert('Re-analysis started!');
      fetchData();
    } catch (err) {
      alert('Failed to start re-analysis');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{error || 'Repository not found'}</h3>
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-primary-600" />
              {repository.name}
            </h1>
            <p className="text-gray-600 mt-1">{repository.originalPath}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReanalyze}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to={`/repository/${id}/graph`}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all"
        >
          <Network className="w-8 h-8 text-primary-600" />
          <div>
            <div className="font-medium text-gray-900">Dependency Graph</div>
            <div className="text-sm text-gray-500">View code structure</div>
          </div>
        </Link>

        <Link
          to={`/repository/${id}/timeline`}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all"
        >
          <Clock className="w-8 h-8 text-green-600" />
          <div>
            <div className="font-medium text-gray-900">Evolution Timeline</div>
            <div className="text-sm text-gray-500">See code history</div>
          </div>
        </Link>

        <Link
          to={`/repository/${id}/ask`}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all"
        >
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <div>
            <div className="font-medium text-gray-900">Ask Questions</div>
            <div className="text-sm text-gray-500">Query with AI</div>
          </div>
        </Link>

        <Link
          to={`/repository/${id}/history`}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all"
        >
          <History className="w-8 h-8 text-purple-600" />
          <div>
            <div className="font-medium text-gray-900">Q&A History</div>
            <div className="text-sm text-gray-500">Past questions</div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileCode className="w-5 h-5" />
            <span className="text-sm">Files</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{repository.stats?.totalFiles || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FunctionSquare className="w-5 h-5" />
            <span className="text-sm">Functions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{repository.stats?.totalFunctions || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <GitCommit className="w-5 h-5" />
            <span className="text-sm">Commits</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{repository.stats?.totalCommits || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Network className="w-5 h-5" />
            <span className="text-sm">Dependencies</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{repository.stats?.totalDependencies || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'files', 'functions', 'commits'].map(tab => (
              <button
                key={tab}
