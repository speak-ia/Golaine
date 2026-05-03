import type { Order } from "@shared/types/domainTypes";
import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";
import { MOCK_INITIAL_ORDERS } from "./data/mock-orders";

export interface OrdersService {
  list(): Promise<Result<Order[]>>;
}

const ordersServiceMock: OrdersService = {
  async list() {
    return ok([...MOCK_INITIAL_ORDERS]);
  },
};

const ordersServiceSupabase: OrdersService = {
  async list() {
    return err(new InternalServerError());
  },
};

export const ordersService = pickServiceImplementation(
  ordersServiceSupabase,
  ordersServiceMock,
);
