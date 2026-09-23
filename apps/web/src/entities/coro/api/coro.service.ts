import axios from 'axios';
import {
  claimCoroResultSchema, coroCandidateTransactionSchema, coroGroupSummarySchema, coroPublicDetailSchema,
  type ClaimCoroParticipantInput, type CoroPaymentDestination, type CreateCoroExpenseInput,
  type CreateCoroGroupInput, type LinkCoroTransactionInput, type UpdateCoroExpenseInput,
  type UpdateCoroGroupInput,
} from '@bills/contracts';
import { httpClient, normalizeApiError, parseResponse } from '@/shared/api';

const publicClient = axios.create({ baseURL: '/api/v1', timeout: 30_000, headers: { Accept: 'application/json' } });
publicClient.interceptors.response.use((response) => response, (error) => Promise.reject(normalizeApiError(error)));
const tokenHeaders = (token?: string) => token ? { 'X-Coro-Participant-Token': token } : undefined;

export const coroKeys = {
  all: ['coro'] as const,
  list: () => ['coro', 'list'] as const,
  detail: (id: string) => ['coro', 'detail', id] as const,
  public: (slug: string, token?: string) => ['coro', 'public', slug, Boolean(token)] as const,
};

export const coroService = {
  async list() {
    const response = await httpClient.get('/coro');
    return parseResponse(coroGroupSummarySchema.array(), response.data?.data);
  },
  async create(input: CreateCoroGroupInput) {
    const response = await httpClient.post('/coro', input);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async detail(id: string) {
    const response = await httpClient.get(`/coro/${id}`);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async update(id: string, input: UpdateCoroGroupInput) {
    const response = await httpClient.patch(`/coro/${id}`, input);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async lock(id: string) {
    const response = await httpClient.post(`/coro/${id}/lock`);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async archive(id: string) {
    const response = await httpClient.post(`/coro/${id}/archive`);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async addParticipant(id: string, name: string) { await httpClient.post(`/coro/${id}/participants`, { name }); },
  async updateParticipant(id: string, participantId: string, name: string) {
    await httpClient.patch(`/coro/${id}/participants/${participantId}`, { name });
  },
  async removeParticipant(id: string, participantId: string) {
    await httpClient.delete(`/coro/${id}/participants/${participantId}`);
  },
  async releaseClaim(id: string, participantId: string) { await httpClient.post(`/coro/${id}/participants/${participantId}/release-claim`); },
  async updateOwnerPayment(id: string, paymentDestination: CoroPaymentDestination | null) {
    const response = await httpClient.patch(`/coro/${id}/participants/me`, { paymentDestination });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async candidates(id: string) {
    const response = await httpClient.get(`/coro/${id}/candidate-transactions`);
    return parseResponse(coroCandidateTransactionSchema.array(), response.data?.data);
  },
  async linkTransaction(id: string, input: LinkCoroTransactionInput) { await httpClient.post(`/coro/${id}/link-transaction`, input); },
  async createOwnerExpense(id: string, input: CreateCoroExpenseInput) {
    const response = await httpClient.post(`/coro/${id}/expenses`, input);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async removeOwnerExpense(id: string, expenseId: string) { await httpClient.delete(`/coro/${id}/expenses/${expenseId}`); },
  async updateOwnerExpense(id: string, expenseId: string, input: UpdateCoroExpenseInput) {
    await httpClient.patch(`/coro/${id}/expenses/${expenseId}`, input);
  },
  async confirmOwnerSettlement(id: string, settlementId: string) {
    const response = await httpClient.post(`/coro/${id}/settlements/${settlementId}/confirm`);
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async markOwnerSettlementPaid(id: string, settlementId: string, input?: { paymentNote?: string }) {
    const response = await httpClient.post(`/coro/${id}/settlements/${settlementId}/mark-paid`, input ?? {});
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async publicDetail(slug: string, token?: string, signal?: AbortSignal) {
    const response = await publicClient.get(`/public/coro/${encodeURIComponent(slug)}`, { headers: tokenHeaders(token), signal });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async claim(slug: string, input: ClaimCoroParticipantInput) {
    const response = await publicClient.post(`/public/coro/${encodeURIComponent(slug)}/claim`, input);
    return parseResponse(claimCoroResultSchema, response.data?.data);
  },
  async updatePayment(slug: string, token: string, paymentDestination: CoroPaymentDestination | null) {
    const response = await publicClient.patch(`/public/coro/${encodeURIComponent(slug)}/participants/me`, { paymentDestination }, { headers: tokenHeaders(token) });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async createExpense(slug: string, token: string, input: CreateCoroExpenseInput) {
    const response = await publicClient.post(`/public/coro/${encodeURIComponent(slug)}/expenses`, input, { headers: tokenHeaders(token) });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async updateExpense(slug: string, token: string, id: string, input: UpdateCoroExpenseInput) {
    const response = await publicClient.patch(`/public/coro/${encodeURIComponent(slug)}/expenses/${id}`, input, { headers: tokenHeaders(token) });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async removeExpense(slug: string, token: string, id: string) {
    const response = await publicClient.delete(`/public/coro/${encodeURIComponent(slug)}/expenses/${id}`, { headers: tokenHeaders(token) });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
  async settlement(slug: string, token: string, id: string, action: 'mark-paid' | 'confirm', input?: { paymentNote?: string }) {
    const response = await publicClient.post(`/public/coro/${encodeURIComponent(slug)}/settlements/${id}/${action}`, input ?? {}, { headers: tokenHeaders(token) });
    return parseResponse(coroPublicDetailSchema, response.data?.data);
  },
};
