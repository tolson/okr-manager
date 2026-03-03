import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Objective, Team, Individual, KeyResult, OKRLevel } from '../types';
import { loadData, saveData, generateId, getCurrentQuarter } from '../utils/storage';
import { useAuth } from './AuthContext';

interface OKRContextType {
  objectives: Objective[];
  teams: Team[];
  individuals: Individual[];
  selectedQuarter: string;
  setSelectedQuarter: (quarter: string) => void;
  addObjective: (objective: Omit<Objective, 'id'>) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  addKeyResult: (objectiveId: string, keyResult: Omit<KeyResult, 'id'>) => void;
  updateKeyResult: (objectiveId: string, keyResultId: string, updates: Partial<KeyResult>) => void;
  deleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  addTeam: (name: string) => void;
  updateTeam: (id: string, name: string) => void;
  deleteTeam: (id: string) => void;
  addIndividual: (name: string, teamId: string) => void;
  updateIndividual: (id: string, name: string, teamId: string) => void;
  deleteIndividual: (id: string) => void;
  getObjectivesByLevel: (level: OKRLevel) => Objective[];
  getObjectivesByQuarter: (quarter: string) => Objective[];
  getTeamById: (id: string) => Team | undefined;
  getIndividualById: (id: string) => Individual | undefined;
  getChildObjectives: (parentId: string) => Objective[];
}

const OKRContext = createContext<OKRContextType | undefined>(undefined);

export function OKRProvider({ children }: { children: ReactNode }) {
  const { currentOrganization } = useAuth();
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allIndividuals, setAllIndividuals] = useState<Individual[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());

  useEffect(() => {
    const data = loadData();
    setAllObjectives(data.objectives);
    setAllTeams(data.teams);
    setAllIndividuals(data.individuals);
  }, []);

  useEffect(() => {
    saveData({ objectives: allObjectives, teams: allTeams, individuals: allIndividuals });
  }, [allObjectives, allTeams, allIndividuals]);

  // Filter data by current organization
  const teams = useMemo(() => {
    if (!currentOrganization) return [];
    return allTeams.filter(t => t.organizationId === currentOrganization.id);
  }, [allTeams, currentOrganization]);

  const teamIds = useMemo(() => new Set(teams.map(t => t.id)), [teams]);

  const individuals = useMemo(() => {
    return allIndividuals.filter(i => teamIds.has(i.teamId));
  }, [allIndividuals, teamIds]);

  const individualIds = useMemo(() => new Set(individuals.map(i => i.id)), [individuals]);

  const objectives = useMemo(() => {
    return allObjectives.filter(obj => {
      if (obj.level === 'company') {
        // Company objectives: check if any team objective that links to this belongs to our org
        // Or if it was created by our org (we'll need to check children)
        const hasOrgTeamChild = allObjectives.some(
          child => child.parentId === obj.id && child.teamId && teamIds.has(child.teamId)
        );
        // Also include if it has no team/individual assignment (org-level)
        const isOrphan = !obj.teamId && !obj.ownerId;
        return hasOrgTeamChild || isOrphan;
      }
      if (obj.level === 'team' && obj.teamId) {
        return teamIds.has(obj.teamId);
      }
      if (obj.level === 'individual' && obj.ownerId) {
        return individualIds.has(obj.ownerId);
      }
      return false;
    });
  }, [allObjectives, teamIds, individualIds]);

  const addObjective = (objective: Omit<Objective, 'id'>) => {
    const newObjective: Objective = {
      ...objective,
      id: generateId(),
    };
    setAllObjectives((prev) => [...prev, newObjective]);
  };

  const updateObjective = (id: string, updates: Partial<Objective>) => {
    setAllObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    );
  };

  const deleteObjective = (id: string) => {
    setAllObjectives((prev) => prev.filter((obj) => obj.id !== id));
  };

  const addKeyResult = (objectiveId: string, keyResult: Omit<KeyResult, 'id'>) => {
    const newKeyResult: KeyResult = {
      ...keyResult,
      id: generateId(),
    };
    setAllObjectives((prev) =>
      prev.map((obj) =>
        obj.id === objectiveId
          ? { ...obj, keyResults: [...obj.keyResults, newKeyResult] }
          : obj
      )
    );
  };

  const updateKeyResult = (objectiveId: string, keyResultId: string, updates: Partial<KeyResult>) => {
    setAllObjectives((prev) =>
      prev.map((obj) =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map((kr) =>
                kr.id === keyResultId ? { ...kr, ...updates } : kr
              ),
            }
          : obj
      )
    );
  };

  const deleteKeyResult = (objectiveId: string, keyResultId: string) => {
    setAllObjectives((prev) =>
      prev.map((obj) =>
        obj.id === objectiveId
          ? { ...obj, keyResults: obj.keyResults.filter((kr) => kr.id !== keyResultId) }
          : obj
      )
    );
  };

  const addTeam = (name: string) => {
    if (!currentOrganization) return;
    const newTeam: Team = {
      id: generateId(),
      name,
      organizationId: currentOrganization.id,
    };
    setAllTeams((prev) => [...prev, newTeam]);
  };

  const updateTeam = (id: string, name: string) => {
    setAllTeams((prev) =>
      prev.map((team) => (team.id === id ? { ...team, name } : team))
    );
  };

  const deleteTeam = (id: string) => {
    setAllTeams((prev) => prev.filter((team) => team.id !== id));
  };

  const addIndividual = (name: string, teamId: string) => {
    const newIndividual: Individual = {
      id: generateId(),
      name,
      teamId,
    };
    setAllIndividuals((prev) => [...prev, newIndividual]);
  };

  const updateIndividual = (id: string, name: string, teamId: string) => {
    setAllIndividuals((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, name, teamId } : ind))
    );
  };

  const deleteIndividual = (id: string) => {
    setAllIndividuals((prev) => prev.filter((ind) => ind.id !== id));
  };

  const getObjectivesByLevel = (level: OKRLevel) => {
    return objectives.filter((obj) => obj.level === level);
  };

  const getObjectivesByQuarter = (quarter: string) => {
    return objectives.filter((obj) => obj.quarter === quarter);
  };

  const getTeamById = (id: string) => {
    return teams.find((team) => team.id === id);
  };

  const getIndividualById = (id: string) => {
    return individuals.find((ind) => ind.id === id);
  };

  const getChildObjectives = (parentId: string) => {
    return objectives.filter((obj) => obj.parentId === parentId);
  };

  return (
    <OKRContext.Provider
      value={{
        objectives,
        teams,
        individuals,
        selectedQuarter,
        setSelectedQuarter,
        addObjective,
        updateObjective,
        deleteObjective,
        addKeyResult,
        updateKeyResult,
        deleteKeyResult,
        addTeam,
        updateTeam,
        deleteTeam,
        addIndividual,
        updateIndividual,
        deleteIndividual,
        getObjectivesByLevel,
        getObjectivesByQuarter,
        getTeamById,
        getIndividualById,
        getChildObjectives,
      }}
    >
      {children}
    </OKRContext.Provider>
  );
}

export function useOKR() {
  const context = useContext(OKRContext);
  if (context === undefined) {
    throw new Error('useOKR must be used within an OKRProvider');
  }
  return context;
}
