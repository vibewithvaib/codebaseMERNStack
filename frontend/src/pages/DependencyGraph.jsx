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
                }`}
              >
                <FunctionSquare className="w-4 h-4" />
                Functions
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-100 rounded-md" title="Zoom In">
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-100 rounded-md" title="Zoom Out">
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={handleFit} className="p-1.5 hover:bg-gray-100 rounded-md" title="Fit to View">
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Container */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden" id="graph-container">
          {graphData.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <Info className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No dependencies found</p>
              </div>
            </div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel={node => `${node.name}\n${node.path || ''}`}
              nodeColor={getNodeColor}
              nodeRelSize={6}
              nodeVal={node => node.size}
              linkColor={() => '#e5e7eb'}
              linkWidth={1}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              cooldownTicks={100}
              enableNodeDrag={true}
              enableZoomPanInteraction={true}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Graph Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nodes</span>
                <span className="font-medium">{graphData.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Edges</span>
                <span className="font-medium">{graphData.links.length}</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Legend</h3>
            {graphType === 'file' ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f7df1e' }}></span>
                  <span>JavaScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3178c6' }}></span>
                  <span>TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3776ab' }}></span>
                  <span>Python</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366f1' }}></span>
                  <span>Other</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                  <span>Function</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></span>
                  <span>Async</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span>
                  <span>Method</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
                  <span>Class</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected Node */}
          {selectedNode && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Selected Node</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-mono text-gray-900 break-all">{selectedNode.name}</p>
                </div>
                {selectedNode.path && (
                  <div>
                    <span className="text-gray-600">Path:</span>
                    <p className="font-mono text-gray-900 break-all text-xs">{selectedNode.path}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="text-gray-900">{selectedNode.type}</p>
                </div>
                {selectedNode.language && (
                  <div>
                    <span className="text-gray-600">Language:</span>
                    <p className="text-gray-900">{selectedNode.language}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h3 className="font-medium text-blue-900 mb-2">Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click a node to see details</li>
              <li>• Drag nodes to rearrange</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Arrows show dependencies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyGraph;
