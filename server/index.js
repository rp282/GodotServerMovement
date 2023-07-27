const express = require('express')
const { uuid } = require('uuidv4')
const app = express()

const port = 8000

const x_min = 0
const x_max = 1152
const y_min = 0
const y_max = 648

const players = {

}

app.get('/position', (req, res) => {
    // console.log('received position request')
    const { player_id } = req.query    
    let player = players[player_id]
    if (player == undefined) {
        res.status(400)
        res.json({ msg: `Player not found!`, position: { x: 0, y: 0} })
    } else {
        res.json({ msg: `Here's your position`, position: player.position })
    }
})

function validateMove(position, x, y) {
    // Implement move validation here
    let new_position = position.add(parseFloat(x), parseFloat(y))
    if (new_position.x < x_min || new_position.x > x_max || new_position.y < y_min || new_position.y > y_max) {
        return false
    }
    return true
}

app.get('/move', (req, res) => {
    // console.log('received move request')
    const { player_id, x, y } = req.query    
    let player = players[player_id]
    if (player == undefined) {
        res.status(400)
        res.json({ msg: `Player not found!`, position: { x: 0, y: 0} })
    }
    if (validateMove(new Vector2(player.position.x, player.position.y), x, y)) {
        player = player.move(parseFloat(x), parseFloat(y))
        res.status(200)
        res.json({ msg: `Moved successfully!`, position: player.position })
    } else {
        res.status(400)
        res.json({ msg: `Invalid move!`, position: players[player_id].position })
    }

})

app.get('/init', (req, res) => {
    res.status(200)
    const { x, y } = req.query    
    let player_id = uuid()
    console.log(`Initialized player:${player_id}`)
    players[player_id] = new Player(x, y)
    res.json({ msg: 'Here is your player id.', player_id})
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

class Player {
    constructor(x, y) {
        this.position = new Vector2(parseFloat(x), parseFloat(y))
        this.move = (x, y) => {
            this.position = this.position.add(x, y)
            return this
        }
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = parseFloat(x)
        this.y = parseFloat(y)
        this.add = (x, y) =>  {
            this.x += x
            this.y += y
            return this
        }
        this.get = () => {
            return { x: this.x, y: this.y }
        }
    }    
}