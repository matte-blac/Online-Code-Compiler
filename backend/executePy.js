const { exec } = require("child_process");

//Executes a Python script and returns its standard output or error message as a Promise
const executePy = (filepath) => {
  return new Promise((resolve, reject) => {
    //Use the exec method to execute the Python script
    exec(`python "${filepath}"`, (error, stdout, stderr) => {
      if (error || stderr) {
        //Reject the Promise with an object containing the error and stderr message
        reject({ error, stderr });
      } else {
        //Resolve the Promise with the standard output of the Python script
        resolve(stdout);
      }
    });

    setTimeout(() => {
      reject("Execution timed out");
    }, 5000);
  });
};

module.exports = {
  executePy,
};
