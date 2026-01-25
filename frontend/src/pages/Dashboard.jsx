import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { repositoryAPI } from '../services/api';
import { 
  Plus, 
  GitBranch, 
  FolderGit, 
  Calendar, 
  FileCode, 
  FunctionSquare,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Github,
  Folder,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRepositories();
    // Poll for status updates
    const interval = setInterval(fetchRepositories, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await repositoryAPI.getAll();
      setRepositories(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this repository?')) return;
    
    try {
      await repositoryAPI.delete(id);
      setRepositories(repos => repos.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete repository');
    }
  };

  const getStatusBadge = (status, progress) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      cloning: { color: 'bg-blue-100 text-blue-800', text: 'Cloning...' },
      analyzing: { color: 'bg-purple-100 text-purple-800', text: `Analyzing ${progress}%` },
      ready: { color: 'bg-green-100 text-green-800', text: 'Ready' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {(status === 'cloning' || status === 'analyzing') && (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        )}
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Repositories</h1>
          <p className="text-gray-600 mt-1">Manage and explore your code repositories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Repository
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Repository Grid */}
      {repositories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FolderGit className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories yet</h3>
          <p className="text-gray-600 mb-6">Add your first repository to start exploring</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map(repo => (
            <div 
              key={repo._id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {repo.sourceType === 'github' ? (
                      <Github className="w-8 h-8 text-gray-700" />
                    ) : (
                      <Folder className="w-8 h-8 text-primary-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[180px]">
                        {repo.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {repo.sourceType === 'github' ? 'GitHub' : 'Local'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(repo.status, repo.analysisProgress)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Added {format(new Date(repo.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {repo.lastAnalyzedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RefreshCw className="w-4 h-4" />
                      <span>Analyzed {format(new Date(repo.lastAnalyzedAt), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {repo.status === 'ready' && repo.stats && (
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FileCode className="w-4 h-4" />
                      <span>{repo.stats.totalFiles} files</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FunctionSquare className="w-4 h-4" />
                      <span>{repo.stats.totalFunctions} functions</span>
                    </div>
                  </div>
                )}

                {repo.status === 'analyzing' && (
                  <div className="pt-4 border-t">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${repo.analysisProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{repo.statusMessage}</p>
                  </div>
                )}

                {repo.status === 'error' && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-red-600">{repo.statusMessage}</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t flex justify-between">
                {repo.status === 'ready' ? (
                  <Link
                    to={`/repository/${repo._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Open Repository →
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm">
                    {repo.status === 'error' ? 'Analysis failed' : 'Processing...'}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(repo._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Repository Modal */}
