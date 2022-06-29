import {CognitoUserPool} from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_gAgeoka1O",
    ClientId: "59skhv0709c1hsmv9fbo4b0iru"
}

export default new CognitoUserPool(poolData);