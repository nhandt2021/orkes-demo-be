import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import md5 from "md5";

const app = express();
const port = 3000;

const BASE_URL = "https://play.orkes.io/api";

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.options("*", cors()); // enable pre-flight request for DELETE request
app.get("/workflow/:id", cors(), async (req, res) => {
  const { id } = req.params;

  // https://play.orkes.io/execution/f9a9d984-2e51-11ed-85d6-da345edc3cc9?tabIndex=4
  const response = await fetch(`${BASE_URL}/workflow/${id}`, {
    headers: {
      accept: "*/*",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-authorization": req.headers["x-authorization"],
    },
    referrerPolicy: "strict-origin",
    method: "GET",
    mode: "cors",
    credentials: "include",
  });

  const data = await response.json();
  // console.log("Result =====", data, req.params);

  return res.send(data);
});

const getWorkflowByCorrelationId = async ({
  workflowName,
  correlationId,
  token,
}) => {
  const response = await fetch(
    `${BASE_URL}/workflow/${workflowName}/correlated/${correlationId}`,
    {
      headers: {
        "x-authorization": token,
      },
      referrer: "https://play.orkes.io/",
      referrerPolicy: "strict-origin",
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );

  const data = await response.json();
  console.log("getWorkflowByCorrelationId Result =====", data);

  return data;
};

app.post("/workflow", cors(), async (req, res) => {
  const { url } = req.body;

  if (url) {
    const urlMD5 = md5(url);
    const workflows = await getWorkflowByCorrelationId({
      workflowName: "VisualImageSearch",
      correlationId: urlMD5,
      token: req.headers["x-authorization"],
    });

    if (Array.isArray(workflows) && workflows.length) {
      return res.send(workflows[0].workflowId);
    }

    const response = await fetch(`${BASE_URL}/workflow`, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-authorization": req.headers["x-authorization"],
      },
      referrer: "https://play.orkes.io/",
      referrerPolicy: "strict-origin",
      body: JSON.stringify({
        name: "VisualImageSearch",
        version: "13",
        correlationId: urlMD5,
        input: { imageUrl: url },
      }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    const data = await response.text();
    // console.log("Workflow Result =====", data, url);

    return res.send(data);
  }

  // console.log("Workflow Bad request =====", req.body);

  return res.sendStatus(400);
});

app.post("/videoWorkflow", cors(), async (req, res) => {
  const { url } = req.body;

  if (url) {
    const urlMD5 = md5(url);
    const workflows = await getWorkflowByCorrelationId({
      workflowName: "video_thumbnail_generator",
      correlationId: urlMD5,
      token: req.headers["x-authorization"],
    });

    if (Array.isArray(workflows) && workflows.length) {
      return res.send(workflows[0].workflowId);
    }

    const response = await fetch(`${BASE_URL}/workflow`, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-authorization": req.headers["x-authorization"],
      },
      referrer: "https://play.orkes.io/",
      referrerPolicy: "strict-origin",
      body: JSON.stringify({
        name: "video_thumbnail_generator",
        version: "1",
        correlationId: urlMD5,
        input: {
          fileLocation: url,
          outputFileFormat: "png",
        },
      }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    const data = await response.text();
    console.log("videoWorkflow Result =====", data, url);

    return res.send(data);
  }

  // console.log("videoWorkflow Bad request =====", req.body);

  return res.sendStatus(400);
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
