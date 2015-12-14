var express = require('express');

var router = express.Router();

router.get('*',function(req,res){  
    res.redirect('https://127.0.0.1:1337' + req.url)
});

module.exports = router;