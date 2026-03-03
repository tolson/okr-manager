import { useState } from 'react';
import type { Objective } from '../../types';
import { useOKR } from '../../context/OKRContext';
import { KeyResultItem } from './KeyResultItem';
import { KeyResultForm } from './KeyResultForm';
import { ProgressBar } from '../common/ProgressBar';

interface ObjectiveCardProps {
  objective: Objective;
  onEdit: (objective: Objective) => void;
}

export function ObjectiveCard({ objective, onEdit }: ObjectiveCardProps) {
  const { deleteObjective, getTeamById, getIndividualById, objectives } = useOKR();
  const [showKeyResultForm, setShowKeyResultForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this objective?')) {
      pendo.track("objective_deleted", {
        objective_level: objective.level,
        quarter: objective.quarter,
        key_results_count: objective.keyResults.length,
        had_parent_alignment: !!objective.parentId,
      });
      deleteObjective(objective.id);
    }
  };

  const calculateProgress = () => {
    if (objective.keyResults.length === 0) return { current: 0, target: 0 };
    const totalProgress = objective.keyResults.reduce((sum, kr) => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      return sum + progress;
    }, 0);
    return {
      current: Math.round(totalProgress / objective.keyResults.length),
      target: 100,
    };
  };

  const progress = calculateProgress();

  const getLevelBadgeColor = () => {
    switch (objective.level) {
      case 'company':
        return 'bg-purple-100 text-purple-800';
      case 'team':
        return 'bg-blue-100 text-blue-800';
      case 'individual':
        return 'bg-green-100 text-green-800';
    }
  };

  const getOwnerName = () => {
    if (objective.level === 'team' && objective.teamId) {
      const team = getTeamById(objective.teamId);
      return team?.name || 'Unknown Team';
    }
    if (objective.level === 'individual' && objective.ownerId) {
      const individual = getIndividualById(objective.ownerId);
      return individual?.name || 'Unknown Individual';
    }
    return null;
  };

  const getParentObjective = () => {
    if (objective.parentId) {
      return objectives.find((o) => o.id === objective.parentId);
    }
    return null;
  };

  const ownerName = getOwnerName();
  const parentObjective = getParentObjective();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelBadgeColor()}`}>
                {objective.level}
              </span>
              {ownerName && (
                <span className="text-xs text-gray-500">{ownerName}</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{objective.title}</h3>
            {objective.description && (
              <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
            )}
            {parentObjective && (
              <p className="text-xs text-gray-400 mt-1">
                Aligned to: {parentObjective.title}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(objective)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{progress.current}%</span>
          </div>
          <ProgressBar current={progress.current} target={progress.target} showLabel={false} />
        </div>

        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Key Results ({objective.keyResults.length})</span>
          </button>

          {isExpanded && (
            <div className="space-y-2">
              {objective.keyResults.map((kr) => (
                <KeyResultItem key={kr.id} keyResult={kr} objectiveId={objective.id} />
              ))}
              {showKeyResultForm ? (
                <KeyResultForm
                  objectiveId={objective.id}
                  onClose={() => setShowKeyResultForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowKeyResultForm(true)}
                  className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Key Result
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
