export const discountTargets = ['product', 'order', 'category', 'brand', 'free_shipping'] as const;

export const discountMethods = ['code', 'automatic'] as const;

export const discountValueTypes = ['percentage', 'fixed_amount'] as const;

export const discountEligibilities = ['all_users', 'custom_users'] as const;

export const discountSorts = [
  'created-ascending',
  'created-descending',
  'usage-ascending',
  'usage-descending',
  'expires-ascending',
  'expires-descending',
] as const;
