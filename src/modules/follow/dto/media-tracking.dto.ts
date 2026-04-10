import type { LibraryStatus } from '../../../entities/types/enums';

export interface MediaTrackingSnapshotDto {
  status: LibraryStatus;
  progress: number;
  progressVolumes: number | null;
  score: number | null;
  notes: string | null;
  isPrivate: boolean;
  rewatchCount: number;
  startDate: string | null;
  finishDate: string | null;
}

export interface MediaTrackingInputDto {
  status?: LibraryStatus;
  progress?: number;
  progressVolumes?: number | null;
  score?: number | null;
  notes?: string | null;
  isPrivate?: boolean;
  rewatchCount?: number;
  startDate?: string | null;
  finishDate?: string | null;
}
