const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')

const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), { Promise })
const port = process.env.PORT || 3001

app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
  const db = await dbConnection
  const categoriasDb = await db.all('select * from categorias')
  const vagas = await db.all('select * from vagas')
  const categorias = categoriasDb.map((cat) => {
    return {
      ...cat,
      vagas: vagas.filter((vaga) => vaga.categoria === cat.id),
    }
  })

  res.render('home', { categorias })
})

app.get('/admin', async (req, res) => {
  res.render('admin/home')
})

app.get('/admin/vagas', async (req, res) => {
  const db = await dbConnection
  const vagas = await db.all('select * from vagas')

  res.render('admin/vagas', { vagas })
})

app.get('/admin/vagas/delete/:id', async (req, res) => {
  const db = await dbConnection
  await db.run(`delete from vagas where id=${req.params.id}`)
  res.redirect('/admin/vagas')
})

app.get('/admin/categoria/delete/:id', async (req, res) => {
  const db = await dbConnection
  await db.run(`delete from categorias where id=${req.params.id}`)
  res.redirect('/admin/categorias')
})

app.get('/admin/vagas/nova', async (req, res) => {
  const db = await dbConnection
  const categorias = await db.all('select * from categorias')
  res.render('admin/nova-vaga', { categorias })
})

app.get('/admin/categoria/nova', async (req, res) => {
  res.render('admin/nova-categoria')
})

app.get('/admin/vagas/editar/:id', async (req, res) => {
  const { id } = req.params
  const db = await dbConnection
  const vaga = await db.get(`select * from vagas where id=${id}`)
  const categorias = await db.all('select * from categorias')
  res.render('admin/editar-vaga', { vaga, categorias })
})

app.get('/admin/categoria/editar/:id', async (req, res) => {
  const { id } = req.params
  const db = await dbConnection
  const categoria = await db.get('select * from categorias where id=' + id)
  res.render('admin/editar-categoria', { categoria })
})

app.get('/admin/categorias', async (req, res) => {
  const db = await dbConnection
  const categorias = await db.all('select * from categorias')

  res.render('admin/categorias', { categorias })
})

app.get('/vaga/:id', async (req, res) => {
  const db = await dbConnection

  const vaga = await db.get(`select * from vagas where id= ${req.params.id}`)
  res.render('vaga', { vaga })
})

app.post('/admin/vagas/nova', async (req, res) => {
  const { titulo, descricao, categoria } = req.body
  const db = await dbConnection
  await db.run(`insert into vagas (titulo, descricao, categoria ) values ( '${titulo}', '${descricao}', ${categoria})`)
  res.redirect('/admin/vagas')
})

app.post('/admin/categoria/nova', async (req, res) => {
  const { categoria } = req.body
  const db = await dbConnection
  await db.run(`insert into categorias ( categoria ) values ( '${categoria}')`)
  res.redirect('/admin/categorias')
})

app.post('/admin/vagas/editar/:id', async (req, res) => {
  const { titulo, descricao, categoria } = req.body
  const { id } = req.params
  const db = await dbConnection
  await db.run(`update vagas set titulo='${titulo}', descricao='${descricao}', categoria=${categoria} where id=${id}`)
  res.redirect('/admin/vagas')
})

app.post('/admin/categoria/editar/:id', async (req, res) => {
  const { categoria } = req.body
  const { id } = req.params
  const db = await dbConnection
  await db.run(`update categorias set categoria='${categoria}' where id=${id}`)
  res.redirect('/admin/categorias')
})

const init = async () => {
  const db = await dbConnection
  await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
  await db.run(
    'create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);',
  )
}
init()
app.listen(port, (err) => {
  if (err) {
    console.log('Nao foi possivel acessar o servidor')
  } else {
    console.log('Servidor iniciado na porta 3001')
  }
})
