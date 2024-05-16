import { auth, Client } from "twitter-api-sdk";
import { DEPLAN_ID } from "./costants";

const authConfig: auth.OAuth2UserOptions = {
    client_id: process.env.TWITTER_CLIENT_ID as string,
    client_secret: process.env.TWITTER_CLIENT_SECRET as string,
    callback: "http://127.0.0.1:3000/callback",
    scopes: ["tweet.read", "users.read", "offline.access","follows.write", "follows.read"],
  };

class TwitterClientDriver {
    private authClient: auth.OAuth2User;
    private client: Client;

    constructor() {
        this.authClient = new auth.OAuth2User(authConfig);
        this.client = new Client(this.authClient);
    }
    
    getMyAccount = async () => {
        try {
            const resp = await this.client.users.findMyUser();
            const myId = resp.data?.id || '';
            const myName = resp.data?.name || '';
            return {
                myId,
                myName
            };
        } catch (error) {
            console.log('error myId --->', JSON.stringify(error));
            throw error;
        }
    };

    followDeplan = async (myId: string) => {    
        try {
            const resp = await this.client.users.usersIdFollow(myId, {
                target_user_id: DEPLAN_ID,
            });
            return resp;
        } catch (error) {
            console.log('error followDeplan --->', JSON.stringify(error));
            throw error;
        }
    
    }

    generateAuthUrl = async (wallet: string) => {
        try {
            const url = this.authClient.generateAuthURL({
                state: wallet,
                code_challenge_method: "s256",
            });
    
            return url;
        } catch (error) {
            console.log('error generateAuthUrl --->', JSON.stringify(error));
            throw error;
        }
    };

    requestAccessToken = async (code: string, state: string) => {
        console.log('callback', code, state);
    
        try {
            await this.authClient.requestAccessToken(code as string);
        } catch (error) {
            console.log('error requestAccessToken --->', JSON.stringify(error));
            throw error;
        }
    }

    checkIsFollowing = async (userId: string) => {
        try {
            const resp = await this.client.users.usersIdFollowing(userId);
            return resp.data?.find(userData => userData.id === DEPLAN_ID) || false;
        } catch (error) {
            console.log('error checkIsFollowing --->', JSON.stringify(error));
            throw error;
        }
    }

    revokeAccessToken = async () => {
        try {
            await this.authClient.revokeAccessToken();
        } catch (error) {
            console.log('error revokeAccessToken --->', JSON.stringify(error));
            throw error;
        }
    }
}

export default TwitterClientDriver;

