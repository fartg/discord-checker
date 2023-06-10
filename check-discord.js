/*
    filename: 
        check-discord.js
    author: 
        smile :) 
    startdate: 
        6/9/23
    description: 
        A checker for Discord's new "pomelo" naming schema.
        Place it in a web browser environment with discord.com open
        and input a word list with this format:
            wordlist = ['apple','banana', 'cherry'];
        Enjoy!
    
        *BG*
*/

const sleep = ms => new Promise(r => setTimeout(r, ms));

var requests = {
    check_pomelo: async function(auth, x_super, username){
        const response = await fetch("https://discord.com/api/v9/users/@me/pomelo-attempt", {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Authorization": auth,
                "X-Super-Properties": x_super,
                "X-Discord-Locale": "en-US",
                "X-Discord-Timezone": "America/New_York",
                "X-Debug-Options": "bugReporterEnabled",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            "referrer": "https://discord.com/channels/@me",
            "body": `{ "username": "${username.toString()}" }`,
            "method": "POST",
            "mode": "cors"
        });
        return await response.json();
    },
    send_webhook: async function(webhook_url, embed_body){
        var response = await fetch(webhook_url, {
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "origin": "https://discord.com"
            },
            "body": JSON.stringify(embed_body)
        })
        if(response.ok){
            console.log(`[S] Sent webhook message successfully!`);
            return
        } else {
            console.log('[E] Webhook error!');
            return
        }
    }
}

var storage = {
    generate_success_embed: function(username){
        return {
            "content": null,
            "embeds": [
                {
                    "title": "Username found:",
                    "description": "```\n"+ username + "\n```",
                    "color": 16711680
                }
            ],
            "attachments": []
        }
    },
}

async function Initiate(options){
    var ratelimit_storage = null;
    for(var iterate = 0; iterate < options.word_list.length; iterate++) {
        var sleep_until = ratelimit_storage ?? 1500;
        await sleep(sleep_until);
        ratelimit_storage = null;
        const request = await requests.check_pomelo(options.auth, options.x_super, options.word_list[iterate]);
        if(request["taken"] === undefined){
            console.log("[E] unknown/ratelimit error. please look into request:\n" + JSON.stringify(request));
            ratelimit_storage = (request["retry_after"]*1000)+100;
            iterate -= 1;
            continue
        }
        else if(request["taken"] === true) {
            console.log(`[F] Failure. Username ${options.word_list[iterate]} taken`);
            continue
        }
        else {
            const webhook_request = await requests.send_webhook(options.webhook, storage.generate_success_embed(options.word_list[iterate].toString()));
            console.log(`[S] Success! Username ${options.word_list[iterate]} is not taken!`);
            continue
        }
    }
}

wordlist = [];

Initiate({
    word_list: wordlist,
    auth: "snip",
    x_super: "snip",
    webhook: "snip"
})