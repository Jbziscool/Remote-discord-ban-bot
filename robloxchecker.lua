local HttpService = game:GetService("HttpService")
local apiurl = 'http://127.0.0.1:3000'
local apikey = 'hotdog123'



game.Players.PlayerAdded:Connect(function(plr)
	local url = apiurl.."/checkuser?userid="..plr.UserId.."&api_key="..apikey
	local time = math.random(2, 6)
	wait(time)
	local response = HttpService:JSONDecode(HttpService:GetAsync(url))
	if response["Banned"] == true then
		plr:Kick('You are banned | Reason: '..response['reason'])
	end
end)	
