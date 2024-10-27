import { CrossValidator } from '../../validators/cross-validator';
import { createMockGitHubMetrics, createMockNEARMetrics } from '../helpers/mock-data';
import { Logger } from '../../utils/logger';
import { ErrorCode } from '../../utils/errors';

describe('CrossValidator', () => {
  let validator: CrossValidator;
  let logger: Logger;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as Logger;

    validator = new CrossValidator(logger);
  });

  describe('validate', () => {
    it('should pass validation for valid metrics', () => {
      const github = createMockGitHubMetrics();
      const near = createMockNEARMetrics();

      const result = validator.validate(github, near);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect time drift between metrics', () => {
      const github = createMockGitHubMetrics();
      const near = createMockNEARMetrics({
        metadata: {
          ...createMockNEARMetrics().metadata,
          collectionTimestamp: Date.now() - (12 * 60 * 60 * 1000) // 12 hours ago
        }
      });

      const result = validator.validate(github, near);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ErrorCode.TIMESTAMP_DRIFT);
    });

    it('should detect stale data', () => {
      const github = createMockGitHubMetrics({
        metadata: {
          ...createMockGitHubMetrics().metadata,
          collectionTimestamp: Date.now() - (48 * 60 * 60 * 1000) // 48 hours ago
        }
      });
      const near = createMockNEARMetrics();

      const result = validator.validate(github, near);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ErrorCode.STALE_DATA);
    });

    it('should warn about low activity correlation', () => {
      const github = createMockGitHubMetrics({
        commits: { count: 100, frequency: 10, authors: ['user1'] },
        pullRequests: { open: 50, merged: 75, authors: ['user1'] }
      });
      const near = createMockNEARMetrics({
        transactions: { count: 1, volume: "10", uniqueUsers: ['user2.near'] }
      });

      const result = validator.validate(github, near);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe(ErrorCode.LOW_ACTIVITY_CORRELATION);
    });
  });
});