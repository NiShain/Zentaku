import type { Request, Response } from 'express';
import { BaseController, type IBaseService } from '../../../core/base/BaseController';
import { ValidationError } from '../../../shared/utils/error';
import type { ActivityService } from '../services/activity.service';

class ActivityController extends BaseController<ActivityService & IBaseService> {
  constructor(activityService: ActivityService & IBaseService) {
    super(activityService);
  }

  private getRequiredUserId(req: Request): string {
    const userId = req.params.userId;
    if (!userId) {
      throw new ValidationError('userId is required');
    }
    return userId;
  }

  getUserActivities = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getRequiredUserId(req);
    const { page, perPage } = this.getPaginationParams(req, {
      page: 1,
      perPage: 20,
      maxPerPage: 100,
    });
    const sort = this.getStringQuery(req, 'sort', 'DESC').toUpperCase();

    const result = await this.service.getUserActivities(userId, {
      page,
      perPage,
      sort: sort === 'ASC' ? 'ASC' : 'DESC',
    });

    this.paginated(res, result.data, {
      currentPage: result.page,
      perPage: result.perPage,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
      nextPage: result.hasNextPage ? result.page + 1 : null,
      previousPage: result.hasPreviousPage ? result.page - 1 : null,
    });
  });

  getUserActivitiesByTimeRange = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = this.getRequiredUserId(req);
      const startDateStr = this.getStringQuery(req, 'startDate', '');
      const endDateStr = this.getStringQuery(req, 'endDate', '');

      if (!startDateStr || !endDateStr) {
        throw new ValidationError('startDate and endDate are required');
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      const { page, perPage } = this.getPaginationParams(req, {
        page: 1,
        perPage: 20,
        maxPerPage: 100,
      });

      const sort = this.getStringQuery(req, 'sort', 'DESC').toUpperCase();

      const result = await this.service.getUserActivitiesByTimeRange(userId, startDate, endDate, {
        page,
        perPage,
        sort: sort === 'ASC' ? 'ASC' : 'DESC',
      });

      this.paginated(res, result.data, {
        currentPage: result.page,
        perPage: result.perPage,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        nextPage: result.hasNextPage ? result.page + 1 : null,
        previousPage: result.hasPreviousPage ? result.page - 1 : null,
      });
    }
  );

  getUserActivityHeatmap = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getRequiredUserId(req);
    const yearQuery = this.getIntQuery(req, 'year', new Date().getUTCFullYear());
    const year = yearQuery || new Date().getUTCFullYear();

    const data = await this.service.getUserActivityHeatmap(userId, year);

    this.success(res, {
      year,
      data,
    });
  });

  getRecentActivities = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = this.getIntQuery(req, 'limit', 20) || 20;
    const activities = await this.service.getRecentActivityFeed(limit);
    this.success(res, activities);
  });
}

export default ActivityController;
