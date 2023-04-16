//Import the child_process, fs and path modules
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

//Create an output directory path
const outputPath = path.join(__dirname, "outputs");

//Check if the directory exists and create it recursively if it doesn't exist
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

//Define a function called executeCpp which takes a file path as an argument
const executeCpp = (filepath) => {
  //Get the job ID from the file name and create a path for the output file
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  //Return a promise which runs a C++ file and resolves the output
  return new Promise((resolve, reject) => {
    //Compile the C++ file and execute the resulting executable
    exec(
      `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && "./${jobId}.out"`,
      (error, stdout, stderr) => {
        if (error || stderr) {
          reject({ error, stderr });
        } else {
          resolve(stdout);
        }
      }
    );

    setTimeout(() => {
      reject("Execution timed out");
    }, 5000);
  });
};

module.exports = {
  executeCpp,
};
