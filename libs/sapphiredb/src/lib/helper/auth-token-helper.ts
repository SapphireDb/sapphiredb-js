export class AuthTokenHelper {
  // public static validateAuthToken$(authToken: string, options: SapphireDbOptions): Observable<AuthTokenState> {
  //   const checkAuthTokenUrl = `${options.useSsl ? 'https' : 'http'}://${options.serverBaseUrl}/sapphire/authToken`;
  //
  //   return from(axios.post(checkAuthTokenUrl, null, {
  //     headers: {
  //       Authorization: `Bearer ${authToken}`
  //     }
  //   })).pipe(
  //     map((response: AxiosResponse<boolean>) => response.data),
  //     map((authTokenValid: boolean) => authTokenValid ? AuthTokenState.valid : AuthTokenState.invalid),
  //     catchError(error => {
  //       if (error?.response?.status === 401) {
  //         return of(AuthTokenState.invalid);
  //       }
  //
  //       return of(AuthTokenState.error);
  //     })
  //   );
  // }
}
