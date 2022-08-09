CSCI 5409 Cloud Computing

JULY 26, 2022

Submitted To Course Instructor : **Robert Hawkey**


Submitted By:

**Meghna Kumar (B00892970)**

**Ankush Mudgal (B00886779)**

**Vatsal Yadav (B00893030)**




Group TA: **Devarshi Vyas**

Group Name : **BatCloud | Group 27**


# **1. Architecture overview**
**Application URL: <http://boggle-game.us-east-1.elasticbeanstalk.com/>**

<img src="https://github.com/Vatsalyadav/boggle-aws/blob/main/readme_images/005.png" />

*Figure 1 - Final Application Architecture Diagram*

**How do all of the cloud mechanisms fit together to deliver your application?**

The above figure (Figure 1) depicts the final architecture of our ‘Boggle Game’ application. The architecture of our application is broadly divided into two primary components: Front-end (User-facing) and Backend. The Front-end deployment of the application consists of a Web App created in ReactJS (with Tailwind for CSS), which is bundled and deployed on AWS Elastic Beanstalk. The User will interact with this Web app through their bowsers. The web app also relies on AWS Cognito for authentication, authorization, and user login management. Once the user has successfully logged in, the gameplay invokes interactions with the Back end, which consists of code that makes calls to the Lambda functions through the REST calls that were created using the AWS API Gateway. The entire back-end component is made up of services such as API Gateway, Lambda, S3, DynamoDB, EventBridge, and SNS.

There are a total of nine APIs in our architecture: addUserDetailsAPI, setUserDetailsAPI, getUserDetailsAPI, subscribeToSNSAPI, getLeadershipboardAPI, updateLeadershipBoardAPI, solveBoggleGridAPI

While in our initial architectures, we wanted to make constant Lambda calls to validate words, we concluded that instead of making an API call for validating each word, which would put significant stress on Lambda, we now have a single API called ‘createGrid’ which will generate the Boggle grid for requested dimensions, and then make an internal call to another Lambda function called ‘solveBoggleGrid’ which will solve the recently generated Boggle Grid and solve it for words from the English language dictionary. This dictionary is picked based on a “switch” flag in the request sent to solveBogglegrid and decides whether the dictionary should be picked from within the code, or should be imported from the SE bucket ‘dictionarybogglegame’. After the complete processing, the API will respond with both the Grid and its solution back to the Frontend, and the validation of the words entered by the user will now take place in the front-end itself [1]. This serves two purposes; it reduces the frequency with which the front-end will have to invoke the Lambda function and would also make the validation process faster as the data for validation would be present in the front-end itself.

The three APIs, setUserDetails, getUserDetails, and getLeadership, are responsible for handling the user-specific information that the application would keep track of and will display for the user (after logging in) on the web app [1]. We have also, pivoted to having the Leaderboard be updated as soon as the scores from gameplay are updated in the DB, which meant that the Leadership Board would now be triggered internally by Lambda functions instead of an API request. This will lead to the application being able to display the latest Leader board rankings, as the data for the board will be updated frequently [1]. The other APIs are responsible for notification management through Eventbridge and SNS. SubscribeToSNSAPI triggers the subscribeToSNS lambda function which is responsible for sending a subscription email to the user using SNS. The other lambda function, publishThroughSNS does not have any API gateway trigger added to it, instead, it is triggered using Event Bridge weekly which is responsible for publishing leaderboard details to all the subscribed users for that SNS topic.

**Where is data stored?**

The user details and in-game statistics which are displayed on the UI are stored and fetched from DynamoDB table ‘UserDetails’. The game’s leadership board is periodically updated and stored in the ‘Leadership’ DynamoDB Table. The S3 bucket ‘dictionarybogglegame’ stores the dictionary file for boggle solving, and last but not least the User authentication information goes to Cognito User Pools.

**What programming languages did you use (and why) and what parts of your application required code?**

The front-end of the application is built on ReactJS and makes use of Tailwind CSS. The backend Lambda functions are all written in Nodejs (AWS-SDK for Javascript), Python (Boto3 Library), and Core Java. NodeJs was used for most lambda functions that performed a curd operation and even for createGrid function. SolveBogglegrid is written in core Java as we wanted to make use of an optimized PrefixTree data structure for solving the grid very quickly, and our team members only knew how to implement a PrefixTree in java. The SNS-related modules are written in python because the boto3 library provided by SNS is very simple to understand and integration of SNS using this library was very convenient.

**How is your system deployed to the cloud?**

