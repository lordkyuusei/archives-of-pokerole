import { env } from "$env/dynamic/private";
import { Db, MongoClient } from "mongodb";

const connectionString: string = env["CONNECTION_STRING"] || "";

export const mongo: Db = new MongoClient(connectionString)
    .db("Pokerole20")
