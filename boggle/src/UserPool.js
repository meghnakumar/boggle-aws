import {CognitoUserPool} from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_2cKW1SX9e",
    ClientId: "43sle14hef0f71hhfgm65c0fca"
}

export default new CognitoUserPool(poolData);