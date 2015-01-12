var express = require('express');
var router = express.Router();


var CsodApi = require('../csodkit');
var CsodConfig = require('../csodApiConfig');
//var utf8 = require('utf8');

function createOrgChartNode(data, parent){
    var node = {
        "name": data.FirstName +" "+ data.LastName,
        "parent": "null",
        "children": []
    }
    return node;
}

/* This will pull all the user data from the demopm portal*/
router.get('/', function(req, res) {

    var config = new CsodConfig();
    var api = new CsodApi(config);

    api.getData("/services/data/Employee","?$select=Id,FirstName,LastName,DirectManagerId", function(data){
        //console.log('BODY: ' + chunk);
        //res.json(chunk);
        var userDictionary = new Array();
        var orgChart = [];
        //res.end(JSON.stringify(data));
        for(var i=0; i<data.value.length; i++){
            var node = data.value[i];
            if(node.Id > 13){
                if(node.DirectManagerId == null) {
                    var orgChartNode = createOrgChartNode(node, null)
                    userDictionary[node.Id] = orgChartNode;
                    orgChart.push(orgChartNode);
                }
            }

        }
        var returnJson = JSON.stringify(orgChart);
        res.end(returnJson);
    }, function(e){
        console.log(e.message);
    });


});

module.exports = router;
/**
 * Created by dhoffman on 12/29/2014.
 */
