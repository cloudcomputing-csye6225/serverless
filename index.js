import mailgun from "mailgun-js";
import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
import aws from "aws-sdk";
import Mailgun from "mailgun-js";

const mailGun = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

console.log(process.env.MAILGUN_API_KEY);
console.log(process.env.MAILGUN_DOMAIN);

export const handler = async (event) => {
  try {
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(`${message}`);
    console.log(`Submission Url: ${message.submission_url}`);
    console.log(`Assignment id: ${message.assignment_id}`);
    console.log(`Email: ${message.email}`);

    const github_url = message.submission_url;
    const assignment_id = message.assignment_id;
    const email = message.email;
    console.log(github_url);
    console.log(assignment_id);
    console.log(email);

    const accountKey = JSON.parse(
      Buffer.from(process.env.GOOGLE_ACCESS_KEY, "base64").toString("utf-8")
    );
    console.log(accountKey);

    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: accountKey,
    });



    const timestamp = Date.now();
    const bucketName = process.env.GOOGLE_BUCKET_NAME;
    const objectName = `Cloud - ${assignment_id} - ${timestamp}.zip`;
    console.log(bucketName);
    console.log(objectName);

    const project_zip = (await fetch(github_url)).buffer();

    const bucket = storage.bucket(bucketName);
    await bucket.file(objectName).save(project_zip);

    const email_data = {
      from: "Drishti Goda <mailgun@demo.drishtigoda.me>",
      to: email,
      subject: "Assignment Submission",
      text: "Assignnment Submitted Successfully!",
      attachment: project_zip,
    };

    await mailGun.messages().send(email_data);
    console.log("Email sent");

    const document_client = new aws.DynamoDB.DocumentClient();
    const params = {
      TableName: process.env.DYANAMODB_TABLE_NAME,
      Item: {
        AssignmentId: assignment_id,
        Email: email,
        Submission_url: github_url,
        Location: objectName,
      },
    };

    await document_client.put(params).promise();
    console.log("DynamoDB updated");
  } catch (error) {
    console.log(error);
  }
};
