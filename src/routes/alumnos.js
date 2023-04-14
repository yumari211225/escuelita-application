const express = require('express');
const router = express.Router();
const Json2csvParser = require('json2csv').Parser;
const pool = require('../db/db');
const { isLoggedIn } = require('../lib/auth');
const { json } = require('body-parser');
const multer = require('multer');
const csv = require('fast-csv');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

let storage = multer.diskStorage({
  destination: (req, file, callBack) => {
      callBack(null, './src/routes/uploads/')    
  },
  filename: (req, file, callBack) => {
      callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

let upload = multer({
  storage: storage
});


//Rutas de Alumnos
router.get('/add', isLoggedIn, (req, res) => {
  res.render('alumnos/add')
})

router.post('/add', isLoggedIn, async (req, res) => {
  const {matricula, nombre, apellidos, correo, sexo} = req.body
  const nuevoAlumno = {
    matricula,
    nombre, 
    apellidos, 
    correo, 
    sexo, 
    profesor_id : req.user.id
  }
  await pool.query('INSERT INTO alumnos set ?', [nuevoAlumno]);
  req.flash('success', '¡Nuevo alumno agregado!')
  res.redirect('/alumnos')
})

router.get('/', isLoggedIn, async (req, res) => {
  const alumnos = await pool.query('SELECT * FROM alumnos WHERE profesor_id = ?', [req.user.id])
  res.render('alumnos/list', {alumnos})
})

router.get('/delete/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params
  await pool.query('DELETE FROM alumnos WHERE id = ?', [id])
  req.flash('success', 'Alumno eliminado exitosamente.')
  res.redirect('/alumnos')
})

router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params
  const alumno = await pool.query('SELECT * FROM alumnos WHERE id = ?', [id])
  res.render('alumnos/edit', {alumno: alumno[0]})
})

router.post('/edit/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params
  const {matricula, nombre, apellidos, correo, sexo} = req.body
  const nuevoAlumno = {
    matricula, nombre, apellidos, correo, sexo
  }
  await pool.query('UPDATE alumnos set ? WHERE id = ?', [nuevoAlumno,id])
  req.flash('success', '¡Alumno actualizado!')
  res.redirect('/alumnos')
})


//Rutas de listas

router.post('/list/add', async (req, res) => {
  const {clase, grupo, alumnos} = req.body
  const lista = {
    clase,
    grupo, 
    alumnos: JSON.stringify(alumnos), 
    profesor_id : req.user.id
  }
  await pool.query('INSERT INTO asistencia set ?', [lista]);
  req.flash('success', '¡Nuevo grupo agregado!')
  res.redirect('/alumnos')
})

router.get('/asistencia', isLoggedIn, async (req, res) => {
  const asistencia = await pool.query('SELECT * FROM asistencia WHERE profesor_id = ?', [req.user.id])
  for(let i=0; i<asistencia.length; i++){
    let a = JSON.parse(asistencia[i].alumnos)
    asistencia[i].alumnos = a;
    }  
  res.render('alumnos/asistencia', {asistencia})
})

router.get('/asistencia/lista/:id', isLoggedIn, async (req, res) => {
  
  const {id} = req.params 
  const asistencia = await pool.query('SELECT * FROM asistencia WHERE id = ?', [id])

  alumnos = asistencia[0]
  let clase = alumnos.clase
  let grupo = alumnos.grupo
  let json_alumnos = JSON.parse(alumnos.alumnos)
  let keys = ""
  if (json_alumnos){
    for(let i=0; i<json_alumnos.length; i++){
      json_alumnos[i].clase = clase
      json_alumnos[i].grupo = grupo
    }
    keys = Object.keys(json_alumnos[0])
    keys.clase = clase
    keys.grupo = grupo
  }

  const csvFields = [keys];
  const json2csvParser = new Json2csvParser({ csvFields });
  const csv = json2csvParser.parse(json_alumnos);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=sample_data.csv");
  res.status(200).end(csv);
})

router.post('/import-csv', upload.single("import-csv"), (req, res) =>{
  uploadCsv(__dirname + '/uploads/' + req.file.filename, req);
  res.redirect('/alumnos/asistencia')
});

function uploadCsv(uriFile, req){
  let stream = fs.createReadStream(uriFile);
  let csvDataColl = [];
  let fileStream = csv
      .parse()
      .on("data", function (data) {
          csvDataColl.push(data);
      })
      .on("end", function () {
        
        const clase = csvDataColl[1][5]
        const grupo = csvDataColl[1][6]
        let keys = csvDataColl.shift();

        let alumnos = []

        for(let i =0; i<csvDataColl.length; i++){
          let alumno = {}
          for(let j = 0; j<keys.length-2; j++){
            value = csvDataColl[i][j]
            alumno[keys[j]] = value
          }
          
          alumnos.push(alumno)
        }

        const lista = {
          clase: clase,
          grupo: grupo, 
          alumnos: JSON.stringify(alumnos), 
          profesor_id : req.user.id
        }

        pool.query('INSERT INTO asistencia set ?', [lista]);
        req.flash('success', '¡Archivo CSV importado!')

        fs.unlinkSync(uriFile)
      });

  stream.pipe(fileStream);
}


router.get('/asistencia/delete/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params
  await pool.query('DELETE FROM asistencia WHERE id = ?', [id])
  req.flash('success', 'Lista de asistencia eliminada exitosamente.')
  res.redirect('/alumnos/asistencia')
})

module.exports = router;