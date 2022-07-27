const aws = require('aws-sdk');

exports.handler = async (event, context) => {
    let responseBody = "";
        let statusCode = 0;
    
    try{
        const docClient = new aws.DynamoDB.DocumentClient();
        const userID = event["userID"]
        const params = {
        TableName: "UserDetails",
        Key: {
            userID: userID
          }
    };
        
        //fetches the values for the provided userID
        const Item = await docClient.get(params).promise()
        console.log(Item)
        responseBody = JSON.stringify(Item);
        statusCode = 204;
        
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
        body: responseBody
    };
     

    return response;
};
