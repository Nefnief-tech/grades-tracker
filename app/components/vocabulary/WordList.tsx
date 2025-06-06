import React from 'react';

interface WordListProps {
  vocabulary: Array<{
    term: string;
    definition: string;
    note?: string;
    source?: string;
  }>;
}

const WordList: React.FC<WordListProps> = ({ vocabulary }) => {
  if (vocabulary.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No vocabulary extracted yet. Use the form above to extract vocabulary.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="font-medium p-2 bg-gray-100">Term</div>
        <div className="font-medium p-2 bg-gray-100">Definition</div>
        
        {vocabulary.map((item, index) => (
          <React.Fragment key={index}>
            <div className="p-2 border-b">{item.term}</div>
            <div className="p-2 border-b">
              {item.definition}
              {item.note && (
                <div className="text-xs text-gray-500 mt-1">{item.note}</div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {vocabulary.length} {vocabulary.length === 1 ? 'word' : 'words'} extracted
      </div>
    </div>
  );
};

export default WordList;