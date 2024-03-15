import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { promisify } from "util";

const uuidToMongooseObjectId = (uuid) => {
  const hexString = uuid.replace(/-/g, "");
  const objectId = "";

  const combinedString =
    objectId.slice(0, objectId.length - hexString.length) + hexString;

  const truncatedString = combinedString.substring(0, 24);
  return truncatedString;
};

const hashAsync = promisify(bcrypt.hash);

const handlePostRequests = (url) => {
  return async (req, res, next) => {
    if (req.method === "POST") {
      const path = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

      const mongooseObjectId = uuidToMongooseObjectId(uuidv4());

      const recursiveBcrypt = async (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            await recursiveBcrypt(obj[key]);
          } else if (key === "password") {
            await bcryptPassword(obj, key);
          }
        }
      };

      const bcryptPassword = async (obj, key) => {
        const hashedPassword = await hashAsync(obj[key], 10);

        obj[key] = hashedPassword;
      };

      await recursiveBcrypt(req.body);

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
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        console.log("Response:", responseData);
      } catch (error) {
        console.error("Example-req-handler  Error:");
      }
    }

    next();
  };
};

export default handlePostRequests;
