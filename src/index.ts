import express from "express";
import cors from "cors";

import { Templates } from "./costants";
import TwitterClientDriver from "./TwitterClientDriver";


const app = express();

const DB = new Map();
const clientDB = new Map<string, TwitterClientDriver>();

app.use(express.static(__dirname + '/public'));

app.get("/airdrop/twitter/follow", cors(), async function (req, res) {
  const { wallet } = req.query;
  const twitterClient = new TwitterClientDriver();
  clientDB.set(wallet as string, twitterClient);
  const authUrl = await twitterClient.generateAuthUrl(wallet as string);
  res.send(authUrl);
});

app.get("/airdrop/twitter/follow/check", cors(), async function (req, res) {
  const { wallet } = req.query;

  console.log('Check is following', wallet);
  

  const isFolowing = DB.get(wallet)?.isFolowing || false;

  console.log('isFolowing', isFolowing);

  res.status(isFolowing ? 200 : 418).send({ isFolowing });
});

app.get("/callback", async function (req, res) {
  try {
    const { code = '', state: wallet } = req.query; 
    const twitterClient = clientDB.get(wallet as string);
    if (!twitterClient) {
      throw new Error("TwitterClient not found");
    }   
    await twitterClient.requestAccessToken(code as string, wallet as string);
    
    console.log('Start following DePlan');
  
    const { myId } = await twitterClient.getMyAccount();
    const { data, errors } = await twitterClient.followDeplan(myId);

    if (errors) {
      throw new Error(JSON.stringify(errors));
    }

    // save to db
    DB.set(wallet, { isFolowing: data?.following });

    console.log('Follow DePlan success');

    res.sendFile(__dirname + Templates.FOLLOW_SUCCESS);
    
  } catch (error) {
    res.status(400).send({
      error: new Error("Error in callback"),
    })
  }
});



app.listen(3000, '127.0.0.1', () => {
  console.log(`Server run on http://127.0.0.1:3000/`);
});
