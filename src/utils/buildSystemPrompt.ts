import type { Objective, Team, Individual } from '../types';

interface PromptContext {
  objectives: Objective[];
  teams: Team[];
  individuals: Individual[];
  userName: string;
  orgName: string;
  quarter: string;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const capped = ctx.objectives.slice(0, 20);

  const okrSummary = capped.map((obj) => {
    const progress =
      obj.keyResults.length > 0
        ? Math.round(
            obj.keyResults.reduce(
              (sum, kr) => sum + Math.min((kr.current / kr.target) * 100, 100),
              0
            ) / obj.keyResults.length
          )
        : 0;

    const krLines = obj.keyResults
      .map((kr) => `    - ${kr.title}: ${kr.current}/${kr.target} ${kr.unit}`)
      .join('\n');

    return `  [${obj.level}] ${obj.title} — ${progress}% complete\n${krLines}`;
  }).join('\n');

  const teamList = ctx.teams.map((t) => t.name).join(', ') || 'None';
  const individualList = ctx.individuals.map((i) => i.name).join(', ') || 'None';

  return `You are an OKR coaching assistant for ${ctx.orgName}. You are chatting with ${ctx.userName}.

Your role:
- Help set effective, measurable OKRs
- Analyze progress and suggest improvements
- Provide goal-setting best practices
- Be concise and actionable

Current quarter: ${ctx.quarter}
Teams: ${teamList}
Individuals: ${individualList}

Current OKRs (${capped.length} of ${ctx.objectives.length}):
${okrSummary || '  No objectives yet.'}

Keep responses brief and focused. Use the OKR data above to give personalized advice.`;
}
