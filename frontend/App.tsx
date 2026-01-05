
import React, { useState, useCallback } from 'react';
import { InvestigationCase } from './types';
import { MOCK_CASES } from './data';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';

const App: React.FC = () => {
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);
  const [cases, setCases] = useState<InvestigationCase[]>(MOCK_CASES);

  const handleSelectCase = useCallback((caseToSelect: InvestigationCase) => {
    setActiveCase(caseToSelect);
  }, []);

  const handleUpdateCase = useCallback((updatedCase: InvestigationCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setActiveCase(updatedCase);
  }, []);

  const handleBack = useCallback(() => {
    setActiveCase(null);
  }, []);

  const handleNewCase = useCallback(() => {
    // For now, duplicate the first case as a template
    const template = MOCK_CASES[0];
    const newCase: InvestigationCase = {
      ...template,
      id: `case-${Date.now()}`,
      title: `${template.title} (Copy)`,
      status: 'Open',
    };
    setCases(prev => [...prev, newCase]);
    setActiveCase(newCase);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {activeCase ? (
        <Workspace 
          activeCase={activeCase}
          onBack={handleBack}
          onUpdateCase={handleUpdateCase}
        />
      ) : (
        <Dashboard 
          cases={cases} 
          onSelectCase={handleSelectCase}
          onNewCase={handleNewCase}
        />
      )}
    </div>
  );
};

export default App;
