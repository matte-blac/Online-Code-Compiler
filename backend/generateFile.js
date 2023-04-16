const fs = require("fs");
const path = require("path");

//Import the uuid module for generating unique identifiers
const { v4: uuid } = require("uuid");

//Define the directory for sstoring generated files
const dirCodes = path.join(__dirname, "codes");

//If the directory doesn't exist, create it recursively
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (format, content) => {
  //Generate a unique ID for the file name
  const jobID = uuid(); // create a unique path
  //Concatenate the format with the unique ID to ceate the file name
  const fileName = `${jobID}.${format}`;
  //Join the 'codes' directory with the file name to create the filepath
  const filepath = path.join(dirCodes, fileName);

  //Write the content to the fil and return a Promise that resolves
  //with or rejects with an error message if the write operation times out
  return Promise.race([
    new Promise((resolve) => {
      fs.writeFileSync(filepath, content); //write the content in that file
      resolve(filepath);
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject("File write timed out"), 5000)
    ),
  ]);
};

module.exports = {
  generateFile,
};
