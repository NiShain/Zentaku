import { ValidationError as BaseValidationError, NotFoundError } from '../../../shared/utils/error';

export class AlreadyFollowedException extends BaseValidationError {
  constructor(message: string = 'Target is already followed') {
    super(message);
    this.name = 'AlreadyFollowedException';
  }
}

export class NotFollowedException extends NotFoundError {
  constructor(message: string = 'Target is not followed') {
    super(message);
    this.name = 'NotFollowedException';
  }
}

export class SelfFollowException extends BaseValidationError {
  constructor(message: string = 'Cannot follow yourself') {
    super(message);
    this.name = 'SelfFollowException';
  }
}

export class ValidationException extends BaseValidationError {
  constructor(message: string = 'Validation error') {
    super(message);
    this.name = 'ValidationException';
  }
}
