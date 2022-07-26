const aws = require('aws-sdk');

//Code Reference: https://stackoverflow.com/a/41915521
exports.handler = async (event, context) => {
    let responseBody = "";
    let statusCode = 0;
    
    try{
        const docClient = new aws.DynamoDB.DocumentClient();
        const lambda = new aws.Lambda();
       
        //storing the input values into constants
        const userID = event['userID']
        const EasyGames = event['EasyGames']
        const MediumGames = event['MediumGames']
        const HardGames = event['HardGames']
        const EasyScore = event['EasyScore']
        const MediumScore = event['MediumScore']
        const HardScore = event['HardScore']
        const EasyBest = event['EasyBest']
        const MediumBest = event['MediumBest']
        const HardBest = event['HardBest']
        
        //defining the params for passing to dynamo DB table
        const params = {
        TableName: "UserDetails",
        Key: {
            userID: userID
        },
        UpdateExpression: "set EasyGames = :EasyGames, MediumGames = :MediumGames, HardGames = :HardGames, EasyScore = :EasyScore, MediumScore = :MediumScore, HardScore = :HardScore,EasyBest = :EasyBest, MediumBest = :MediumBest, HardBest = :HardBest",
        ExpressionAttributeValues: {
            ":EasyGames": EasyGames,
            ":MediumGames": MediumGames,
            ":HardGames": HardGames,
            ":EasyScore": EasyScore,
            ":MediumScore": MediumScore,
            ":HardScore": HardScore,
            ":EasyBest": EasyBest,
            ":MediumBest": MediumBest,
            ":HardBest": HardBest
        },
        ReturnValues: "UPDATED_NEW"
    };
        
        //using the update method of docClient
        const data = await docClient.update(params).promise();
        console.log(data)
        responseBody = JSON.stringify(data);
        statusCode = 204;
              console.log(responseBody)
              const response = {
                    statusCode: statusCode,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: responseBody
                };

            return response;

              }
        
    //catch block incase something breaks above
    catch (err) {
        console.log(err);
        const message = `Error`;
        console.log(message);
        throw new Error(message);
    }

}
