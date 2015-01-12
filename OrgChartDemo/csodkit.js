/**
 * Created by dhoffman on 1/11/2015.
 */
var crypto = require('crypto');
var https = require('https');

var CsodApi = function(config) {
    this.config = config;

}

/*
 This is a function to format the date into the format the CSOD API uses for
 API headers.
 */
CsodApi.prototype.getUtcDate = function(date) {
    var year = date.getUTCFullYear().toString();
    var month = (date.getUTCMonth() + 1).toString();
    if (month.length == 1) {
        month = "0" + month;
    }
    var day = date.getUTCDate().toString();
    if (day.length == 1) {
        day = "0" + day;
    }
    var hours = date.getUTCHours().toString();
    if (hours.length == 1) {
        hours = "0" + hours;
    }
    var minutes = date.getUTCMinutes().toString();
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }
    var seconds = date.getUTCSeconds().toString();
    if (seconds.length == 1) {
        seconds = "0" + seconds;
    }
    var milli = date.getUTCMilliseconds().toString();
    if (milli.length <= 1) {
        milli = "0" + milli;
    }
    if (milli.length == 2) {
        milli = "0" + milli;
    }

    return year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + ".000";

}

/*
 This function returns the correct CSOD headers for a request to the API
 portal: yourPortal.csod.com
 url: the relative URL of the service you are calling
 sessionToken: the session token for the API key
 sessionSecret: the session secret for the api key
 httpVerb: GET, POST, PUT

 */
CsodApi.prototype.getCSODHeaders = function(url, sessionToken, sessionSecret, httpVerb) {
    var now = new Date();
    var utcNow = this.getUtcDate(now);

    var stringToSign = httpVerb + "\n" + "x-csod-date:" + utcNow
        + "\n" + "x-csod-session-token:" + sessionToken + "\n"
        + url;
    //convert the secrect key and signature string to byte arrays
    var secret64 = new Buffer(sessionSecret, 'base64');
    var sig64 = new Buffer(stringToSign);

    //creates the signature using the Node crypto library
    var signature = crypto.createHmac('sha512', secret64).update(sig64).digest('base64');

    var headers = {
        'x-csod-date': utcNow,
        'x-csod-session-token': this.config.sessionToken,
        'x-csod-signature': signature
    };
    return headers;
}
/*
This is a simple way to make ODATA queries on the CSOD API
url = the base URL for the entity i.e. /services/data/Employee
query = the odata query string for the request i.e. $select=Id,FirstName,LastName,DirectManagerId
callback = the function to call when the API call is complete. It returns the data as a json object

 */
CsodApi.prototype.getData = function(entityUrl, query, callback, error){
        //I am doing a read, so I use the GET verb
        var httpVerb = "GET";
        var path = entityUrl+query

        // this is the nodejs structure for the HTTPS request
        var options = {
            host: this.config.portal,
            port: 443,
            path: path,
            method: httpVerb,
            headers: this.getCSODHeaders(entityUrl, this.config.sessionToken, this.config.sessionSecret, httpVerb)
        };


        var request = https.request(options, function(response){
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');

            var responseString = '';

            response.on('data', function(data){
                responseString+=data;
            });
            response.on('end', function(){
                callback(JSON.parse(responseString));
            });
        });
        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            if(error != null){
                error(e);
            }
        });
        request.end();
    }


module.exports = CsodApi;