var express = require('express');
var router = express.Router();


var CsodApi = require('../csodkit');
var CsodConfig = require('../csodApiConfig');
//var utf8 = require('utf8');



/* This will pull all the user data from the demopm portal*/
router.get('/', function(req, res) {

    var config = new CsodConfig();
    var api = new CsodApi(config);

    api.getData("/services/data/Employee","?$select=Id,FirstName,LastName,DirectManagerId", function(chunk){
        //console.log('BODY: ' + chunk);
        //res.json(chunk);
        res.end(chunk);
    }, function(e){
        console.log(e.message);
    });


});

module.exports = router;
/**
 * Created by dhoffman on 12/29/2014.
 */
