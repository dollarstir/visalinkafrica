/**
 * Permission checking utility
 * Use this to check if a user has a specific permission
 */

export const hasPermission = (user, permissionCode) => {
  if (!user || !user.permissions) {
    return false;
  }

  // Admins have all permissions
  if (user.role === 'admin') {
    return true;
  }

  // Check if user has the permission
  return user.permissions[permissionCode] === true;
};

export const hasAnyPermission = (user, permissionCodes) => {
  if (!user || !user.permissions) {
    return false;
  }

  // Admins have all permissions
  if (user.role === 'admin') {
    return true;
  }

  // Check if user has any of the permissions
  return permissionCodes.some(code => user.permissions[code] === true);
};

export const hasAllPermissions = (user, permissionCodes) => {
  if (!user || !user.permissions) {
    return false;
  }

  // Admins have all permissions
  if (user.role === 'admin') {
    return true;
  }

  // Check if user has all of the permissions
  return permissionCodes.every(code => user.permissions[code] === true);
};

