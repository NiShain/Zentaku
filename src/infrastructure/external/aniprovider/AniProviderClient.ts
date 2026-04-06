import { type AxiosError, type AxiosHeaders, type AxiosRequestConfig } from 'axios';
import { AniProviderUpstreamError } from '../../../shared/utils/error';
import logger from '../../../shared/utils/logger';
import httpClient from '../../http/httpClient';
import type {
  AniProviderEpisodesResponse,
  AniProviderErrorEnvelope,
  AniProviderGetSourcesOptions,
  AniProviderRequestOptions,
  AniProviderSourcesResponse,
  AniProviderTaskResponse,
} from './aniprovider.types';

const TRANSIENT_STATUS_CODES = new Set([503, 504]);

class AniProviderClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly authMode: 'X-API-Key' | 'Bearer';
  private readonly timeoutMs: number;

  constructor() {
    const configuredBaseUrl = process.env.ANIPROVIDER_BASE_URL?.trim();
    if (!configuredBaseUrl) {
      throw new Error('ANIPROVIDER_BASE_URL is required');
    }

    this.baseUrl = configuredBaseUrl.replace(/\/+$/, '');
    this.apiKey = process.env.ANIPROVIDER_API_KEY || '';
    this.authMode = process.env.ANIPROVIDER_AUTH_MODE === 'Bearer' ? 'Bearer' : 'X-API-Key';

    const parsedTimeout = Number.parseInt(process.env.ANIPROVIDER_TIMEOUT || '', 10);
    this.timeoutMs = Number.isInteger(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 12000;

    logger.info(
      `[AniProvider] Client initialized with base URL ${this.baseUrl}, auth mode ${this.authMode}`
    );
  }

  async getEpisodes(
    animeId: string,
    options: AniProviderRequestOptions = {}
  ): Promise<AniProviderEpisodesResponse> {
    const refresh = options.refresh ?? false;
    const response = await this._getWithRetry<AniProviderEpisodesResponse>(
      `/api/animes/${encodeURIComponent(animeId)}/episodes`,
      {
        params: {
          refresh: String(refresh),
        },
        requestId: options.requestId,
      }
    );

    return response;
  }

  async getSources(
    episodeId: string,
    options: AniProviderGetSourcesOptions = {}
  ): Promise<AniProviderSourcesResponse> {
    const response = await this._getWithRetry<AniProviderSourcesResponse>(
      `/api/episodes/${encodeURIComponent(episodeId)}/sources`,
      {
        params: {
          refresh: String(options.refresh ?? false),
          async: String(options.async ?? false),
        },
        requestId: options.requestId,
      }
    );

    return response;
  }

  async getTaskStatus(taskId: string, requestId?: string): Promise<AniProviderTaskResponse> {
    return this._getWithRetry<AniProviderTaskResponse>(`/api/tasks/${encodeURIComponent(taskId)}`, {
      requestId,
    });
  }

  private async _getWithRetry<T>(
    path: string,
    options: {
      params?: Record<string, string>;
      requestId?: string;
    }
  ): Promise<T> {
    const maxAttempts = 2;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this._get<T>(path, options);
      } catch (error) {
        lastError = error;

        if (!(error instanceof AniProviderUpstreamError)) {
          throw error;
        }

        if (!TRANSIENT_STATUS_CODES.has(error.statusCode) || attempt === maxAttempts) {
          throw error;
        }

        const delayMs = 150 * attempt;
        logger.warn(
          `[AniProvider] Transient error ${error.statusCode} for ${path}, retrying in ${delayMs}ms`
        );
        await this._sleep(delayMs);
      }
    }

    throw lastError;
  }

  private async _get<T>(
    path: string,
    options: {
      params?: Record<string, string>;
      requestId?: string;
    }
  ): Promise<T> {
    const headers = this._buildHeaders(options.requestId);
    const config: AxiosRequestConfig = {
      headers,
      params: options.params,
      timeout: this.timeoutMs,
    };

    try {
      const response = await httpClient.get<T>(`${this.baseUrl}${path}`, config);
      return response.data;
    } catch (error) {
      throw this._normalizeUpstreamError(error);
    }
  }

  private _buildHeaders(requestId?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      if (this.authMode === 'Bearer') {
        headers.Authorization = `Bearer ${this.apiKey}`;
      } else {
        headers['X-API-Key'] = this.apiKey;
      }
    }

    if (requestId) {
      headers['X-Request-ID'] = requestId;
    }

    return headers;
  }

  private _normalizeUpstreamError(error: unknown): AniProviderUpstreamError {
    const axiosError = error as AxiosError<AniProviderErrorEnvelope>;
    const statusCode = axiosError.response?.status ?? 500;
    const upstreamError = axiosError.response?.data?.error;
    const responseRequestId = this._getHeaderValue(axiosError.response?.headers, 'x-request-id');

    const message =
      upstreamError?.message || axiosError.message || 'AniProvider request failed unexpectedly';

    return new AniProviderUpstreamError(
      message,
      statusCode,
      upstreamError?.code || 'INTERNAL_ERROR',
      upstreamError?.request_id || responseRequestId,
      upstreamError?.details || null
    );
  }

  private _getHeaderValue(
    headers: AxiosHeaders | Record<string, unknown> | undefined,
    key: string
  ): string | undefined {
    if (!headers) {
      return undefined;
    }

    const normalizedKey = key.toLowerCase();
    const headerMap = headers as Record<string, unknown>;
    const rawValue = headerMap[normalizedKey] ?? headerMap[key];

    if (typeof rawValue === 'string') {
      return rawValue;
    }

    if (Array.isArray(rawValue) && typeof rawValue[0] === 'string') {
      return rawValue[0];
    }

    return undefined;
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default AniProviderClient;