Our application is deployed to the cloud by using the AWS Elastic Beanstalk service. Our application's code is built using npm, and then we upload the zip file to the Beanstalk to create a new environment. Initially, when we deployed our application in the development phase, we would provision the services manually which made the back-end components of the application. Once we had created the CloudFormation Template for the application, we started provisioning the resources through CloudFormation, which includes the deployment to Elastic Beanstalk.
# **2. Architecture comparison to original Proposal**
**If your final architecture differs from your original project proposal, explain why that is. What did you learn that made you change technologies or approaches?**

There are few changes in the final architecture as compared to the original project proposal architecture. Initial architecture suggested triggering two lambda functions – send leadership board data periodically and update the leadership board by invoking them from another lambda function. However, to achieve the scenarios mentioned above we have used Amazon EventBridge [2] and API Gateway respectively.


<img src="https://github.com/Vatsalyadav/boggle-aws/blob/main/readme_images/006.png" />


*Figure 2 -Old proposed architecture for the Triggering of SNS through Lambda.*

To use the Simple Notification Service, the initial plan was to write a lambda function (Figure 1) only to send emails using SNS assuming that the subscription list is already updated in the SNS topic. This approach later made us realize that it is technically not possible to have all the users added to the subscription list manually. It was then decided that instead of having one lambda function for SNS, there would be two – one for subscription and another for publishing the messages (Figure 2). The subscription lambda function will be triggered using the API Gateway which is being called from the frontend application on successful signup of the user. After the user has confirmed the subscription, their status in the SNS topic will change from pending confirmation to confirmed and they would become eligible to receive emails later via publish method. Publishing messages through the SNS lambda function will be activated using the Amazon EventBridge, which provides the functionality to schedule the target based on days, hours, or minutes. The event bridge rule in our application will trigger the publish lambda function weekly and which will send the emails to the subscribed users.


<img src="https://github.com/Vatsalyadav/boggle-aws/blob/main/readme_images/007.jpeg" />

*Figure 3 - New Architecture has two different lambdas for Subscription and Publishing.*

To update the leadership details the initial idea was to trigger a lambda function periodically from the update user details API. Later we planned to approach this by creating a separate API trigger for this function as well. Whenever the user successfully played a game both update user details and update leadership board APIs would be triggered. However, the leadership board table will only be updated if it qualifies the criteria of being ahead of any of the values in the leadership board table.

We also planned to store the generated grid and its solution in the DynamoDB table but now this data is being sent directly to the front-end application via the API call in the form of JSON. The front-end application would consume this data and render the boggle grid for the user based on the type of grid selected.

Earlier we were not aware of the Amazon EventBridge resource and had the plan of writing a scheduler code to trigger another lambda within a lambda function. Later when we explored different services offered by AWS, we came across Amazon EventBridge and the ease it offers to schedule any target function with it. While using it we came to know how easy it is to manage a trigger using this. It allows the resources to be provisioned in isolation and does not have any topic dependency like SNS having a Pub/Sub mechanism [3].
# **3. Evolution of Application – Future Features**
**How would your application evolve if you were to continue development? What features might you add next and which cloud mechanisms would you use to implement those features?**

If we were to continue the development, we would have enhanced the UI of the application to be more up-to-date as that of a commercial web game. We would also have had the time to create an Android app for the game that would have utilized the same backend AWS services and the application architecture while having the UI as a mobile application.

In terms of features, we could have ventured into the use of AWS Lex, which is a fully managed artificial intelligence (AI) service with advanced NLP models to design, build, and deploy conversational interfaces in the form of chatbots in applications [4]. We could have included the feature of having a chatbot that provides hints to the players of the game regarding the words that can be found in the Grid. The Grid returned from the backend would have been fed to the Lex bot, which would have been programmed to provide various hints and suggestions regarding the words the user has not yet identified in the grid. This feature would have required the use of AWS Lex for creating a chatbot capable of the above functionality, but Lex bots are usually just interactive and conversational interfaces, to handle the logical processing of the bot, and the real-time management of the bot interactions, we would have used a Lambda function that would be connected to the Lex bot to guide and process the user interactions.

We could also explore the Amazon Transcribe [5] for automatic speech-to-text conversion to add the feature of guessing the Boggle words by speech recognition. By including the speech recognition feature, we could make the game more accessible, interactive, and easier to use.  Another Amazon resource that could have been explored is Amazon Translate, which is a neural machine translation service delivering fast, high-quality, affordable, and customizable language translation [6]. Using this amazon service, we could make our game available globally where language will not be a barrier for people to play this game.
# **4. Data Security and Security Mechanisms**
**How does your application architecture keep data secure at all layers? If it does not, if there are vulnerabilities, please explain where your data is vulnerable and how you could address these vulnerabilities with further work.**

