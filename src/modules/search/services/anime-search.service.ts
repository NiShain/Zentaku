import type { MediaSearchParams, SearchResult } from '../types/search.types';

// TODO: Implement in Phase 2.2
class AnimeSearchService {
  async searchByText(params: MediaSearchParams): Promise<SearchResult<unknown>> {
    throw new Error('AnimeSearchService not yet implemented');
  }
}

export default AnimeSearchService;
