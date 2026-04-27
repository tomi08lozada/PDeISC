const express = require('express')
const path = require('path')
const app = express()
const port = 3005 // cambiá el número según el proyecto

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(port, () => {
    console.log(`Proyecto corriendo en http://localhost:${port}`)
})