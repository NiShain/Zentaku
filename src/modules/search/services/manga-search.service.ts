import type { MediaSearchParams, SearchResult } from '../types/search.types';

// TODO: Implement in Phase 2.3
class MangaSearchService {
  async searchByText(params: MediaSearchParams): Promise<SearchResult<unknown>> {
    throw new Error('MangaSearchService not yet implemented');
  }
}

export default MangaSearchService;
