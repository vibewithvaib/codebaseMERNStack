import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { repositoryAPI } from '../services/api';
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileCode,
  FunctionSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info
} from 'lucide-react';

const DependencyGraph = () => {
  const { id } = useParams();
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [graphType, setGraphType] = useState('file');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    fetchGraph();
  }, [id, graphType]);

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(500, window.innerHeight - 300)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const response = await repositoryAPI.getGraph(id, graphType);
      const { nodes, edges } = response.data.data;

      // Transform data for react-force-graph
      const graphNodes = nodes.map(node => ({
        id: node.id,
        name: node.label,
        path: node.path,
        type: node.type,
        language: node.language,
        size: Math.min(Math.max(node.size || 10, 5), 30)
      }));

      const graphLinks = edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type
      }));

      setGraphData({ nodes: graphNodes, links: graphLinks });
      setError(null);
    } catch (err) {
      setError('Failed to load dependency graph');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node);
    // Center on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.5, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.5, 300);
    }
  };

  const handleFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const getNodeColor = (node) => {
    const colors = {
      file: {
        javascript: '#f7df1e',
        typescript: '#3178c6',
        python: '#3776ab',
        java: '#b07219',
        default: '#6366f1'
      },
      function: {
        function: '#10b981',
        async: '#8b5cf6',
        method: '#f59e0b',
        class: '#ef4444',
        arrow: '#06b6d4',
        default: '#6366f1'
      }
    };

    if (graphType === 'file') {
      return colors.file[node.language] || colors.file.default;
    }
    return colors.function[node.type] || colors.function.default;
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
      <div className="mb-6">
        <Link to={`/repository/${id}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Repository
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dependency Graph</h1>
          
          <div className="flex items-center gap-4">
            {/* Graph Type Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setGraphType('file')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  graphType === 'file' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileCode className="w-4 h-4" />
                Files
              </button>
              <button
                onClick={() => setGraphType('function')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  graphType === 'function' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100'
