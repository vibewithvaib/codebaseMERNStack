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
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {repository.stats?.languages?.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {commits.slice(0, 5).map(commit => (
                    <div key={commit._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <GitCommit className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{commit.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {commit.author?.name} • {format(new Date(commit.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {files.length} Files
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map(file => (
                  <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCode className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-mono text-gray-700">{file.path}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{file.language}</span>
                      <span>{file.lineCount} lines</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'functions' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {functions.length} Functions
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {functions.map(func => (
                  <div key={func._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FunctionSquare className="w-5 h-5 text-primary-500" />
                      <div>
                        <span className="text-sm font-mono text-gray-900">{func.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({func.type})</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {func.file?.path || 'Unknown file'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'commits' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {commits.length} Commits
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {commits.map(commit => (
                  <div key={commit._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <GitCommit className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900 font-medium">{commit.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {commit.author?.name} • {format(new Date(commit.date), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded">{commit.shortHash}</code>
                    </div>
                    {commit.stats && (
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 pl-8">
                        <span className="text-green-600">+{commit.stats.totalAdditions}</span>
                        <span className="text-red-600">-{commit.stats.totalDeletions}</span>
                        <span>{commit.stats.filesChangedCount} files</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryDetail;
