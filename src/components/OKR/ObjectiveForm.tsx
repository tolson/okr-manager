import { useState, useEffect } from 'react';
import type { Objective, OKRLevel } from '../../types';
import { useOKR } from '../../context/OKRContext';
import { Modal } from '../common/Modal';
import { getQuarterOptions, getCurrentQuarter } from '../../utils/storage';

interface ObjectiveFormProps {
  isOpen: boolean;
  onClose: () => void;
  level: OKRLevel;
  editingObjective?: Objective | null;
}

export function ObjectiveForm({ isOpen, onClose, level, editingObjective }: ObjectiveFormProps) {
  const { addObjective, updateObjective, teams, individuals, objectives, selectedQuarter } = useOKR();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [teamId, setTeamId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [parentId, setParentId] = useState('');

  const quarters = getQuarterOptions();

  useEffect(() => {
    if (editingObjective) {
      setTitle(editingObjective.title);
      setDescription(editingObjective.description);
      setQuarter(editingObjective.quarter);
      setTeamId(editingObjective.teamId || '');
      setOwnerId(editingObjective.ownerId || '');
      setParentId(editingObjective.parentId || '');
    } else {
      setTitle('');
      setDescription('');
      setQuarter(selectedQuarter);
      setTeamId('');
      setOwnerId('');
      setParentId('');
    }
  }, [editingObjective, isOpen, selectedQuarter]);

  const getPotentialParents = () => {
    if (level === 'company') return [];
    if (level === 'team') {
      return objectives.filter((o) => o.level === 'company');
    }
    return objectives.filter((o) => o.level === 'company' || o.level === 'team');
  };

  const getFilteredIndividuals = () => {
    if (!teamId) return individuals;
    return individuals.filter((i) => i.teamId === teamId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const objectiveData = {
      title: title.trim(),
      description: description.trim(),
      level,
      parentId: parentId || null,
      teamId: level === 'team' || level === 'individual' ? teamId || undefined : undefined,
      ownerId: level === 'individual' ? ownerId || undefined : undefined,
      quarter,
      keyResults: editingObjective?.keyResults || [],
    };

    if (editingObjective) {
      updateObjective(editingObjective.id, objectiveData);
    } else {
      addObjective(objectiveData);
    }

    onClose();
  };

  const potentialParents = getPotentialParents();
  const filteredIndividuals = getFilteredIndividuals();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingObjective ? 'Edit Objective' : `New ${level.charAt(0).toUpperCase() + level.slice(1)} Objective`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter objective title"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter objective description (optional)"
          />
        </div>

        <div>
          <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 mb-1">
            Quarter
          </label>
          <select
            id="quarter"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {(level === 'team' || level === 'individual') && (
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              id="team"
              value={teamId}
              onChange={(e) => {
                setTeamId(e.target.value);
                setOwnerId('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {level === 'individual' && (
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <select
              id="owner"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select owner</option>
              {filteredIndividuals.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {potentialParents.length > 0 && (
          <div>
            <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
              Align to (optional)
            </label>
            <select
              id="parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No alignment</option>
              {potentialParents.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  [{obj.level}] {obj.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingObjective ? 'Save Changes' : 'Create Objective'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
