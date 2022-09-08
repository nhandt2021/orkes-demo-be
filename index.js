import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 3000;

// Where we will keep books
let books = [];

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.options("*", cors()); // enable pre-flight request for DELETE request
app.get("/workflow/:id", cors(), async (req, res) => {
  const { id } = req.params;

  // https://play.orkes.io/execution/f9a9d984-2e51-11ed-85d6-da345edc3cc9?tabIndex=4
  const response = await fetch(`https://play.orkes.io/api/workflow/${id}`, {
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
  console.log("Result =====", data, req.params);

  return res.send(data);
});

app.post("/workflow", cors(), async (req, res) => {
  const { url } = req.body;

  if (url) {
    const response = await fetch("https://play.orkes.io/api/workflow", {
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
        correlationId: "",
        input: { imageUrl: url },
      }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    const data = await response.text();
    console.log("Workflow Result =====", data, url);

    return res.send(data);
  }

  console.log("Workflow Bad request =====", req.body);

  return res.sendStatus(400);
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
