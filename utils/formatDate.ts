export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Format date as MM/DD
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
