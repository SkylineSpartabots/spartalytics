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
const CLIENT_ID = "";
const CLIENT_SECRET = "--";
const redirect = encodeURIComponent('');

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
            secret: 'geheimnis',
            saveUninitialized: true,
            store: new FileStore({ secret: 'geheimnis' }),
            resave: false,
            rolling: true,
            httpOnly: true,
            cookie: { maxAge: 604800000 },
        })
    )

    server.get('/api/login', (req, res) => {
        res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=&redirect_uri=callback&response_type=code&scope=identify`)
    })

    server.post('/api/callbacks', (req, res) => {
        if (!req.body) throw new Error('NoCodeProvided');
        const code = req.body.code;
        //console.log(code)
        const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

        //Initial Call to Discord Oauth Server
        fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${creds}`,
                }
            }).then(response => response.json().then(callbackJson => {
                const access_token = callbackJson.access_token
                fetch('http://discordapp.com/api/users/@me',
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }).then(response => response.json().then(refreshTokenJson => {
                        req.session.user = refreshTokenJson
                        res.json(refreshTokenJson)
                    })
                    )
            }))
    })

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
