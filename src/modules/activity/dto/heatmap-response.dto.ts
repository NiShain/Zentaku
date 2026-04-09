export interface HeatmapDayDto {
  date: string;
  count: number;
}

export interface HeatmapResponseDto {
  year: number;
  data: HeatmapDayDto[];
}
