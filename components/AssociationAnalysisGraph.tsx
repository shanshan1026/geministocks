import React from 'react';
import type { AssociationAnalysis, AssociationStockNode, AssociationTopicNode } from '../types';
import { BuildingStorefrontIcon, LinkIcon } from './icons/Icons';
import TextRenderer from './TextRenderer';
import { useI18n } from '../hooks/useI18n';

const NodeCard: React.FC<{ node: AssociationStockNode | AssociationTopicNode; icon: React.ReactNode; }> = ({ node, icon }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-full transition-transform hover:scale-105 hover:shadow-md">
    <div className="flex items-center mb-1">
      <span className="mr-2 text-black">{icon}</span>
      <h5 className="font-semibold text-sm text-gray-800 flex-1 truncate">
        {node.name}
      </h5>
    </div>
    <p className="text-xs text-gray-600 pl-7 leading-snug"><TextRenderer text={node.reason} /></p>
  </div>
);

interface AssociationAnalysisGraphProps {
  analysis: AssociationAnalysis;
  originalTopic: string;
}

const AssociationAnalysisGraph: React.FC<AssociationAnalysisGraphProps> = ({ analysis, originalTopic }) => {
  const { t } = useI18n();
  const { relatedStocks, relatedTopics } = analysis;

  const truncateText = (text: string, length: number): string => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  
  const hasContent = (relatedStocks && relatedStocks.length > 0) || (relatedTopics && relatedTopics.length > 0);

  if (!hasContent) {
    return <p className="text-center text-gray-500 text-sm">{t('associationGraph.noAssociation')}</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-6 text-center">
      
      {/* Central Node */}
      <div className="relative z-10">
        <div className="bg-black text-white font-bold p-4 rounded-xl shadow-lg max-w-xs">
          <p className="text-sm opacity-80">{t('associationGraph.coreTopic')}</p>
          <p className="text-lg" title={originalTopic}>{truncateText(originalTopic, 50)}</p>
        </div>
      </div>

      {/* Connecting Lines and Side Nodes */}
      <div className="w-full flex flex-col md:flex-row justify-around items-start gap-8">
        
        {/* Related Stocks */}
        {relatedStocks && relatedStocks.length > 0 && (
          <div className="flex flex-col items-center gap-y-3 w-full md:w-1/2">
            <h4 className="font-bold text-black">{t('associationGraph.relatedStocks')}</h4>
            <div className="space-y-3 w-full max-w-sm">
              {relatedStocks.map((stock, index) => (
                <NodeCard key={`stock-${index}`} node={stock} icon={<BuildingStorefrontIcon className="w-5 h-5" />} />
              ))}
            </div>
          </div>
        )}

        {/* Related Topics */}
        {relatedTopics && relatedTopics.length > 0 && (
          <div className="flex flex-col items-center gap-y-3 w-full md:w-1/2">
            <h4 className="font-bold text-black">{t('associationGraph.relatedTopics')}</h4>
            <div className="space-y-3 w-full max-w-sm">
              {relatedTopics.map((topic, index) => (
                <NodeCard key={`topic-${index}`} node={topic} icon={<LinkIcon className="w-5 h-5" />} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssociationAnalysisGraph;