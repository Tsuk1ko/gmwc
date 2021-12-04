export class Cookie extends Map<string, string> {
  constructor(cookie: string) {
    super(
      cookie.split(';').map(kvStr => {
        const [key, ...value] = kvStr.split('=');
        return [key.trim(), value.join('=').trim()];
      }),
    );
  }

  toString(): string {
    return Array.from(this.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }
}
