import type { Conversation } from "@shared/types/domainTypes";
import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";

export interface ConversationsService {
  list(): Promise<Result<Conversation[]>>;
}

const conversationsServiceMock: ConversationsService = {
  async list() {
    return ok([]);
  },
};

const conversationsServiceSupabase: ConversationsService = {
  async list() {
    return err(new InternalServerError());
  },
};

export const conversationsService = pickServiceImplementation(
  conversationsServiceSupabase,
  conversationsServiceMock,
);
