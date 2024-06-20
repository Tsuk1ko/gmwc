export const stringify = (data: Record<string, any>) => new URLSearchParams(data).toString();
