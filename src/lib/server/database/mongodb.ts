import { CONNECTION_STRING } from "$env/static/private";
import { Db, MongoClient } from "mongodb";

export const mongo: Db = new MongoClient(CONNECTION_STRING)
    .db("Pokerole20")
