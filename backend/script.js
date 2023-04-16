//Import required modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

//Import custom modules
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const Job = require("./models/Job");

//Connect to database
main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/compilerapp");
    console.log("Succesfully connnected to database!");
  } catch (err) {
    console.error("Failed to connect to database: ", err);
  }
}

//Create express app
const app = express();

//Use cors middleware
app.use(cors());

//Use body-parser middleware for handling form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Define route for checking job status
app.get("/status", async (req, res) => {
  const jobId = req.query.id;
  console.log("status requested", jobId);

  if (jobId == undefined) {
    return res
      .status(400)
      .json({ success: false, error: "missing id query param" });
  }
  try {
    constjob = await Job.findById(jobId);

    if (job === undefined) {
      return res.status(400).json({ success: false, error: "invalid job id" });
    }

    return res.status(200).json({ success: true, job });
  } catch (err) {
    return res.status(400).json({ success: false, error: JSON.stringify(err) });
  }
});

//Define route for running code
app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log(language, code.length);

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty Code Body!" });
  }

  let job;

  try {
    // generate file with content from the request
    const filepath = await Promise.race([
      generateFile(language, code),
      new Promise((_, reject) =>
        setTimeout(() => reject("File generation timed out"), 15000)
      ),
    ]);

    //Save the job details in database
    job = await new Job({ language, filepath }).save();
    const jobId = job["_id"];
    console.log(job);

    //Send job ID in response
    res.status(201).json({ success: true, jobId });

    // run the file and send the output in response
    let output;

    job["startedAt"] = new Date();
    if (language === "cpp") {
      //Execute C++ code
      output = await Promise.race([
        executeCpp(filepath),
        new Promise((_, reject) =>
          setTimeout(() => reject("Execution timed out"), 15000)
        ),
      ]);
    } else {
      //Execute Python code
      output = await Promise.race([
        executePy(filepath),
        new Promise((_, reject) =>
          setTimeout(() => reject("Execution timed out"), 15000)
        ),
      ]);
    }

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    //Update the job details in database
    await job.save();
    console.log(job);
  } catch (err) {
    //Handle errors during file generation or execution
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(err);
    await job.save();
    console.log(job);
    //return res.status(500).json({ err });
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000!");
});
