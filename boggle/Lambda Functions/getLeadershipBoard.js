const aws = require('aws-sdk');

exports.handler = async (event, context) => {
    let responseBody = "";
    let statusCode = 0;
    
    try{
        const docClient = new aws.DynamoDB.DocumentClient();
        const { Items = [] } =  await docClient.scan({TableName: "Leadership"}).promise();
        console.log(Items)
        
        //sorting the values fetched from the table
        Items.sort((a,b) => b.score - a.score);
        console.log(Items)
        responseBody = JSON.stringify(Items);
        console.log(responseBody)
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