Our application keeps the data secure at many layers of the application. First, we do not collect any personally identifying information (PII) from the users of the application during sign-up, except their names and email ids, which greatly limits the amount of data that requires security considerations. The application only stores their in-game statistics, which is data that has no security implications in case of a data breach. As a free game, we also have no financial information or transactions to make secure. The Grids solved by the players are generated in real-time and then discarded permanently after the game is over. The only sensitive data left to protect is the User Name and User ID they used to sign-up for. Since the authentication and password management are all done through AWS Cognito, we also do not store any credentials of the user in our databases. AWS Cognito provides authentication, authorization, and user management. The two main components of AWS Cognito are User Pools and Identity Pools. User pools are user directories that provide sign-up and sign-in options to the users [7] . The data protection within the AWS Cognito is done by encryption at rest by industry standards [8]. All our APIs are secure POST HTTPS endpoints with Throttling enabled, this protects the data in transit and also against denial-of-service attacks.

While our application has minimal security or privacy impacts, we did identify a data protection vulnerability in our application that can be dealt with in future iterations of the application. While we do not store the user’s passwords in our databases, we do store the user’s email id and User name in our Leadership board DynamoDB table, which is only made secure by making it a private table that has no external read-write access and can only be updated via Lambda functions invoked through secure HTTPS APIs. However, in case of a breach, the email Ids and the corresponding names of the users would be vulnerable information. In the future, we could implement an encryption mechanism that encrypts this information before writing it to the DynamoDB tables for also having encryption at rest. Another improvement to the current security and data protection system would be to have an explicit token exchange mechanism to make the API calls more secure as per the ‘Security in Cloud’ principle which posits that we should also be responsible for adding added security measures on top of the Security of the cloud that AWS provides [9]. Since the security of applications in AWS follows a shared responsibility model, in the future we could also stress the consumer responsibility for security by adding more authentication layers.

**Which security mechanisms are used to achieve the data security described in the previous question? List them, and explain any choices you made for each mechanism (technology you used, algorithm, cloud provider service, etc.)**

For the security mechanisms in our application, we rely heavily on the ‘Security of the Cloud’ responsibility that AWS takes, primarily because we do not have a lot of sensitive data to protect as the Boggle game has very less sensitive information which is being processed through the application. The only sensitive data to protect is the User Name and User ID they used to sign-up, against which we store the in-game statistics. This information is stored safely in a private DynamoDB Table, with access control enabled by AWS IAM, and has very limited access. We opted for the basic security safeguards mechanisms and followed the best practices for security in the Cloud, such as securing our endpoints, following the principle of least privilege, enabling monitoring, and securely destroying information that is not of use anymore.

Next, all communication between the front-end (React app deployed on Elastic Beanstalk) and the back-end (Lambda functions and DynamoDB tables) of the application is done through secure REST API calls that were created via AWS API Gateway, which is a fully managed amazon service that makes it easy for developers to create, publish, maintain, monitor, and deploy secure and scalable APIs [10]. APIs made using AWS API Gateway have data protection policies and work on the principle of least privilege by providing only specific IAM roles the access to creating and modifying APIs [11]. We also make use of the Amazon Cognito User Pools in our application which let us create customizable authentication and authorization solutions for our REST APIs. Amazon Cognito user pools are used to control who can invoke REST API methods [12]. We use this to make secure API calls from the UI to the backend Lambda functions that are connected to the API Gateway through the ‘Lambda Proxy’ integration. Furthermore, the CRUD operations performed on the DynamoDB tables are also done through Lambda functions which make use of the AWS SDKs for Javascript, which make secure functional calls through secure Clients to perform the operations.
# **5. Reproduction in Private Cloud Analysis**
To reproduce the architecture in a private cloud, we will have to purchase resources for frontend and backend compute servers. While it will be challenging to match the availability provided by AWS, we will add redundant servers for downtimes and increase availability. Our organization will also need a MongoDB usage license [13] for using and storing game scoreboards. In our current architecture, the load balancing is being managed by Elastic Beanstalk and we'll need routers to replicate the load balancing in a private cloud. We will also need TLS (Transport Layer Security) for making secure communications [14]. **Table 1** below shows the yearly cost estimates for the resources mentioned:

*Table 1: Yearly cost estimates for reproducing the architecture on Private Cloud*

