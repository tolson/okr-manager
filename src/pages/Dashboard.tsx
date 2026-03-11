import { useOKR } from '../context/OKRContext';
import { ProgressBar } from '../components/common/ProgressBar';
import type { Objective } from '../types';

export function Dashboard() {
  const { objectives, selectedQuarter, getTeamById, getIndividualById } = useOKR();

  const exportToMarkdown = () => {
    const quarterObjectives = objectives.filter((o) => o.quarter === selectedQuarter);
    const companyOKRs = quarterObjectives.filter((o) => o.level === 'company');
    const teamOKRs = quarterObjectives.filter((o) => o.level === 'team');
    const individualOKRs = quarterObjectives.filter((o) => o.level === 'individual');

    const formatObjective = (obj: Objective, indent = '') => {
      const progress = obj.keyResults.length > 0
        ? Math.round(obj.keyResults.reduce((sum, kr) => sum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0), 0) / obj.keyResults.length)
        : 0;

      let md = `${indent}### ${obj.title}\n`;
      if (obj.description) md += `${indent}${obj.description}\n`;
      md += `${indent}**Progress:** ${progress}%\n\n`;

      if (obj.keyResults.length > 0) {
        md += `${indent}**Key Results:**\n`;
        obj.keyResults.forEach((kr) => {
          const krProgress = kr.target > 0 ? Math.round((kr.current / kr.target) * 100) : 0;
          const status = krProgress >= 100 ? '[x]' : '[ ]';
          md += `${indent}- ${status} ${kr.title}: ${kr.current}/${kr.target} ${kr.unit} (${krProgress}%)\n`;
        });
        md += '\n';
      }
      return md;
    };

    let markdown = `# OKRs - ${selectedQuarter}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;

    if (companyOKRs.length > 0) {
      markdown += `## Company Objectives\n\n`;
      companyOKRs.forEach((obj) => { markdown += formatObjective(obj); });
    }

    if (teamOKRs.length > 0) {
      markdown += `## Team Objectives\n\n`;
      teamOKRs.forEach((obj) => {
        const team = obj.teamId ? getTeamById(obj.teamId) : null;
        if (team) markdown += `**Team: ${team.name}**\n\n`;
        markdown += formatObjective(obj);
      });
    }

    if (individualOKRs.length > 0) {
      markdown += `## Individual Objectives\n\n`;
      individualOKRs.forEach((obj) => {
        const individual = obj.ownerId ? getIndividualById(obj.ownerId) : null;
        if (individual) markdown += `**Owner: ${individual.name}**\n\n`;
        markdown += formatObjective(obj);
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `okrs-${selectedQuarter.replace(' ', '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quarterObjectives = objectives.filter((o) => o.quarter === selectedQuarter);

  const companyOKRs = quarterObjectives.filter((o) => o.level === 'company');
  const teamOKRs = quarterObjectives.filter((o) => o.level === 'team');
  const individualOKRs = quarterObjectives.filter((o) => o.level === 'individual');

  const calculateLevelProgress = (levelObjectives: typeof objectives) => {
    if (levelObjectives.length === 0) return 0;

    const avgProgress = levelObjectives.reduce((sum, obj) => {
      if (obj.keyResults.length === 0) return sum;
      const objProgress = obj.keyResults.reduce((krSum, kr) => {
        return krSum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0);
      }, 0) / obj.keyResults.length;
      return sum + objProgress;
    }, 0) / levelObjectives.length;

    return Math.round(avgProgress);
  };

  const totalKeyResults = quarterObjectives.reduce(
    (sum, obj) => sum + obj.keyResults.length,
    0
  );

  const completedKeyResults = quarterObjectives.reduce((sum, obj) => {
    return sum + obj.keyResults.filter((kr) => kr.current >= kr.target).length;
  }, 0);

  const stats = [
    {
      label: 'Total Objectives',
      value: quarterObjectives.length,
      color: 'bg-blue-500',
    },
    {
      label: 'Company OKRs',
      value: companyOKRs.length,
      color: 'bg-purple-500',
    },
    {
      label: 'Team OKRs',
      value: teamOKRs.length,
      color: 'bg-indigo-500',
    },
    {
      label: 'Individual OKRs',
      value: individualOKRs.length,
      color: 'bg-green-500',
    },
    {
      label: 'Key Results',
      value: totalKeyResults,
      color: 'bg-orange-500',
    },
    {
      label: 'Completed KRs',
      value: completedKeyResults,
      color: 'bg-teal-500',
    },
  ];

  const levelProgress = [
    {
      label: 'Company',
      progress: calculateLevelProgress(companyOKRs),
      color: 'purple',
    },
    {
      label: 'Team',
      progress: calculateLevelProgress(teamOKRs),
      color: 'blue',
    },
    {
      label: 'Individual',
      progress: calculateLevelProgress(individualOKRs),
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview for {selectedQuarter}</p>
        </div>
        <button
          onClick={exportToMarkdown}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export .md</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress by Level</h2>
        <div className="space-y-4">
          {levelProgress.map((level) => (
            <div key={level.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{level.label}</span>
                <span className="text-sm text-gray-500">{level.progress}%</span>
              </div>
              <ProgressBar current={level.progress} target={100} showLabel={false} size="md" />
            </div>
          ))}
        </div>
      </div>

      {quarterObjectives.length === 0 && (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No OKRs for {selectedQuarter}</h3>
          <p className="text-gray-600">
            Start by creating company objectives, then align team and individual OKRs.
          </p>
        </div>
      )}
    </div>
  );
}
