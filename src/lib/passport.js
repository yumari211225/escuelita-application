const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../db/db')
const helpers = require('./helpers')

passport.use('local.signin', new LocalStrategy({
    usernameField: 'nombre_de_usuario',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM profesores WHERE nombre_de_usuario = ?', [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password)
      if (validPassword) {
        done(null, user, req.flash('success', 'Welcome ' + user.nombre));
      } else {
        done(null, false, req.flash('message', 'Contraseña incorrecta'));
      }
    } else {
      return done(null, false, req.flash('message', 'El nombre de usuario no existe.'));
    }
}));
  

passport.use('local.signup', new LocalStrategy({
    usernameField: 'nombre_de_usuario',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {

    const { nombre, apellidos, correo } = req.body;
    let newProfesor = {
        nombre_de_usuario : username,
        nombre,
        apellidos,
        correo,
        password
    };
    newProfesor.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO profesores SET ? ', newProfesor);
    newProfesor.id = result.insertId
    return done(null, newProfesor);
}));

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM profesores WHERE id = ?', [id]);
  done(null, rows[0]);
});