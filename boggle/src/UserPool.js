import {CognitoUserPool} from "amazon-cognito-identity-js";
// Code Reference : https://aws.amazon.com/cognito/
// Code Reference : https://github.com/aws-amplify/amplify-js
const poolData = {
    UserPoolId: "us-east-1_qBFz0VdnL",
    ClientId: "17ku5qs1kbtrqpm3p1qmjee59"
}

export default new CognitoUserPool(poolData);