//import { renderIndex, renderAbout } from "../controllers/index.controller.js";
const express = require('express');
const router = express.Router();

//router.get("/", renderIndex);
//router.get("/about", renderAbout);

router.get('/', (req, res) => {
  res.render('index')
})

module.exports =  router;