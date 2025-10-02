import { CompanyRolePermissions } from "@/types/companyRole.types";

// Interface for a single permission object in the array
interface Permission {
  name: string; // e.g., "view", "create"
}

// Interface for a single element in the input array
interface InputFeature {
  groupName: keyof CompanyRolePermissions; // e.g., "dashboard", "users"
  permissions: Permission[];
}

// Define the structure of the final output object
// This uses an Index Signature: [key: string] means any string key is allowed.
interface OutputObject {
  [featureName: string]: {
    [permissionName: string]: boolean;
  };
}

export const generatePermissionsInitialValues = (
  inputArray: InputFeature[]
): OutputObject => {
  return inputArray.reduce((acc: OutputObject, currentItem) => {
    // 1. Get the main feature name (e.g., 'dashboard')
    const featureName = currentItem.groupName;

    // 2. Create the inner permissions object { view: false, create: false, ... }
    const permissionObject = currentItem.permissions.reduce((permAcc, perm) => {
      // Set each permission name as a key with a default value of false
      permAcc[perm.name] = false;
      return permAcc;
    }, {} as { [key: string]: boolean }); // Use 'as' for type assertion on the initial accumulator

    // 3. Assign the inner object to the feature name in the accumulator
    acc[featureName] = permissionObject;

    return acc;
  }, {} as OutputObject); // Use 'as' for type assertion on the initial accumulator
};
