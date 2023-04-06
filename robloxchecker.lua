local HttpService = game:GetService("HttpService")
local renderurl = ''


game.Players.PlayerAdded:Connect(function(plr)
	local url = renderurl.."/checkUser?userid="..plr.UserId
	local response = HttpService:JSONDecode(HttpService:GetAsync(url))
	if response["banned"] == true then
		plr:Kick('Permanently banned | Reason: '..response['reason'])
		plr:Destroy()
	end
end)
