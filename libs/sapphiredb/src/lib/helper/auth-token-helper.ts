export class AuthTokenHelper {
  public static parseJwt(token?: string): any {
    if (!token) {
      return undefined;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return undefined;
    }
  }

  public static tokenValid(token?: string): boolean {
    if (!token) {
      return true;
    }

    const expireTimestamp: number = AuthTokenHelper.parseJwt(token)?.exp;

    if (!expireTimestamp) {
      return false;
    }

    return new Date() <= new Date(expireTimestamp * 1000);
  }
}
