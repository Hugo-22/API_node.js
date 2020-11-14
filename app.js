const express = require('express')
const { checkAndChange } = require('./assets/functions')
const bodyParser = require('body-parser')
const morgan = require('morgan')('dev')
const mysql = require('promise-mysql')
const config = require('./assets/config.json')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./assets/swagger.json')

mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('connected');

    const app = express()


    let MembersRouter = express.Router()
    let Members = require('./assets/class/Members')(db, config)

    app.use(morgan)
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(config.rootAPI + 'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    MembersRouter.route('/:id')

        // Récupère un membre en fonction de son :id
        .get(async (req, res) => {
            let member = await Members.getByID(req.params.id)
            res.json(checkAndChange(member))
        })

        // Modifie un membre en fonction de son :id
        .put(async (req, res) => {
            let updateMember = await Members.update(req.params.id, req.body.name)
            res.json(checkAndChange(updateMember))
        })

        // Supprime un membre avec ID
        .delete(async (req, res) => {
            let deleteMember = await Members.delete(req.params.id)
            res.json(checkAndChange(deleteMember))
        })

    MembersRouter.route('/')

        // Récupère tous les membres
        .get(async (req, res) => {
            let allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))
        })

        // Ajoute un membre
        .post(async (req, res) => {
            let addMember = await Members.add(req.body.name)
            res.json(checkAndChange(addMember))
        })

    app.use(config.rootAPI + 'members', MembersRouter)
    app.listen(config.port, () => console.log('Server is running on port ' + config.port))

}).catch((err) => {
    console.log(err.message);
})