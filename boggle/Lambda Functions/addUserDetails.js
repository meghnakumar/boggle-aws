const aws = require('aws-sdk');

//Code Reference: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-query-scan.html
exports.handler = async (event, context) => {
    let responseBody = "";
        let statusCode = 0;
    
    try{
        const docClient = new aws.DynamoDB.DocumentClient();
        const userID = event.userID
        const EasyGames = 0
        const MediumGames = 0
        const HardGames = 0
        const EasyScore = 0
        const MediumScore = 0
        const HardScore = 0
        const EasyBest = 0
        const MediumBest = 0
        const HardBest = 0
    
        const params = {
        TableName: "UserDetails",
        Item: {
            userID: userID,
            EasyGames: EasyGames,
            MediumGames: MediumGames,
            HardGames: HardGames,
            EasyScore: EasyScore,
            MediumScore:MediumScore,
            HardScore:HardScore,
            EasyBest:EasyBest,
            MediumBest:MediumBest,
            HardBest:HardBest
            
            
            
        },
    };
        const data = await docClient.put(params).promise();
        console.log(data)
        responseBody = JSON.stringify(data);
        statusCode = 201;
        
    }catch (err) {
        console.log(err);
        const message = `Error`;
        console.log(message);
        throw new Error(message);
    }

const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: "User added"
    };
    return response;
};
