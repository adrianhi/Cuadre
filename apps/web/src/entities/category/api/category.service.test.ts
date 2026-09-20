import AxiosMockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { httpClient } from '@/shared/api';
import { categoryService } from './category.service';

const mock = new AxiosMockAdapter(httpClient);
const item = { id: 'c-1', key: 'gimnasio', label: 'Gimnasio', kind: 'CUSTOM', colorKey: 'violet', icon: '🏋️', isArchived: false };

describe('categoryService', () => {
  afterEach(() => mock.reset());

  it('loads active or archived catalog entries explicitly', async () => {
    mock.onGet('/category-catalog', { params: { includeArchived: true } }).reply(200, { success: true, data: [item] });
    await expect(categoryService.list(true)).resolves.toEqual([item]);
  });

  it('creates, updates and archives custom categories', async () => {
    mock.onPost('/category-catalog').reply(201, { success: true, data: item });
    mock.onPatch('/category-catalog/c-1').reply(200, { success: true, data: { ...item, icon: '💪' } });
    mock.onDelete('/category-catalog/c-1').reply(200, { success: true, data: { ...item, isArchived: true } });
    await expect(categoryService.create({ name: 'Gimnasio', colorKey: 'violet', icon: '🏋️' })).resolves.toEqual(item);
    await expect(categoryService.update('c-1', { icon: '💪' })).resolves.toMatchObject({ icon: '💪' });
    await expect(categoryService.archive('c-1')).resolves.toMatchObject({ isArchived: true });
  });
});

