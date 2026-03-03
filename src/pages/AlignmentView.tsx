import { useOKR } from '../context/OKRContext';
import { AlignmentTree } from '../components/Alignment/AlignmentTree';

export function AlignmentView() {
  const { objectives, selectedQuarter } = useOKR();

  const quarterObjectives = objectives.filter((o) => o.quarter === selectedQuarter);

  const companyCount = quarterObjectives.filter((o) => o.level === 'company').length;
  const teamCount = quarterObjectives.filter((o) => o.level === 'team').length;
  const individualCount = quarterObjectives.filter((o) => o.level === 'individual').length;
  const alignedCount = quarterObjectives.filter((o) => o.parentId).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alignment View</h1>
        <p className="text-gray-600 mt-1">
          Visualize how objectives align across Company, Team, and Individual levels
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">{companyCount}</div>
          <div className="text-sm text-purple-600">Company OKRs</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{teamCount}</div>
          <div className="text-sm text-blue-600">Team OKRs</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{individualCount}</div>
          <div className="text-sm text-green-600">Individual OKRs</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-700">{alignedCount}</div>
          <div className="text-sm text-orange-600">Aligned OKRs</div>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded" />
          <span className="text-gray-600">Company</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-600">Team</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-600">Individual</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Objective Hierarchy - {selectedQuarter}
        </h2>
        <AlignmentTree objectives={quarterObjectives} />
      </div>
    </div>
  );
}
