const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const next = require('next')
const btoa = require('btoa');
const fetch = require('node-fetch');

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const CLIENT_ID = process.env.CLID;
const CLIENT_SECRET = process.env.CLSC;
const redirect = encodeURIComponent('https://spartalytics.gam3rr.me/api/callback');

// async/await error catcher
const catchAsync = fn => (
    (req, res, next) => {
        const routePromise = fn(req, res, next);
        if (routePromise.catch) {
            routePromise.catch(err => next(err));
        }
    }
);

app.prepare().then(() => {
    const server = express()
    server.use(bodyParser.json())
    server.use(
        session({
            secret: process.env.SECR,
            saveUninitialized: true,
            store: new FileStore({ secret: process.env.SECR }),
            resave: false,
            rolling: true,
            httpOnly: true,
            cookie: { maxAge: 604800000 },
        })
    )

    server.get('/api/login', (req, res) => {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=1194920087887548477&response_type=code&redirect_uri=https%3A%2F%2Fspartalytics.gam3rr.me%2Fapi%2Fcallbacks&scope=identify`)
    })

    server.get('/api/callbacks', async (req, res) => {
        const code = req.query.code;
    
        if (!code) {
            throw new Error('NoCodeProvided');
        }
    
        try {
            var body = {
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirect,
            };
        
            var site = await fetch("https://discord.com/api/v9/oauth2/token", {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            });
            var response = await site.json();
            var accessToken = response['access_token'];
            const fetchDiscordUserInfo = await fetch('http://discordapp.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
            });
    
            const refreshTokenJson = await fetchDiscordUserInfo.json();
    
            // Save user information to session
            req.session.user = refreshTokenJson;
    
            // Respond with the user information
            res.json(refreshTokenJson);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    

    server.get('/api/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return console.log(err);
            }
            res.json({ success: true });
        });

    });

    server.get('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, err => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})
