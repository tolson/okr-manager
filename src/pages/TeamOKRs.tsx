import { useState } from 'react';
import type { Objective } from '../types';
import { useOKR } from '../context/OKRContext';
import { ObjectiveCard } from '../components/OKR/ObjectiveCard';
import { ObjectiveForm } from '../components/OKR/ObjectiveForm';

export function TeamOKRs() {
  const { objectives, teams, selectedQuarter } = useOKR();
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [filterTeamId, setFilterTeamId] = useState('');

  const teamObjectives = objectives.filter((o) => {
    if (o.level !== 'team' || o.quarter !== selectedQuarter) return false;
    if (filterTeamId && o.teamId !== filterTeamId) return false;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team OKRs</h1>
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

      {teams.length > 0 && (
        <div className="flex items-center space-x-2">
          <label htmlFor="filterTeam" className="text-sm text-gray-600">
            Filter by team:
          </label>
          <select
            id="filterTeam"
            value={filterTeamId}
            onChange={(e) => setFilterTeamId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {teams.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Created</h3>
          <p className="text-gray-600">
            Go to Settings to create teams before adding team objectives.
          </p>
        </div>
      ) : teamObjectives.length === 0 ? (
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Objectives</h3>
          <p className="text-gray-600 mb-4">
            Create team-level objectives and align them to company goals.
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
          {teamObjectives.map((objective) => (
            <ObjectiveCard key={objective.id} objective={objective} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ObjectiveForm
        isOpen={showForm}
        onClose={handleCloseForm}
        level="team"
        editingObjective={editingObjective}
      />
    </div>
  );
}
