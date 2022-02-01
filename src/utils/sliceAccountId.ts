export default function sliceAccountId(id: string): string {
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}
