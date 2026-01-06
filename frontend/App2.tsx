
import React, { useState, useCallback, useEffect } from 'react';
import { InvestigationCase } from './types';
import { supabase } from './services/supabaseClient';
import { dbService } from './services/dbService';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';

const App2: React.FC = () => {
  const [userSession, setUserSession] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [caseList, setCaseList] = useState<InvestigationCase[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      setIsProcessing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userSession) {
      fetchCaseData();
    }
  }, [userSession]);

  const fetchCaseData = async () => {
    try {
      setIsProcessing(true);
      const retrievedCases = await dbService.getCases();
      setCaseList(retrievedCases);
    } catch (error) {
      console.warn('Database query failed:', error);
      // Just keep empty array for now
      setCaseList([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaseSelection = useCallback((caseToSelect: InvestigationCase) => {
    setSelectedCase(caseToSelect);
  }, []);

  const handleCaseModification = useCallback(async (modifiedCase: InvestigationCase) => {
    try {
      // Quick update first
      setCaseList(prev => prev.map(c => c.id === modifiedCase.id ? modifiedCase : c));
      setSelectedCase(modifiedCase);

      // TODO: Implement updateCase in dbService
      // await dbService.updateCase(modifiedCase);
    } catch (error) {
      console.error('Case update failed:', error);
    }
  }, []);

  const handleReturnToMain = useCallback(() => {
    setSelectedCase(null);
    fetchCaseData(); // Refresh the list
  }, []);

  const handleCreateNewCase = useCallback(async () => {
    if (!userSession) return;

    // Setup new investigation template
    const newInvestigation: Partial<InvestigationCase> = {
      title: 'Fresh Investigation',
      description: 'A new case awaits your expertise.',
      status: 'Open'
    };

    try {
      const createdInvestigation = await dbService.createCase(newInvestigation);
      setCaseList(prev => [createdInvestigation, ...prev]);
      setSelectedCase(createdInvestigation);
    } catch (err) {
      console.error("Case creation error:", err);
    }
  }, [userSession]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#ff6b6b]/30 border-t-[#ff6b6b] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-300 font-sans text-xl">Preparing workspace...</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return <AuthView onAuthSuccess={() => fetchCaseData()} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1f1f1f]">
      {selectedCase ? (
        <Workspace
          activeCase={selectedCase}
          onBack={handleReturnToMain}
          onUpdateCase={handleCaseModification}
        />
      ) : (
        <Dashboard
          cases={caseList}
          onSelectCase={handleCaseSelection}
          onNewCase={handleCreateNewCase}
        />
      )}
    </div>
  );
};

export default App2;
