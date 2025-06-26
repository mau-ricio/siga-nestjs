import { validate } from 'class-validator';
import { CreateFriendDto } from './create-friend.dto';

describe('CreateFriendDto', () => {
  it('should validate successfully with valid phone number', async () => {
    const dto = new CreateFriendDto();
    dto.name = 'Alice';
    dto.phoneNumber = '+5511999887766'; // Valid international format

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid phone number', async () => {
    const dto = new CreateFriendDto();
    dto.name = 'Bob';
    dto.phoneNumber = 'invalid-phone';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('phoneNumber');
  });

  it('should validate successfully without phone number (optional)', async () => {
    const dto = new CreateFriendDto();
    dto.name = 'Charlie';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation without name (required)', async () => {
    const dto = new CreateFriendDto();
    dto.phoneNumber = '+5511999887766';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
});
