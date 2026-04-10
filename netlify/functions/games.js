exports.handler = async (event) => {
    try {
        const CLIENT_ID = process.env.CLIENT_ID;
        const CLIENT_SECRET = process.env.CLIENT_SECRET;

        // Get access token (NO node-fetch needed)
        const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "client_credentials"
            })
        });

        const tokenData = await tokenRes.json();

        const accessToken = tokenData.access_token;

        const body = JSON.parse(event.body || "{}");
        const query = body.query || "gta";

        const igdbRes = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": CLIENT_ID,
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "text/plain"
            },
            body: `
                search "${query}";
                fields name, rating, first_release_date, cover.url;
                limit 10;
            `
        });

        const data = await igdbRes.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
