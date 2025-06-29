import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFriendDto } from './create-friend.dto';

describe('CreateFriendDto', () => {
  it('should pass validation for valid data', async () => {
    const dto = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: 'cerveja',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation without preferredDrink (optional field)', async () => {
    const dto = plainToClass(CreateFriendDto, {
      name: 'Alice',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation if preferredDrink is too short', async () => {
    const dto = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: 'abc',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.minLength).toContain('at least 4 characters');
  });

  it('should fail validation if preferredDrink is too long', async () => {
    const dto = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: 'a'.repeat(101),
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.maxLength).toContain(
      'cannot exceed 100 characters',
    );
  });

  it('should transform preferredDrink to lowercase', () => {
    const dto = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: 'CERVEJA',
    });

    expect(dto.preferredDrink).toBe('cerveja');
  });

  it('should trim whitespace from preferredDrink', () => {
    const dto = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: '  cerveja  ',
    });

    expect(dto.preferredDrink).toBe('cerveja');
  });

  it('should handle null/undefined values correctly', () => {
    const dto1 = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: null
    });

    const dto2 = plainToClass(CreateFriendDto, {
      name: 'Alice',
      preferredDrink: undefined
    });

    expect(dto1.preferredDrink).toBeNull();
    expect(dto2.preferredDrink).toBeUndefined();
  });
});
