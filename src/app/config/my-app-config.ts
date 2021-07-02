export default {

    // okta.com
    // Applications - My Luv2Shop App
    oidc: {
        clientId: '0oa12zr3dou2IJI525d7', // Client ID
        issuer: 'https://dev-29400137.okta.com/oauth2/default', // https:// + Okta domain + /oauth2/default
        redirectUri: 'http://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email']
    }

}
