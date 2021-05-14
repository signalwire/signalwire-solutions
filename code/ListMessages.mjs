import { RestClient } from "@signalwire/node";
import fs from "fs";
const client = new RestClient(
 "ProjectID",
 "AuthToken",
 { signalwireSpaceUrl: "YOURSPACE.signalwire.com" }
);
// create a file an open it, create new line array
let writeStream = fs.createWriteStream("CompanyNameMessages.csv");
let newLine = [];
// set headers, make sure order matches order below where elements are pushed to array
const header = [
 "Message Sid",
 "To",
 "From",
 "Date Sent",
 "Status",
 "Direction",
 "Price",
];
// push headers to new line array
newLine.push(header);
// list messages filtered by date and status and then loop through each record to push the corresponding parameters to the headers into each row one by one
// remember that in Javascript, datetime objects start at 0 where 0 equals January
client.messages
 .list({
   status: "delivered",
   dateSentAfter: new Date(Date.UTC(2021, 4, 1, 0, 0, 0)),
 })
 .then((messages) => {
   messages.forEach((c) => {
     newLine.push(
       c.sid,
       c.to,
       c.from,
       c.dateSent,
       c.status,
       c.direction,
       c.price
     );
   });
   writeStream.write(newLine.join(",") + "\n", () => {});
   writeStream.end();
 });
