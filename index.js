import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const uuidToMongooseObjectId = (uuid) => {
  const hexString = uuid.replace(/-/g, "");
  const objectId = "";

  const combinedString =
    objectId.slice(0, objectId.length - hexString.length) + hexString;

  const truncatedString = combinedString.substring(0, 24);
  return truncatedString;
};

const handlePostRequests = async (req, res, next) => {
  console.log(req.method, "req.method..........");
  if (req.method === "POST") {
    const path = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("path : ", path);
    console.log("Request Body:", req.body);

    const mongooseObjectId = uuidToMongooseObjectId(uuidv4());

    const data = {
      companyId: mongooseObjectId,
      eventPayload: req.body,
      eventName: path,
    };

    console.log(data, "data");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(
        "http://localhost:9090/api/event/create",
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      console.log("Response:", responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  next();
};

export default handlePostRequests;
