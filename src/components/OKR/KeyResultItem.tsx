import { useState } from 'react';
import type { KeyResult } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { useOKR } from '../../context/OKRContext';

interface KeyResultItemProps {
  keyResult: KeyResult;
  objectiveId: string;
}

export function KeyResultItem({ keyResult, objectiveId }: KeyResultItemProps) {
  const { updateKeyResult, deleteKeyResult, objectives } = useOKR();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(keyResult.current.toString());

  const handleUpdateProgress = () => {
    const newValue = parseFloat(currentValue);
    if (!isNaN(newValue)) {
      const previousValue = keyResult.current;
      updateKeyResult(objectiveId, keyResult.id, { current: newValue });
      const objective = objectives.find((o) => o.id === objectiveId);
      pendo.track("key_result_progress_updated", {
        objective_level: objective?.level || "",
        previous_value: previousValue,
        new_value: newValue,
        target_value: keyResult.target,
        unit: keyResult.unit,
        is_completed: newValue >= keyResult.target,
        progress_percentage: keyResult.target > 0 ? Math.round((newValue / keyResult.target) * 100) : 0,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this key result?')) {
      const objective = objectives.find((o) => o.id === objectiveId);
      const progressPct = keyResult.target > 0 ? Math.round((keyResult.current / keyResult.target) * 100) : 0;
      pendo.track("key_result_deleted", {
        objective_level: objective?.level || "",
        had_progress: keyResult.current > 0,
        progress_percentage: progressPct,
        unit: keyResult.unit,
      });
      deleteKeyResult(objectiveId, keyResult.id);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{keyResult.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Target: {keyResult.target} {keyResult.unit}
          </p>
        </div>
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleUpdateProgress}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setCurrentValue(keyResult.current.toString());
                  setIsEditing(false);
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Update progress"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      <ProgressBar current={keyResult.current} target={keyResult.target} size="sm" />
    </div>
  );
}
