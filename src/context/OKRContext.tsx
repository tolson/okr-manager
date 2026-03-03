import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Objective, Team, Individual, KeyResult, OKRLevel } from '../types';
import { loadData, saveData, generateId, getCurrentQuarter } from '../utils/storage';

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
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());

  useEffect(() => {
    const data = loadData();
    setObjectives(data.objectives);
    setTeams(data.teams);
    setIndividuals(data.individuals);
  }, []);

  useEffect(() => {
    saveData({ objectives, teams, individuals });
  }, [objectives, teams, individuals]);

  const addObjective = (objective: Omit<Objective, 'id'>) => {
    const newObjective: Objective = {
      ...objective,
      id: generateId(),
    };
    setObjectives((prev) => [...prev, newObjective]);
  };

  const updateObjective = (id: string, updates: Partial<Objective>) => {
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    );
  };

  const deleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((obj) => obj.id !== id));
  };

  const addKeyResult = (objectiveId: string, keyResult: Omit<KeyResult, 'id'>) => {
    const newKeyResult: KeyResult = {
      ...keyResult,
      id: generateId(),
    };
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === objectiveId
          ? { ...obj, keyResults: [...obj.keyResults, newKeyResult] }
          : obj
      )
    );
  };

  const updateKeyResult = (objectiveId: string, keyResultId: string, updates: Partial<KeyResult>) => {
    setObjectives((prev) =>
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
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === objectiveId
          ? { ...obj, keyResults: obj.keyResults.filter((kr) => kr.id !== keyResultId) }
          : obj
      )
    );
  };

  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: generateId(),
      name,
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const updateTeam = (id: string, name: string) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === id ? { ...team, name } : team))
    );
  };

  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
  };

  const addIndividual = (name: string, teamId: string) => {
    const newIndividual: Individual = {
      id: generateId(),
      name,
      teamId,
    };
    setIndividuals((prev) => [...prev, newIndividual]);
  };

  const updateIndividual = (id: string, name: string, teamId: string) => {
    setIndividuals((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, name, teamId } : ind))
    );
  };

  const deleteIndividual = (id: string) => {
    setIndividuals((prev) => prev.filter((ind) => ind.id !== id));
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
