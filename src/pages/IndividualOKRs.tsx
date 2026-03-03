import { useState } from 'react';
import type { Objective } from '../types';
import { useOKR } from '../context/OKRContext';
import { ObjectiveCard } from '../components/OKR/ObjectiveCard';
import { ObjectiveForm } from '../components/OKR/ObjectiveForm';

export function IndividualOKRs() {
  const { objectives, individuals, teams, selectedQuarter } = useOKR();
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [filterOwnerId, setFilterOwnerId] = useState('');

  const individualObjectives = objectives.filter((o) => {
    if (o.level !== 'individual' || o.quarter !== selectedQuarter) return false;
    if (filterOwnerId && o.ownerId !== filterOwnerId) return false;
    return true;
  });

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingObjective(null);
  };

  const getIndividualWithTeam = () => {
    return individuals.map((ind) => {
      const team = teams.find((t) => t.id === ind.teamId);
      return {
        ...ind,
        teamName: team?.name || 'No Team',
      };
    });
  };

  const individualsWithTeam = getIndividualWithTeam();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Individual OKRs</h1>
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

      {individuals.length > 0 && (
        <div className="flex items-center space-x-2">
          <label htmlFor="filterOwner" className="text-sm text-gray-600">
            Filter by person:
          </label>
          <select
            id="filterOwner"
            value={filterOwnerId}
            onChange={(e) => setFilterOwnerId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Individuals</option>
            {individualsWithTeam.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name} ({ind.teamName})
              </option>
            ))}
          </select>
        </div>
      )}

      {individuals.length === 0 ? (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Individuals Created</h3>
          <p className="text-gray-600">
            Go to Settings to create individuals before adding personal objectives.
          </p>
        </div>
      ) : individualObjectives.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Individual Objectives</h3>
          <p className="text-gray-600 mb-4">
            Create individual objectives and align them to team or company goals.
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
          {individualObjectives.map((objective) => (
            <ObjectiveCard key={objective.id} objective={objective} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ObjectiveForm
        isOpen={showForm}
        onClose={handleCloseForm}
        level="individual"
        editingObjective={editingObjective}
      />
    </div>
  );
}
