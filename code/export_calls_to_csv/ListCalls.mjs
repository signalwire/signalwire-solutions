import { RestClient } from "@signalwire/node";
import fs from "fs";

const client = new RestClient(
  "e8f48a64-d62b-4bd5-a8d6-b26824a19cb5",
  "PT4041a3d8f8ac2849cddd390b4595a4206b6b94314380f601",
  { signalwireSpaceUrl: "bowl-test.signalwire.com" }
);

let writeStream = fs.createWriteStream("CompanyNameCalls.csv");
let newLine = [];

const header = [
  "Call Sid",
  "To",
  "From",
  "Start Time",
  "End Time",
  "Status",
  "Direction",
  "Duration",
  "Price",
];

newLine.push(header);

client.calls
  .list({
    status: "completed",
    startTimeAfter: new Date(Date.UTC(2021, 2, 28, 0, 0, 0)),
  })
  .then((calls) => {
    calls.forEach((c) => {
      newLine.push(
        c.sid,
        c.to,
        c.from,
        c.startTime,
        c.endTime,
        c.status,
        c.direction,
        c.duration,
        c.price
      );
    });
    writeStream.write(newLine.join(",") + "\n", () => {});
    writeStream.end();
  });
