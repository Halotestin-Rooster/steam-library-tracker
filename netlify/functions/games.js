exports.handler = async (event) => {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;

    // Get access token
    const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const body = JSON.parse(event.body || '{}');
    const query = body.query || '';

    // Call IGDB
    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        },
        body: `
            search "${query}";
            fields name, rating, first_release_date, cover.url;
            limit 24;
        `
    });

    const data = await igdbRes.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
};