|Resource|Requirement|Yearly Cost Estimate|
| :- | :- | :- |
|Compute Servers for Frontend|1|1 \* 2500 = $2500|
|Compute Servers for Backend|1|1 \* 2500 = $2500|
|MongoDB License|1|1 \* 684   = $684|
|Redundant Servers for frontend and backend|4|4 \* 2500 = $10000|
|Redundant Storage Server|1|1 \* 1500 = $1500|
|TLS Certificate|1|1 \* 300   = $300|
|Load Balancing Router|1|1 \* 3200 = $3200|
|Total||$20684|
# **6. Budget Control and Monitoring**
**Which cloud mechanism would be most important for you to add monitoring to in order to make sure costs do not escalate out of budget unexpectedly?**

The most important cloud mechanism for our application is AWS Lambda which we should monitor to make sure that the costs do not escalate. The backend of our application is supported by Lambda functions and our application uses a total of nine lambda functions. These lambda functions provide the core functionalities of our application like the creation of a grid, finding solutions, subscribing to and receiving leadership board weekly updates using Amazon SNS, etc. They also help in creating the grid data for various game difficulty levels and the possible list of words for the generated grids. The scoreboard and leadership board are also updated and fetched using the lambda functions, with its interaction with DynamoDB. Since AWS Lambda provides us with the core functionalities of the application and interacted most frequently during the application use, it has the potential to cost the most money. The lambda functions are triggered using the REST APIs created by using the API Gateway service, which is another resource that would require monitoring, especially because APIs are also prone to a potential distributed denial-of-service (DDoS) attack for disrupting the services to the normal traffic. Hence, AWS Lambda is the most important Cloud Mechanism to add monitoring for making sure that its usage cost does not escalate out of the budget, followed by AWS API Gateway as a close second.


# **7. Cloud Formation**
<img src="https://github.com/Vatsalyadav/boggle-aws/blob/main/readme_images/cloud-formation.jpeg" />

*Figure 4 - Cloud Formation diagram for the AWS Cloud Mechanisms*



# **References**



|||
| :- | :- |
|[1] |A. Mudgal, M. Kumar and V. Yadav, "Project Proposal, Deployment, and Delivery Model Critical Analysis, and Responses," Dalhousie University, Halifax, 2022.|
|[2] |Amazon Web Services, Inc, "Amazon EventBridge," Amazon Web Services, Inc, 2022. [Online]. [Accessed July 2022].|
|[3] |Dashbird, "EventBridge Main Benefits and Characteristics," Dashbird, 2022. [Online]. [Accessed July 2022].|
|[4] |Amazon Web Services, Inc., "Amazon Lex," Amazon Web Services, Inc., 2022. [Online]. Available: https://aws.amazon.com/lex/. [Accessed 01 June 2022].|
|[5] |Amazon Web Services, Inc, "Amazon Transcribe," Amazon Web Services, Inc, 2022. [Online]. [Accessed 2022].|
|[6] |Amazon Web Services, Inc, "Amazon Translate," Amazon Web Services, Inc, 2022. [Online]. [Accessed July 2022].|
|[7] |Amazon Web Services, Inc, "What is Amazon Cognito?," Amazon Web Services, Inc, 2022. [Online]. [Accessed July 2022].|
|[8] |Amazon Web Services, Inc, "Data Protection in Amazon Cognito," Amazon Web Services, Inc, 2022. [Online]. [Accessed July 2022].|
|[9] |Amazon Web Services, Inc., "Security in Amazon API Gateway," Amazon Web Services, Inc., 2022. [Online]. Available: https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html. [Accessed 25 July 2022].|
|[10] |Amazon Web Services, Inc., "Amazon API Gateway," Amazon Web Services, Inc., 2022. [Online]. Available: https://aws.amazon.com/api-gateway/. [Accessed 28 May 2022].|
|[11] |Amazon Web Services, Inc., "Security best practices in Amazon API Gateway," Amazon Web Services, Inc., 2022. [Online]. Available: https://docs.aws.amazon.com/apigateway/latest/developerguide/security-best-practices.html. [Accessed 25 July 2022].|
|[12] |Amazon Web Services, Inc., "Controlling and managing access to a REST API in API Gateway," Amazon Web Services, Inc., 2022. [Online]. Available: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html. [Accessed 25 July 2022].|
|[13] |MongoDB, "MongoDB Pricing," MongoDB, 2022. [Online]. Available: https://www.mongodb.com/pricing. [Accessed 25 July 2022].|
|[14] |DigiCert, Inc., "COMPARE TLS/SSL CERTIFICATES," DigiCert, Inc., 2022. [Online]. Available: https://www.digicert.com/tls-ssl/compare-certificates. [Accessed 26 July 2022].|
