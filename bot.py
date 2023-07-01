import os
import discord
import requests
import json
from pymongo import MongoClient
from discord.ext import commands
from dotenv import load_dotenv
load_dotenv()


apiurl = os.getenv('apiurl')
bottoken = os.getenv('bottoken')



API_ENDPOINT = "https://users.roblox.com/v1/usernames/users"

def getUserId(username):

    requestPayload = {
        "usernames": [
            username
        ],

        "excludeBannedUsers": False
    }

    responseData = requests.post(API_ENDPOINT, json=requestPayload)


    assert responseData.status_code == 200

    userId = responseData.json()["data"][0]["id"]

    print(userId)
    return userId



bot = commands.Bot(command_prefix=">", intents=discord.Intents.all())


@bot.command()
async def gameban(ctx, name,*, reason):
    uri = apiurl
    client = MongoClient(uri)

    userid = getUserId(name)

    try:
        client.server_info()
        database = client['bandb']
        collection = database['users']
        result = collection.insert_one({'userid': f'{userid}', 'username': name, 'reason': reason})
    finally:
        client.close()
    await ctx.send(f'Added `{name}` - `{userid}` to the database with reason: `{reason}`')




@bot.command()
async def gameunban(ctx, user):
    uri = apiurl
    client = MongoClient(uri)


    try:
        client.server_info()
        database = client['bandb']
        collection = database['users']
        myquery = { "username": user}
        collection.delete_one(myquery)
    finally:
        client.close()
    await ctx.send(f'Removed {user} from the ban database')


bot.run(bottoken)
