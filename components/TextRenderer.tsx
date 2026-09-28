import React from 'react';
import Tooltip from './Tooltip';
import { GLOSSARIES } from './glossary';
import { useI18n } from '../hooks/useI18n';

interface TextRendererProps {
  text: string;
  keywords?: string[];
}

const TextRenderer: React.FC<TextRendererProps> = ({ text, keywords = [] }) => {
  const { locale } = useI18n();
  const GLOSSARY = GLOSSARIES[locale];
  
  if (!text) {
    return null;
  }

  // Combine glossary terms and keywords into a single regex for splitting the text.
  // Using a Set prevents duplicates and improves performance.
  const allTerms = [
    ...new Set([...Object.keys(GLOSSARY), ...keywords.map(k => k.toLowerCase())]),
  ].filter(Boolean);

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Regex to match URLs OR any of the terms.
  const urlRegexPart = '(https?://\\S+)';
  const termsRegexPart = allTerms.map(escapeRegExp).join('|');
  
  // We only build the terms part if there are terms to avoid an empty alternation group `()` which can cause issues.
  const combinedRegex = termsRegexPart 
    ? new RegExp(`(${urlRegexPart}|${termsRegexPart})`, 'gi')
    : new RegExp(`(${urlRegexPart})`, 'gi');

  const parts = text.split(combinedRegex);

  const urlCheckRegex = /^https?:\/\//i;

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null; // Don't render empty strings

        const lowerPart = part.toLowerCase();

        // 1. Check for URL
        if (urlCheckRegex.test(part)) {
          try {
            // Trim trailing punctuation that might be part of the URL match
            const cleanUrl = part.replace(/[.,;!?)]+$/, '');
            const hostname = new URL(cleanUrl).hostname;
            // Capture the trailing punctuation to append it after the link
            const trailingPunctuation = part.substring(cleanUrl.length);
            
            return (
              <React.Fragment key={index}>
                <a 
                  href={cleanUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black hover:text-gray-700 animated-underline transition-colors"
                >
                  {hostname.replace(/^www\./, '')}
                </a>
                {trailingPunctuation}
              </React.Fragment>
            );
          } catch (e) {
            // Fallback for invalid URL that matched regex
            return <span key={index}>{part}</span>;
          }
        }
        
        // 2. Check for Glossary Term
        const glossaryDefinition = GLOSSARY[lowerPart];
        if (glossaryDefinition) {
          const isKeyword = keywords.some(k => k.toLowerCase() === lowerPart);
          const content = isKeyword ? (
            <mark className="bg-gray-200 text-black rounded-sm px-1 mx-px font-semibold">
              {part}
            </mark>
          ) : (
            part
          );
          return (
            <Tooltip key={index} tip={glossaryDefinition}>
              {content}
            </Tooltip>
          );
        }

        // 3. Check for Keyword (that's not a glossary term)
        const isKeyword = keywords.some(k => k.toLowerCase() === lowerPart);
        if (isKeyword) {
          return (
            <mark key={index} className="bg-gray-200 text-black rounded-sm px-1 mx-px font-semibold">
              {part}
            </mark>
          );
        }

        // 4. Plain text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default TextRenderer;