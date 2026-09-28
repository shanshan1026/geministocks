import React, { useState } from 'react';
import type { IndustryChain, IndustryChainNode } from '../types';
import { XIcon } from './icons/Icons';
import TextRenderer from './TextRenderer';
import { useI18n } from '../hooks/useI18n';

const NodeCard: React.FC<{ 
    node: IndustryChainNode; 
    onClick: () => void; 
    isSelected: boolean;
}> = ({ node, onClick, isSelected }) => (
    <button 
        onClick={onClick}
        className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-all w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black ${
            isSelected ? 'border-black ring-2 ring-gray-400/50' : 'border-gray-200'
        }`}
        aria-pressed={isSelected}
    >
        <h5 className="font-semibold text-sm text-black">{node.name}</h5>
        <p className="text-xs text-gray-600 mt-1">{node.description}</p>
    </button>
);

const Branch: React.FC<{ 
    title: string; 
    nodes: IndustryChainNode[]; 
    color: string;
    onNodeSelect: (node: IndustryChainNode) => void;
    selectedNode: IndustryChainNode | null;
}> = ({ title, nodes, color, onNodeSelect, selectedNode }) => {
    if (!nodes || nodes.length === 0) {
        return null;
    }

    const branchColorStyle = {
        'blue': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-black' },
        'purple': { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-black' },
        'green': { bg: 'bg-gray-100', border: 'border-black', text: 'text-black' },
    }[color] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };

    return (
        <div className={`flex-1 min-w-[200px] ${branchColorStyle.bg} border-t-4 ${branchColorStyle.border} rounded-lg p-4 flex flex-col`}>
            <h4 className={`text-lg font-bold text-center mb-4 ${branchColorStyle.text}`}>{title}</h4>
            <div className="space-y-3">
                {nodes.map((node, index) => (
                    <NodeCard 
                        key={index} 
                        node={node} 
                        onClick={() => onNodeSelect(node)}
                        isSelected={selectedNode?.name === node.name && selectedNode?.description === node.description}
                    />
                ))}
            </div>
        </div>
    );
};

// New component for the animated arrow connector
const ArrowConnector: React.FC = () => (
    <>
        {/* Arrow for mobile view (vertical layout) */}
        <div className="flex md:hidden justify-center items-center my-2 text-gray-400">
            <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
        {/* Arrow for desktop view (horizontal layout) */}
        <div className="hidden md:flex justify-center items-center mx-2 text-gray-400">
            <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </div>
    </>
);

interface IndustryChainVizProps {
  chain: IndustryChain;
}

const IndustryChainViz: React.FC<IndustryChainVizProps> = ({ chain }) => {
  const [selectedNode, setSelectedNode] = useState<IndustryChainNode | null>(null);
  const { t } = useI18n();

  const handleNodeSelect = (node: IndustryChainNode) => {
    // Allow toggling selection by clicking the same node again
    if (selectedNode && selectedNode.name === node.name && selectedNode.description === node.description) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  };

  const hasUpstream = chain.upstream && chain.upstream.length > 0;
  const hasMidstream = chain.midstream && chain.midstream.length > 0;
  const hasDownstream = chain.downstream && chain.downstream.length > 0;

  return (
    <div className="mt-4 font-sans">
        <div className="flex flex-col md:flex-row justify-center items-stretch">
            {hasUpstream && <Branch title={t('industryChain.upstream')} nodes={chain.upstream} color="blue" onNodeSelect={handleNodeSelect} selectedNode={selectedNode} />}
            
            {hasUpstream && hasMidstream && <ArrowConnector />}

            {hasMidstream && <Branch title={t('industryChain.midstream')} nodes={chain.midstream} color="purple" onNodeSelect={handleNodeSelect} selectedNode={selectedNode} />}

            {hasMidstream && hasDownstream && <ArrowConnector />}
            
            {hasDownstream && <Branch title={t('industryChain.downstream')} nodes={chain.downstream} color="green" onNodeSelect={handleNodeSelect} selectedNode={selectedNode} />}
        </div>
        
        {/* Detail View Panel */}
        {selectedNode && (
            <div 
                className="mt-4 bg-white border border-gray-300 rounded-xl shadow-elevated p-4 animate-fade-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="node-details-title"
            >
                <div className="flex justify-between items-center">
                    <h4 id="node-details-title" className="text-lg font-bold text-black">{selectedNode.name}</h4>
                    <button 
                        onClick={() => setSelectedNode(null)}
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                        aria-label={t('industryChain.close')}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-gray-700 mt-2"><TextRenderer text={selectedNode.description} /></p>
            </div>
        )}
    </div>
  );
};

export default IndustryChainViz;