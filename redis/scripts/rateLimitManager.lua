local token = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local clearBefore = now - window
local keys = redis.call('HGETALL', token)
local len = table.getn(keys)
local used = 0
for i = 1,len,2 do
    local stamp = tonumber(keys[i])
    if stamp < clearBefore then
        redis.call('HDEL', token, keys[i])
    else
        used = used + tonumber(keys[i+1])
    end
end

if used + cost <= limit then
    redis.call('HINCRBY', token, now, cost)
    used = used + cost
end

redis.call('EXPIRE', token, window);

return used