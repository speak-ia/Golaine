import type { Product } from "@shared/types/domainTypes";
import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";
import { MOCK_PRODUCTS } from "./data/mock-products";

export interface ProductsService {
  list(): Promise<Result<Product[]>>;
}

const productsServiceMock: ProductsService = {
  async list() {
    return ok([...MOCK_PRODUCTS]);
  },
};

const productsServiceSupabase: ProductsService = {
  async list() {
    return err(new InternalServerError());
  },
};

export const productsService = pickServiceImplementation(
  productsServiceSupabase,
  productsServiceMock,
);
