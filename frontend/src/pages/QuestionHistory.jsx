import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { questionAPI } from '../services/api';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  MessageSquare,
  Clock,
  ChevronRight,
  History,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

const QuestionHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getHistory(id);
      setQuestions(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load question history');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = async (question) => {
    if (selectedQuestion?._id === question._id) {
      setSelectedQuestion(null);
      return;
    }

    try {
      const response = await questionAPI.getOne(question._id);
      setSelectedQuestion(response.data.data);
    } catch (err) {
      console.error('Failed to load question details');
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="mb-6">
        <Link to={`/repository/${id}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <History className="w-8 h-8 text-primary-600" />
            Question History
          </h1>
          <Link
            to={`/repository/${id}/ask`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Ask New Question
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No matching questions' : 'No questions yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try a different search term' : 'Start by asking a question about this repository'}
          </p>
          {!searchQuery && (
            <Link
              to={`/repository/${id}/ask`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Ask a Question
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div 
              key={q._id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                selectedQuestion?._id === q._id 
                  ? 'border-primary-500 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => handleSelectQuestion(q)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MessageSquare className={`w-5 h-5 mt-0.5 ${
                      selectedQuestion?._id === q._id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="text-gray-900 font-medium">{q.question}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(q.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          q.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : q.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedQuestion?._id === q._id ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Expanded Answer */}
              {selectedQuestion?._id === q._id && selectedQuestion.answer && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Answer:</h4>
                  <p className="text-gray-800 whitespace-pre-wrap mb-4">
                    {selectedQuestion.answer.answer}
                  </p>

                  {selectedQuestion.answer.explanation && (
                    <>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">
                        {selectedQuestion.answer.explanation}
                      </p>
                    </>
                  )}

                  {/* Sources Summary */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                    {selectedQuestion.answer.sources?.files?.length > 0 && (
                      <span className="text-sm text-gray-600">
                        📄 {selectedQuestion.answer.sources.files.length} files
                      </span>
                    )}
                    {selectedQuestion.answer.sources?.functions?.length > 0 && (
                      <span className="text-sm text-gray-600">
                        ⚡ {selectedQuestion.answer.sources.functions.length} functions
                      </span>
                    )}
                    {selectedQuestion.answer.sources?.commits?.length > 0 && (
                      <span className="text-sm text-gray-600">
                        📝 {selectedQuestion.answer.sources.commits.length} commits
                      </span>
                    )}
                    <span className="text-sm text-gray-500 ml-auto">
                      Confidence: {Math.round((selectedQuestion.answer.confidence || 0.7) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionHistory;
