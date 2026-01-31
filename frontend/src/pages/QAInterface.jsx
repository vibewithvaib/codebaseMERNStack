import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repositoryAPI, questionAPI } from '../services/api';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  FileCode,
  FunctionSquare,
  GitCommit,
  Network,
  Lightbulb,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const QAInterface = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoLoading, setRepoLoading] = useState(true);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  const exampleQuestions = [
    "What does this codebase do?",
    "Where is authentication handled?",
    "What are the main entry points?",
    "Which files have the most dependencies?",
    "What functions are most important?",
    "How is error handling implemented?"
  ];

  useEffect(() => {
    fetchRepository();
  }, [id]);

  const fetchRepository = async () => {
    try {
      const response = await repositoryAPI.getOne(id);
      setRepository(response.data.data);
    } catch (err) {
      setError('Failed to load repository');
    } finally {
      setRepoLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await questionAPI.ask(id, question.trim());
      setAnswer(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process question');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (q) => {
    setQuestion(q);
  };

  if (repoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to={`/repository/${id}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary-600" />
          Ask Questions About {repository?.name}
        </h1>
        <p className="text-gray-600 mt-1">Get AI-powered answers with source references</p>
      </div>

      {/* Question Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <form onSubmit={handleAsk}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Question
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this codebase..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Ask
            </button>
          </div>
        </form>

        {/* Example Questions */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(q)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing codebase and generating answer...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="space-y-6">
          {/* Main Answer */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-primary-50 border-b border-primary-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">Answer</span>
                <span className="ml-auto text-sm text-primary-600">
                  Confidence: {Math.round((answer.confidence || 0.7) * 100)}%
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{answer.answer}</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {answer.explanation && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 bg-yellow-50 border-b border-yellow-100">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Explanation</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{answer.explanation}</p>
              </div>
            </div>
          )}

          {/* Sources */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-900">Sources Used</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Files */}
              {answer.sources?.files?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Files ({answer.sources.files.length})
                  </h4>
                  <div className="space-y-2">
                    {answer.sources.files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="font-mono text-sm text-gray-700">{file.path}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(file.relevanceScore * 100)}% relevant
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Functions */}
              {answer.sources?.functions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FunctionSquare className="w-4 h-4" />
                    Functions ({answer.sources.functions.length})
                  </h4>
                  <div className="space-y-2">
                    {answer.sources.functions.map((func, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-mono text-sm text-gray-900">{func.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{func.filePath}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(func.relevanceScore * 100)}% relevant
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commits */}
              {answer.sources?.commits?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <GitCommit className="w-4 h-4" />
                    Commits ({answer.sources.commits.length})
                  </h4>
                  <div className="space-y-2">
                    {answer.sources.commits.map((commit, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-gray-200 px-2 py-0.5 rounded">{commit.hash}</code>
                          <span className="text-xs text-gray-500">
                            {commit.date && format(new Date(commit.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{commit.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Graph Nodes */}
              {answer.sources?.graphNodes?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    Graph Nodes ({answer.sources.graphNodes.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {answer.sources.graphNodes.map((node, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          node.nodeType === 'file' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></span>
                        {node.nodeName}
                        {node.connections > 0 && (
                          <span className="text-xs text-gray-500">({node.connections})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Processed in {answer.processingTime}ms</span>
            </div>
            <Link 
              to={`/repository/${id}/history`}
              className="text-primary-600 hover:text-primary-700"
            >
              View Question History →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAInterface;
