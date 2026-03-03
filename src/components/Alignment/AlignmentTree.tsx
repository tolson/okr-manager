import { useState } from 'react';
import type { Objective } from '../../types';
import { useOKR } from '../../context/OKRContext';
import { ProgressBar } from '../common/ProgressBar';

interface TreeNode {
  objective: Objective;
  children: TreeNode[];
}

interface AlignmentTreeProps {
  objectives: Objective[];
}

export function AlignmentTree({ objectives }: AlignmentTreeProps) {
  const { getTeamById, getIndividualById } = useOKR();

  const buildTree = (): TreeNode[] => {
    const objectiveMap = new Map<string, Objective>(
      objectives.map((o) => [o.id, o])
    );

    const rootNodes: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    objectives.forEach((obj) => {
      nodeMap.set(obj.id, { objective: obj, children: [] });
    });

    objectives.forEach((obj) => {
      const node = nodeMap.get(obj.id)!;
      if (obj.parentId && objectiveMap.has(obj.parentId)) {
        const parentNode = nodeMap.get(obj.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else if (!obj.parentId || !objectiveMap.has(obj.parentId)) {
        rootNodes.push(node);
      }
    });

    const sortByLevel = (nodes: TreeNode[]): TreeNode[] => {
      const levelOrder = { company: 0, team: 1, individual: 2 };
      return nodes.sort(
        (a, b) =>
          levelOrder[a.objective.level] - levelOrder[b.objective.level]
      );
    };

    const sortTree = (nodes: TreeNode[]): TreeNode[] => {
      const sorted = sortByLevel(nodes);
      sorted.forEach((node) => {
        node.children = sortTree(node.children);
      });
      return sorted;
    };

    return sortTree(rootNodes);
  };

  const tree = buildTree();

  return (
    <div className="space-y-4">
      {tree.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No objectives to display. Create objectives and align them to see the hierarchy.
        </div>
      ) : (
        tree.map((node) => (
          <TreeNodeComponent
            key={node.objective.id}
            node={node}
            level={0}
            getTeamById={getTeamById}
            getIndividualById={getIndividualById}
          />
        ))
      )}
    </div>
  );
}

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  getTeamById: (id: string) => { id: string; name: string } | undefined;
  getIndividualById: (id: string) => { id: string; name: string; teamId: string } | undefined;
}

function TreeNodeComponent({ node, level, getTeamById, getIndividualById }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { objective } = node;
  const hasChildren = node.children.length > 0;

  const getLevelColor = () => {
    switch (objective.level) {
      case 'company':
        return 'border-l-purple-500 bg-purple-50';
      case 'team':
        return 'border-l-blue-500 bg-blue-50';
      case 'individual':
        return 'border-l-green-500 bg-green-50';
    }
  };

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

  const calculateProgress = () => {
    if (objective.keyResults.length === 0) return 0;
    const totalProgress = objective.keyResults.reduce((sum, kr) => {
      return sum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0);
    }, 0);
    return Math.round(totalProgress / objective.keyResults.length);
  };

  const progress = calculateProgress();

  const getOwnerName = () => {
    if (objective.level === 'team' && objective.teamId) {
      const team = getTeamById(objective.teamId);
      return team?.name;
    }
    if (objective.level === 'individual' && objective.ownerId) {
      const individual = getIndividualById(objective.ownerId);
      return individual?.name;
    }
    return null;
  };

  const ownerName = getOwnerName();

  return (
    <div style={{ marginLeft: level > 0 ? '1.5rem' : 0 }}>
      <div
        className={`border-l-4 ${getLevelColor()} rounded-lg p-4 shadow-sm`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {hasChildren && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0.5 hover:bg-white/50 rounded"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelBadgeColor()}`}
              >
                {objective.level}
              </span>
              {ownerName && (
                <span className="text-xs text-gray-600">{ownerName}</span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{objective.title}</h3>
            {objective.description && (
              <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
            )}
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex-1 max-w-xs">
                <ProgressBar current={progress} target={100} showLabel={false} size="sm" />
              </div>
              <span className="text-sm text-gray-600">{progress}%</span>
              <span className="text-xs text-gray-400">
                {objective.keyResults.length} KR{objective.keyResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />
          <div className="space-y-2">
            {node.children.map((child) => (
              <TreeNodeComponent
                key={child.objective.id}
                node={child}
                level={level + 1}
                getTeamById={getTeamById}
                getIndividualById={getIndividualById}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
