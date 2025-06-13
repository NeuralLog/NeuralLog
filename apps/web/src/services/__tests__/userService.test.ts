import {
  getCurrentUser,
  getUserById,
  getUsersByTenant,
  isUserInTenant,
  addUserToTenant,
  removeUserFromTenant
} from '../userService';

// Mock console.log and console.error to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return the mock current user', async () => {
      // Act
      const user = await getCurrentUser();

      // Assert
      expect(user).toEqual({
        id: 'mock-user-id',
        firstName: 'Test',
        lastName: 'User',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        isSignedIn: true
      });
    });
  });
  
  describe('getUserById', () => {
    it('should return a mock user by ID', async () => {
      // Act
      const user = await getUserById('user_123');

      // Assert
      expect(user).toEqual({
        id: 'user_123',
        firstName: 'User',
        lastName: 'user_',
        emailAddresses: [{ emailAddress: 'user-user_@example.com' }]
      });
    });

    it('should return a user with different ID', async () => {
      // Act
      const user = await getUserById('test_456');

      // Assert
      expect(user).toEqual({
        id: 'test_456',
        firstName: 'User',
        lastName: 'test_',
        emailAddresses: [{ emailAddress: 'user-test_@example.com' }]
      });
    });
  });
  
  describe('getUsersByTenant', () => {
    it('should return mock users for a tenant', async () => {
      // Act
      const users = await getUsersByTenant('test-tenant');

      // Assert
      expect(users).toEqual([
        {
          id: 'user_1',
          firstName: 'John',
          lastName: 'Doe',
          emailAddresses: [{ emailAddress: 'john.doe@example.com' }]
        },
        {
          id: 'user_2',
          firstName: 'Jane',
          lastName: 'Smith',
          emailAddresses: [{ emailAddress: 'jane.smith@example.com' }]
        }
      ]);
    });
  });
  
  describe('isUserInTenant', () => {
    it('should return true for any user in tenant (mock implementation)', async () => {
      // Act
      const result = await isUserInTenant('user_123', 'test-tenant');

      // Assert
      expect(result).toBe(true);
    });
  });
  
  describe('addUserToTenant', () => {
    it('should add a user to a tenant and log the action', async () => {
      // Act
      const result = await addUserToTenant('user_123', 'test-tenant', false);

      // Assert
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Adding user user_123 to tenant test-tenant with admin=false');
    });
  });
  
  describe('removeUserFromTenant', () => {
    it('should remove a user from a tenant and log the action', async () => {
      // Act
      const result = await removeUserFromTenant('user_123', 'test-tenant');

      // Assert
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Removing user user_123 from tenant test-tenant');
    });
  });
});
