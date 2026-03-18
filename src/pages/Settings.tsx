import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOKR } from '../context/OKRContext';

export function Settings() {
  const { deleteAccount } = useAuth();
  const {
    teams,
    individuals,
    addTeam,
    updateTeam,
    deleteTeam,
    addIndividual,
    updateIndividual,
    deleteIndividual,
  } = useOKR();

  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccount();
    }
  };

  const [newIndividualName, setNewIndividualName] = useState('');
  const [newIndividualTeamId, setNewIndividualTeamId] = useState('');
  const [editingIndividualId, setEditingIndividualId] = useState<string | null>(null);
  const [editingIndividualName, setEditingIndividualName] = useState('');
  const [editingIndividualTeamId, setEditingIndividualTeamId] = useState('');

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      pendo.track("team_created", {
        team_name: newTeamName.trim(),
        existing_team_count: teams.length,
      });
      addTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  const handleUpdateTeam = (id: string) => {
    if (editingTeamName.trim()) {
      pendo.track("team_updated", {
        team_id: id,
      });
      updateTeam(id, editingTeamName.trim());
    }
    setEditingTeamId(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('Are you sure? This will not delete team OKRs but they will lose their team association.')) {
      const associatedCount = individuals.filter((i) => i.teamId === id).length;
      pendo.track("team_deleted", {
        team_id: id,
        associated_individuals_count: associatedCount,
      });
      deleteTeam(id);
    }
  };

  const handleAddIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIndividualName.trim() && newIndividualTeamId) {
      pendo.track("individual_created", {
        team_id: newIndividualTeamId,
        existing_individual_count: individuals.length,
      });
      addIndividual(newIndividualName.trim(), newIndividualTeamId);
      setNewIndividualName('');
      setNewIndividualTeamId('');
    }
  };

  const handleUpdateIndividual = (id: string) => {
    if (editingIndividualName.trim() && editingIndividualTeamId) {
      const currentIndividual = individuals.find((i) => i.id === id);
      const teamChanged = currentIndividual ? currentIndividual.teamId !== editingIndividualTeamId : false;
      pendo.track("individual_updated", {
        individual_id: id,
        team_changed: teamChanged,
      });
      updateIndividual(id, editingIndividualName.trim(), editingIndividualTeamId);
    }
    setEditingIndividualId(null);
  };

  const handleDeleteIndividual = (id: string) => {
    if (confirm('Are you sure? This will not delete individual OKRs but they will lose their owner association.')) {
      const individual = individuals.find((i) => i.id === id);
      pendo.track("individual_deleted", {
        individual_id: id,
        team_id: individual?.teamId || "",
      });
      deleteIndividual(id);
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage teams and individuals</p>
      </div>

      {/* Teams Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams</h2>

        <form onSubmit={handleAddTeam} className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter team name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Team
          </button>
        </form>

        {teams.length === 0 ? (
          <p className="text-gray-500 text-sm">No teams created yet.</p>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                {editingTeamId === team.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={editingTeamName}
                      onChange={(e) => setEditingTeamName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateTeam(team.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingTeamId(null)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">{team.name}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTeamId(team.id);
                          setEditingTeamName(team.name);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Account Section */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h2>
        <p className="text-gray-600 text-sm mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Individuals Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Individuals</h2>

        {teams.length === 0 ? (
          <p className="text-gray-500 text-sm">Create teams first before adding individuals.</p>
        ) : (
          <>
            <form onSubmit={handleAddIndividual} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newIndividualName}
                onChange={(e) => setNewIndividualName(e.target.value)}
                placeholder="Enter name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newIndividualTeamId}
                onChange={(e) => setNewIndividualTeamId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </form>

            {individuals.length === 0 ? (
              <p className="text-gray-500 text-sm">No individuals created yet.</p>
            ) : (
              <ul className="space-y-2">
                {individuals.map((individual) => (
                  <li
                    key={individual.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    {editingIndividualId === individual.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editingIndividualName}
                          onChange={(e) => setEditingIndividualName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <select
                          value={editingIndividualTeamId}
                          onChange={(e) => setEditingIndividualTeamId(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateIndividual(individual.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingIndividualId(null)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-900">{individual.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({getTeamName(individual.teamId)})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingIndividualId(individual.id);
                              setEditingIndividualName(individual.name);
                              setEditingIndividualTeamId(individual.teamId);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteIndividual(individual.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
