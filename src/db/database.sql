CREATE DATABASE escuela-app;

USE escuelita-app;

CREATE TABLE alumnos (
  id INT(11) NOT NULL AUTO_INCREMENT,
  matricula INT(11) NOT NULL
  nombre VARCHAR(16) NOT NULL,
  apellidos VARCHAR(40) NOT NULL,
  correo VARCHAR(50) NOT NULL,
  sexo VARCHAR(20) NOT NULL
  profesor_id INT NOT NULL,
  CONSTRAINT fk_profesor FOREIGN KEY(profesor_id) REFERENCES profesores(id)
);

CREATE TABLE profesores (
  id INT(11) NOT NULL AUTO_INCREMENT,
  nombre_de_usuario VARCHAR(100) NOT NULL
  nombre VARCHAR(16) NOT NULL,
  apellidos VARCHAR(40) NOT NULL,
  correo VARCHAR(50) NOT NULL,
  password VARCHAR(60) NOT NULL,
);

ALTER TABLE alumnos
  ADD PRIMARY KEY (id);

ALTER TABLE profesores
  ADD PRIMARY KEY (id);


CREATE TABLE asistencia (
  id INT(11) NOT NULL AUTO_INCREMENT,
  fecha VARCHAR(20) NOT NULL,
  clase VARCHAR(30) NOT NULL,
  grupo VARCHAR(30) NOT NULL,
  alumno_id INT(11),
  created_at timestamp NOT NULL DEFAULT current_timestamp,
  CONSTRAINT fk_alumno FOREIGN KEY(alumno_id) REFERENCES alumnos(id)
);

ALTER TABLE asistencia
  ADD PRIMARY KEY (id);

