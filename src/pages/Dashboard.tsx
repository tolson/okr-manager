import { useState } from 'react';
import { useOKR } from '../context/OKRContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { MarkdownPreviewModal } from '../components/common/MarkdownPreviewModal';

export function Dashboard() {
  const { objectives, selectedQuarter } = useOKR();
  const [showPreview, setShowPreview] = useState(false);

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

  const generateMarkdown = () => {
    let markdown = `# OKRs for ${selectedQuarter}\n\n`;

    const sections = [
      { title: 'Company Objectives', okrs: companyOKRs },
      { title: 'Team Objectives', okrs: teamOKRs },
      { title: 'Individual Objectives', okrs: individualOKRs },
    ];

    sections.forEach(({ title, okrs }) => {
      if (okrs.length > 0) {
        markdown += `## ${title}\n\n`;
        okrs.forEach((obj) => {
          markdown += `### ${obj.title}\n`;
          if (obj.keyResults.length > 0) {
            obj.keyResults.forEach((kr) => {
              const progress = kr.target > 0 ? Math.round((kr.current / kr.target) * 100) : 0;
              markdown += `- ${kr.title}: ${kr.current}/${kr.target} ${kr.unit} (${progress}%)\n`;
            });
          }
          markdown += '\n';
        });
      }
    });

    return markdown;
  };

  const exportToMarkdown = () => {
    const markdown = generateMarkdown();

    if (window.pendo) {
      window.pendo.track("okr_exported", {
        quarter: selectedQuarter,
        companyOKRCount: companyOKRs.length,
        teamOKRCount: teamOKRs.length,
        individualOKRCount: individualOKRs.length,
        totalOKRCount: quarterObjectives.length,
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `okrs-${selectedQuarter}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        {quarterObjectives.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Report
            </button>
            <button
              onClick={exportToMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export .md
            </button>
          </div>
        )}
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

      <MarkdownPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`OKR Report - ${selectedQuarter}`}
        markdown={generateMarkdown()}
        onExport={() => {
          exportToMarkdown();
          setShowPreview(false);
        }}
      />
    </div>
  );
}
