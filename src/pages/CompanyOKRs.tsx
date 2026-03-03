import { useState } from 'react';
import type { Objective } from '../types';
import { useOKR } from '../context/OKRContext';
import { ObjectiveCard } from '../components/OKR/ObjectiveCard';
import { ObjectiveForm } from '../components/OKR/ObjectiveForm';

export function CompanyOKRs() {
  const { objectives, selectedQuarter } = useOKR();
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  const companyObjectives = objectives.filter(
    (o) => o.level === 'company' && o.quarter === selectedQuarter
  );

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingObjective(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company OKRs</h1>
          <p className="text-gray-600 mt-1">{selectedQuarter}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Add Objective</span>
        </button>
      </div>

      {companyObjectives.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Objectives</h3>
          <p className="text-gray-600 mb-4">
            Create your first company-level objective to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Objective
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {companyObjectives.map((objective) => (
            <ObjectiveCard key={objective.id} objective={objective} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ObjectiveForm
        isOpen={showForm}
        onClose={handleCloseForm}
        level="company"
        editingObjective={editingObjective}
      />
    </div>
  );
}
