export function canManageResource(
  role: string | undefined,
  userId: string,
  ownerId: string
): boolean {
  return role === "admin" || userId === ownerId;
}
