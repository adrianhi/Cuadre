import {
  categoryCatalogItemSchema,
  categoryCatalogResponseSchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@bills/contracts';
import { httpClient, parseResponse } from '@/shared/api';

export const categoryService = {
  async list(includeArchived = false, signal?: AbortSignal) {
    const response = await httpClient.get('/category-catalog', { params: { includeArchived }, signal });
    return parseResponse(categoryCatalogResponseSchema, response.data).data;
  },
  async create(input: CreateCategoryInput) {
    const response = await httpClient.post('/category-catalog', input);
    return parseResponse(categoryCatalogItemSchema, response.data?.data);
  },
  async update(id: string, input: UpdateCategoryInput) {
    const response = await httpClient.patch(`/category-catalog/${id}`, input);
    return parseResponse(categoryCatalogItemSchema, response.data?.data);
  },
  async archive(id: string) {
    const response = await httpClient.delete(`/category-catalog/${id}`);
    return parseResponse(categoryCatalogItemSchema, response.data?.data);
  },
};

