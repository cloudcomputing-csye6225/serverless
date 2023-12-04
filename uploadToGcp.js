import { error } from "console";
import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";


export const uploadAssignment = async (github_url, objectName) => {
  let status;
  try {
    const accountKey = JSON.parse(
      Buffer.from(process.env.GOOGLE_ACCESS_KEY, "base64").toString("utf-8")
    );

    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: accountKey,
    });

    const bucketName = process.env.GOOGLE_BUCKET_NAME;
    const asset = await fetch(github_url);

    if (asset.ok) {
      const project_zip = asset.buffer();

      const bucket = storage.bucket(bucketName);
      await bucket.file(objectName).save(project_zip);

      console.log("File uploaded successfully");

      status = "SUCCESS";
    } else {
      console.log("File upload failed");
      status = "FAILURE";
    }
  } catch (error) {
    console.log("Upload failed", error.message);
    status = "FAILURE";
  }
  return status;
};