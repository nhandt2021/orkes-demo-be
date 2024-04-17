import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import md5 from "md5";
import {
  orkesConductorClient,
  WorkflowExecutor,
} from "@io-orkes/conductor-javascript";

const app = express();
const port = 3001;

const BASE_URL = "https://play.orkes.io/api";

const clientPromise = orkesConductorClient({
  keyId: "1762bb98-6752-4f39-958e-7197aceed947", // optional
  keySecret: "fqEOEjla1Dm8KFJ8uTSMqmeYTw6aR2hwktd81RsZdkiSMcXB", // optional
  serverUrl: "https://orkesdev.orkesconductor.com/api",
});

const client = await clientPromise;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.options("*", cors()); // enable pre-flight request for DELETE request
app.get("/workflow/:id", cors(), async (req, res) => {
  const { id } = req.params;
  const { host } = req.query;

  const path = host ? `${host}/api` : BASE_URL;

  // https://play.orkes.io/execution/f9a9d984-2e51-11ed-85d6-da345edc3cc9?tabIndex=4
  const response = await fetch(`${path}/workflow/${id}`, {
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
  host,
}) => {
  const path = host ? `${host}/api` : BASE_URL;

  const response = await fetch(
    `${path}/workflow/search?${new URLSearchParams({
      query: `correlationId='${correlationId}' AND status='COMPLETED' AND workflowType='${workflowName}'`,
    })}`,
    {
      headers: {
        "x-authorization": token,
      },
      method: "GET",
    }
  );

  const data = await response.json();
  console.log(
    "getWorkflowByCorrelationId Result =====",
    workflowName,
    correlationId,
    data
  );

  return data?.results;
};

app.post("/workflow", cors(), async (req, res) => {
  const { url, host, workflowName, workflowVersion } = req.body;

  if (url) {
    const urlMD5 = md5(url);
    const workflows = await getWorkflowByCorrelationId({
      workflowName: workflowName || "VisualImageSearch",
      correlationId: urlMD5,
      token: req.headers["x-authorization"],
      host,
    });

    if (Array.isArray(workflows) && workflows.length > 0) {
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
        name: workflowName || "VisualImageSearch",
        version: workflowVersion || "13",
        correlationId: urlMD5,
        input: url ? { imageUrl: url } : {},
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

    console.log(
      "Ket qua gi day===========: ",
      Array.isArray(workflows) && workflows.length > 0
    );

    if (Array.isArray(workflows) && workflows.length > 0) {
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

app.get("/workflow-exe/:id", cors(), async (req, res) => {
  const { id } = req.params;

  try {
    const executor = new WorkflowExecutor(client);
    // Query Workflow status
    const workflowStatus = await executor.getWorkflow(id, true);
    console.debug("🚀 ~ app.get ~ workflowStatus:", workflowStatus);

    return res.send(workflowStatus);
  } catch (error) {
    console.debug("🚀 ~ app.get ~ error:", error);
    return res
      .status(error?.status || 500)
      .send(error?.body || { error: error?.message });
  }
});

app.post("/run-workflow", cors(), async (req, res) => {
  const { workflowName, workflowVersion, url, ua1, ua2 } = req.body;

  try {
    const executor = new WorkflowExecutor(client);
    const executionId = await executor.startWorkflow({
      name: workflowName,
      version: workflowVersion,
      input: { url, ua1, ua2 },
    });

    // Query Workflow status
    const workflowStatus = await executor.getWorkflow(executionId, true);    

    return res.send(workflowStatus);
  } catch (error) {
    console.debug("🚀 ~ app.post ~ error:", error);
    return res
      .status(error?.status || 500)
      .send(error?.body || { error: error?.message });
  }
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
