import mailgun from "mailgun-js";
import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
import aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { uploadAssignment } from "./uploadToGcp.js";

const mailGun = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

export const handler = async (event) => {
  try {
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(message);

    const github_url = message.submission_url;
    const assignment_id = message.assignment_id;
    const email = message.email;
    const account_id = message.account_id;
    console.log(github_url);
    console.log(assignment_id);
    console.log(email);
    console.log(account_id);

    const timestamp = new Date().toString();
    const objectName = `${account_id}/${assignment_id}/${timestamp}.zip`;
    console.log(objectName);

    const status = await uploadAssignment(github_url, objectName);
    console.log(status);

    let email_data = {};
    if (status === "SUCCESS") {
      email_data = {
        from: "Drishti Goda <mailgun@demo.drishtigoda.me>",
        to: email,
        subject: "Assignment Submission",
        text: `Assignnment Submitted Successfully at ${timestamp} and uploaded to ${objectName}`,
      };
    } else {
      email_data = {
        from: "Drishti Goda <mailgun@demo.drishtigoda.me>",
        to: email,
        subject: "Assignment Submission Failed",
        text: "Assignment Submission Failed! Failed to fetch submission URL. Please check the URL and try again.",
      };
    }

    await mailGun.messages().send(email_data);
    console.log("Email sent");

    const docClient = new aws.DynamoDB.DocumentClient();
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        Id: uuidv4(),
        Assignment_id: assignment_id,
        Github_url: github_url,
        Status: status,
        Timestamp: timestamp.toString(),
        Email: email,
        BucketLocation: objectName,
      },
    };
    console.log(JSON.stringify(params));

    await docClient.put(params).promise();
    console.log("Email information added to DynamoDB");
  } catch (error) {
    console.log(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
};
