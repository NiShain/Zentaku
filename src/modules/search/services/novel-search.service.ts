import type { MediaSearchParams, SearchResult } from '../types/search.types';

// TODO: Implement in Phase 2.3
class NovelSearchService {
  async searchByText(params: MediaSearchParams): Promise<SearchResult<unknown>> {
    throw new Error('NovelSearchService not yet implemented');
  }
}

export default NovelSearchService;
