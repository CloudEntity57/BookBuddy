import { environment } from "../../../environments/environment";
import { AuthConfig } from 'angular-oauth2-oidc';

export const googleAuthConfig: AuthConfig = {
    issuer: 'https://accounts.google.com',
    strictDiscoveryDocumentValidation: false,
    redirectUri: 'http://localhost:4200',
    clientId: `${environment.oauthClientId}`,
    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
    // dummyClientSecret: 'secret',
    scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile',
    responseType: 'code',
    showDebugInformation: true,
    useSilentRefresh: true,
    silentRefreshRedirectUri: 'http://localhost:4200' + '/silent-refresh.html',
    timeoutFactor: 0.75,
    sessionChecksEnabled: true,
    // useHttpBasicAuth: false,
    customQueryParams: {
        access_type: 'offline',
        prompt: 'consent',
    }
}