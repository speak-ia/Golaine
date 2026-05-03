import type { AgentIA } from "@shared/types/domainTypes";
import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";
import { MOCK_AGENTS_IA } from "./data/mockAgents";

export interface AgentsService {
  list(): Promise<Result<AgentIA[]>>;
}

const agentsServiceMock: AgentsService = {
  async list() {
    return ok([...MOCK_AGENTS_IA]);
  },
};

const agentsServiceSupabase: AgentsService = {
  async list() {
    return err(new InternalServerError());
  },
};

export const agentsService = pickServiceImplementation(
  agentsServiceSupabase,
  agentsServiceMock,
);
