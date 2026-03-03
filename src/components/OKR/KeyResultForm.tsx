import { useState } from 'react';
import { useOKR } from '../../context/OKRContext';

interface KeyResultFormProps {
  objectiveId: string;
  onClose: () => void;
}

export function KeyResultForm({ objectiveId, onClose }: KeyResultFormProps) {
  const { addKeyResult, objectives } = useOKR();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && target) {
      addKeyResult(objectiveId, {
        title: title.trim(),
        target: parseFloat(target),
        current: 0,
        unit: unit.trim() || 'units',
      });
      const objective = objectives.find((o) => o.id === objectiveId);
      pendo.track('key_result_created', {
        objective_id: objectiveId,
        objective_level: objective?.level,
        target_value: parseFloat(target),
        unit: unit.trim() || 'units',
      });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Key result title"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex space-x-2">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit (e.g., %, users)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
