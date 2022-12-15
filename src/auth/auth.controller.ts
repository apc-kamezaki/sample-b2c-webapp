import { Request, Response } from 'express';
import 'express-session';
import 
msal,
{
  Configuration,
  LogLevel,
  AuthorizationUrlRequest,
  AuthorizationCodeRequest
} from '@azure/msal-node';

const tenantName = process.env.B2C_TENANT_NAME || '';
const policyName = process.env.B2C_SIGNUP_SIGNIN_POLICY || '';
const authority = process.env.B2C_AUTHORITY_DOMAIN || '';
const authRedirectUrl = process.env.AUTH_REDIRECT_URL || '';
const clientConfig: Configuration = {
  auth: {
    clientId: process.env.B2C_APPLICATION_ID || '',
    authority: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}`,
    clientSecret: process.env.B2C_APPLICATION_SECRET || '',
    knownAuthorities: [authority, `${tenantName}.b2clogin.com`],
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel, message, containsPii) {
        if (containsPii) return;  // no logging when message contains personal information
        switch (logLevel) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          default:
            console.debug(message);
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose
    }
  }
}
const clientApp = new msal.ConfidentialClientApplication(clientConfig);

const AppStateType = {
  SIGNIN: 'signin',
  SIGNOUT: 'signout'
} as const;
type AppState = typeof AppStateType[keyof typeof AppStateType];

const getAuthCode = async (policy: string, state: AppState, resp: Response) => {
  const scopes: string[] = [];
  const authRequest: AuthorizationUrlRequest = {
    redirectUri: authRedirectUrl,
    authority: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policy}`,
    scopes,
    state
  };

  try {
    const response = await clientApp.getAuthCodeUrl(authRequest);
    resp.redirect(response);
  } catch (error) {
    console.error(error);
    resp.status(500).send(error);
  }
}

export const signIn = (_req: Request, resp: Response) => {
  getAuthCode(policyName, AppStateType.SIGNIN, resp);
};

const signOutUri = process.env.SIGNOUT_REDIRECT_URL;
const signOutEntryPoint = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}/oauth2/v2.0/logout?post_logout_redirect_uri=${signOutUri}`
export const signOut = (req: Request, resp: Response) => {
  req.session.destroy(() => {
    resp.redirect(signOutEntryPoint);
  });
};

export const redirect = (req: Request, resp: Response) => {
  if (req.query.state === AppStateType.SIGNIN) {
    const scopes: string[] = [];
    const authRequest: AuthorizationCodeRequest = {
      redirectUri: authRedirectUrl,
      authority: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${policyName}`,
      code: req.query.code as string,
      scopes
    }
    clientApp.acquireTokenByCode(authRequest)
    .then((response) => {
      req.session.isAuthenticated = true;
      req.session.sessionParams = { user: response.account, idToken: response.idToken};
      resp.render('auth/signin', {showSignInButton: false, name: response.account?.idTokenClaims?.name})
    })
  } else {
    resp.status(500).send('do not recognize this response');
  }
};
