import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';

const DrawingBoard = ({ width, height, isAdmin, onDraw, drawingEnabled, initialLines }) => {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#df4b26');
  const [lines, setLines] = useState(initialLines || []);
  const isDrawing = useRef(false);
  
  useEffect(() => {
    setLines(initialLines || []);
  }, [initialLines]);

  const handleMouseDown = (e) => {
    if (!drawingEnabled) return;
    
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !drawingEnabled) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    const newLines = lines.slice();
    newLines.splice(lines.length - 1, 1, lastLine);
    setLines(newLines);
    
    if (onDraw) onDraw(newLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const newLines = [];
    setLines(newLines);
    if (onDraw) onDraw(newLines);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => setTool('pen')}
            className={`px-3 py-1 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-3 py-1 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Eraser
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8"
          />
          <button
            onClick={clearCanvas}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Clear
          </button>
        </div>
      )}
      
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="border border-gray-300"
      >
        <Layer>
          <Rect width={width} height={height} fill="#ffffff" />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === 'eraser' ? '#ffffff' : line.color}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingBoard;