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

  // const responseToken = await fetch("https://auth.orkes.io/oauth/token", {
  //   headers: {
  //     accept: "*/*",
  //     "accept-language": "en-US,en;q=0.9",
  //     "auth0-client":
  //       "eyJuYW1lIjoiYXV0aDAtcmVhY3QiLCJ2ZXJzaW9uIjoiMS44LjAifQ==",
  //     "cache-control": "no-cache",
  //     "content-type": "application/json",
  //     pragma: "no-cache",
  //     "sec-ch-ua":
  //       '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
  //     "sec-ch-ua-mobile": "?0",
  //     "sec-ch-ua-platform": '"macOS"',
  //     "sec-fetch-dest": "empty",
  //     "sec-fetch-mode": "cors",
  //     "sec-fetch-site": "same-site",
  //   },
  //   referrer: "https://play.orkes.io/",
  //   referrerPolicy: "strict-origin",
  //   body: '{"client_id":"ZyPRMaEQpHh3Ep3P83OSuztfUBh8QoYd","code_verifier":"dK3K~6fiyvsjFeVD9tOKrb2FvF3MC51AHdZT4COlZKM","code":"Dfj-Ezl9HNSvOeZXi6MrPJCWM76Og3VoQmhEPoRTm9R4Q","grant_type":"authorization_code","redirect_uri":"https://play.orkes.io"}',
  //   method: "POST",
  //   mode: "cors",
  //   credentials: "omit",
  // });
  //
  // const dataAuth = await responseToken.json();

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

  res.send(data);
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
