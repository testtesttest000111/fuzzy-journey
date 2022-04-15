require('dotenv').config({})
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const Op = Sequelize.Op
const path = require('path')


let sequelize
sequelize = new Sequelize(process.env.DATABASE_URL,{
            dialect: 'postgres',
            protocol: 'postgres',
            dialectOptions:{
                ssl:{
                    require: true,
                    rejectUnauthorized: false
                }
    
            }
        });

// if(process.env.NODE_ENV === 'development') {
//     sequelize = new Sequelize({
//         dialect : 'sqlite',
//         storage: 'test.db'
//     })

// } else{
//     sequelize = new Sequelize(process.env.DATABASE_URL,{
//         dialect: 'postgres',
//         protocol: 'postgres',
//         dialectOptions:{
//             ssl:{
//                 require: true,
//                 rejectUnauthorized: false
//             }

//         }
//     });
// } 



const Article = sequelize.define('article', {
    articleID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.TEXT,
        validate: {
            isLengthGreaterThan(value) {
                if (value.length < 5) {
                    throw new Error('length must be greater than 5')
                }
            }
        }
    },
    summary: {
        type: Sequelize.TEXT,
        validate: {
            isLengthGreaterThan(value) {
                if (value.length < 10) {
                    throw new Error('length must be greater than 5')
                }
            }
        }
    },
    date: Sequelize.DATE
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,

});

const Reference = sequelize.define('reference', {
    refID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.TEXT,
        validate: {
            isLengthGreaterThan(value) {
                if (value.length < 5) {
                    throw new Error('length must be greater than 5')
                }
            }
        }
    },
    date: Sequelize.DATE,
    listOfAuthors: Sequelize.TEXT,
    articleID: Sequelize.INTEGER,
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,

});

Article.hasMany(Reference, { foreignKey: 'articleID' });


const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json());

// HTTP requests

// sync method
app.get('/sync', async (req, res) => {
    try {
        await sequelize.sync({ force: true })
        res.status(201).json({ message: 'created' })
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})


// ========== ARTICLE
// SELECT ALL WITH SORT, FILTER, PAGE
app.get('/articles', async (req, res) => {
    try {
        const query = {}
        let pageSize = 2
        const allowedFilters = ['title', 'summary']
        const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
        if (filterKeys.length > 0) {
            query.where = {}
            for (const key of filterKeys) {
                query.where[key] = {
                    [Op.like]: `%${req.query[key]}%`
                }
            }
        }

        const sortField = req.query.sortField
        let sortOrder = 'ASC'
        if (req.query.sortOrder && req.query.sortOrder === '-1') {
            sortOrder = 'DESC'
        }

        if (req.query.pageSize) {
            pageSize = parseInt(req.query.pageSize)
        }

        if (sortField) {
            query.order = [[sortField, sortOrder]]
        }

        if (!isNaN(parseInt(req.query.page))) {
            query.limit = pageSize
            query.offset = pageSize * parseInt(req.query.page)
        }

        const records = await Article.findAll(query)
        console.log(query);
        console.log(records);
        const count = await Article.count()
        if (records.length == 0) {
            res.status(200).json({ message: 'no recoreds found' })
        } else {
            res.status(200).json({ records, count })
        }
    } catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})


// SELECT ARTICLE WITH ID
app.get('/articles/:id', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.id)
        if (article) {
            res.status(200).json(article)
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})


// INSERT
app.post('/articles', async (req, res) => {
    try {
        await Article.create(req.body)
        res.status(201).json({ message: 'Article created successfully!' })

    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// UPDATE
app.put('/articles/:id', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.id)
        if (article) {
            await article.update(req.body)
            res.status(202).json({ message: 'accepted' })
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// DELETE
app.delete('/articles/:id', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.id)

        if (article) {
            await article.destroy()
            res.status(202).json({ message: 'accepted' })
            console.log('article deleted');
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})


// =========== REFERENCE
// SELECT ALL REFERENCES BASED ON ID ARTICLE
app.get('/articles/:aid/references', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article) {
            let references = await article.getReferences()
            res.status(200).json(references)
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// SELECT REFERENCE BASED ON ID ARTICLE AND REFERENCE ID
app.get('/articles/:aid/references/:rid', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article) {
            let references = await article.getReferences({ where: { refID: req.params.rid } })
            res.status(200).json(references.shift())
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// INSERT REFERENCE BASED ON ID ARTICLE
app.post('/articles/:aid/references', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article) {
            let reference = req.body
            reference.articleID = article.articleID
            await Reference.create(reference)
            res.status(201).json({ message: 'created' })
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// UPDATE REFERENCE BASED ON ID ARTICLE AND REFERENCE ID
app.put('/articles/:aid/references/:rid', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article) {
            let references = await article.getReferences({ where: { refID: req.params.rid } })
            let reference = references.shift()
            if (reference) {
                await reference.update(req.body)
                res.status(202).json({ message: 'accepted' })
            }
            else {
                res.status(404).json({ message: 'not found' })
            }
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// DELETE REFERENCE BASED ON ID ARTICLE AND REFERENCE ID
app.delete('/articles/:aid/references/:rid', async (req, res) => {
    try {
        let article = await Article.findByPk(req.params.aid)
        if (article) {
            let references = await article.getReferences({ where: { refID: req.params.rid } })
            let reference = references.shift()
            if (reference) {
                await reference.destroy(req.body)
                res.status(202).json({ message: 'accepted' })
            }
            else {
                res.status(404).json({ message: 'not found' })
            }
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

app.listen(process.env.PORT)
