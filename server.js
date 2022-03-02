const express = require('express')
const agentes = require('./data/agentes').results
const jwt = require('jsonwebtoken')
const app = express()
app.listen(3000, () => console.log('Your app listening on port 3000'))


//public
app.use('/', express.static(__dirname + '/'))

//ruta raíz
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

//LLave
const secretKey = process.env.SECRET_KEY

//ruta /SignIn
app.get('/SignIn', (req, res) => {

  const {
    email,
    password
  } = req.query

  const agente = agentes.find((u) => u.email == email && u.password == password)

  if (agente) {
    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + 120,
        data: agente
      },
      secretKey
    )

    res.send(`
    <p>${email}</p>
    <a href='/Restringido?token=${token}'><p>Acceso restringido.</p></a>

    <script>
    SessionStorage.setItem('token', JSON.stringify('${token}'))
    </script>
    `)

  } else {
    res.send(`<p>Usuario o contraseña incorrecta.</p>`)
  }

})

const verify = (req, res, next) => {
  const {
    token
  } = req.query
  jwt.verify(token, secretKey, (err, decoded) => {
    err
      ?
      res.status(401).send({
        error: '401 Unauthorized.',
        message: err.message
      }) :
      req.user = decoded
    next()

  })
}

app.get('/Restringido', verify, (req, res) => {
  res.send(`
    <p>Bienvenido al acceso restringido, ${req.user.data.email}</p>
    `)
})