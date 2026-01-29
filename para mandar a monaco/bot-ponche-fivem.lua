-- ========================================
-- RECURSO FIVEM PARA ENVIAR IDENTIFICADORES AL BOT
-- ========================================

local WEBHOOK_URL = "bot-de-ponchar-facciones.railway.internal"  -- Cambiar por tu URL de Railway
local WEBHOOK_SECRET = "272113"  -- Mismo que en .env del bot

-- Función para obtener el Discord ID del jugador
function GetPlayerDiscordId(source)
    for k, v in ipairs(GetPlayerIdentifiers(source)) do
        if string.match(v, "discord:") then
            return string.gsub(v, "discord:", "")
        end
    end
    return nil
end

-- Función para obtener todos los identificadores
function GetAllIdentifiers(source)
    local identifiers = {}
    
    for k, v in ipairs(GetPlayerIdentifiers(source)) do
        if string.match(v, "license:") then
            identifiers.license = v
        elseif string.match(v, "xbl:") then
            identifiers.xbl = v
        elseif string.match(v, "live:") then
            identifiers.live = v
        elseif string.match(v, "discord:") then
            identifiers.discord = v
        elseif string.match(v, "fivem:") then
            identifiers.fivem = v
        end
    end
    
    return identifiers
end

-- Registrar jugador cuando se conecta
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    local discordId = GetPlayerDiscordId(source)
    
    if discordId then
        local identifiers = GetAllIdentifiers(source)
        local playerName = GetPlayerName(source)
        
        -- Enviar datos al bot de Discord
        PerformHttpRequest(WEBHOOK_URL, function(statusCode, response, headers)
            if statusCode == 200 then
                print("[BOT-PONCHE] Jugador registrado: " .. playerName)
            else
                print("[BOT-PONCHE] Error al registrar jugador: " .. statusCode)
            end
        end, 'POST', json.encode({
            secret = WEBHOOK_SECRET,
            discordId = discordId,
            identifiers = identifiers,
            playerName = playerName,
            playerId = source
        }), {
            ['Content-Type'] = 'application/json'
        })
    end
end)

-- Comando manual para registrar jugador (opcional)
RegisterCommand('registrarbot', function(source, args, rawCommand)
    local discordId = GetPlayerDiscordId(source)
    
    if not discordId then
        TriggerClientEvent('chat:addMessage', source, {
            args = {"^1[ERROR]", "No se pudo obtener tu Discord ID"}
        })
        return
    end
    
    local identifiers = GetAllIdentifiers(source)
    local playerName = GetPlayerName(source)
    
    PerformHttpRequest(WEBHOOK_URL, function(statusCode, response, headers)
        if statusCode == 200 then
            TriggerClientEvent('chat:addMessage', source, {
                args = {"^2[BOT-PONCHE]", "Registrado correctamente en el sistema de ponche"}
            })
        else
            TriggerClientEvent('chat:addMessage', source, {
                args = {"^1[ERROR]", "Error al registrar: " .. statusCode}
            })
        end
    end, 'POST', json.encode({
        secret = WEBHOOK_SECRET,
        discordId = discordId,
        identifiers = identifiers,
        playerName = playerName,
        playerId = source
    }), {
        ['Content-Type'] = 'application/json'
    })
end, false)
