import os
import discord
import requests
import json
from pymongo import MongoClient
from discord.ext import commands
from dotenv import load_dotenv
load_dotenv()


apiurl = os.getenv('apiurl') #gets things from env file
bottoken = os.getenv('bottoken')



API_ENDPOINT = "https://users.roblox.com/v1/usernames/users"

def getUserId(username): #this is a function to send a request to a api endpoint which gets info

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



bot = commands.Bot(command_prefix=">", intents=discord.Intents.all()) #declare the bot variable for the discord.py


@bot.command()
async def gameban(ctx, name,*, reason): # name,*, reason, the ,*, meaning that the next argument will repeat no matter how many args
    uri = apiurl
    client = MongoClient(uri) #open a mongodb client instance

    userid = getUserId(name) #use the getuserid function which will return the user di

    try:
        client.server_info()
        database = client['bandb'] #get the client database name thing i am so tired rn god
        collection = database['users']
        result = collection.insert_one({'userid': f'{userid}', 'username': name, 'reason': reason}) #inserts data into the db
    finally: #does this last
        client.close() #close the mongodb client
    await ctx.send(f'Added `{name}` - `{userid}` to the database with reason: `{reason}`')




@bot.command()
async def gameunban(ctx, user):
    uri = apiurl
    client = MongoClient(uri) #declares mongodb client instance


    try:
        client.server_info()
        database = client['bandb'] #declare the mongodb database name
        collection = database['users'] #delcare the collection name
        myquery = { "username": user} # this is what we want to search for
        collection.delete_one(myquery) # search through the collection and delete this
    finally: #lastly
        client.close() #close the mongodb client
    await ctx.send(f'Removed {user} from the ban database')


bot.run(bottoken) #start the bot
