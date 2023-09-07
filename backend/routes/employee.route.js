const express = require("express");
const app = express();
const employeeRoute = express.Router();
const cors = require("cors");
const request = require("request")

// CORS OPTIONS
var whitelist = ["http://localhost:4200", "http://localhost:4000"];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    };
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions);
};

// Employee model
let Employee = require("../models/Employee");

// Add Employee
employeeRoute.route("/create").post(async (req, res, next) => {
  await Employee.create(req.body)
    .then((result) => {
      var formData = {
        "fcn": "CreateEmployee",
        "chaincodeName":"employee",
        "channelName": "mychannel",
        "args": ["{\"name\":\""+ req.body.name +"\",\"email\":\""+ req.body.email +"\",\"mobile\":"+ req.body.phoneNumber +",\"designation\":\""+ req.body.designation +"\"}"]
      }

      if (result != "") {
        console.log("===========")
        request.post({
          url: "http://10.0.0.4:4000/users",
          dataType: "json",
          contentType: 'application/x-www-form-urlencoded',
          form: {
              username: 'user',
              orgName: 'Org1'
          }
        }, (err, httpResponse, body) => {
          var bodyData = JSON.parse(body);
          var token = bodyData.token;
          console.log('token', token)
          request.post({
            url: "http://10.0.0.4:4000/channels/mychannel/chaincodes/employee",
            json: true,
            body: formData,
            headers: {
              "Authorization": "Bearer " + token
            }
          }, (err, response, body) => {
            console.log("body", body, "  err", err)
              res.json({
                data: result,
                message: "Data successfully added!",
                status: 200,
              });
          })
        });
        
      }
    })
    .catch((err) => {
      return next(err);
    });
});

// Get All Employees
employeeRoute
  .route("/", cors(corsOptionsDelegate))
  .get(async (req, res, next) => {
    await Employee.find()
      .then((result) => {
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      })
      .catch((err) => {
        return next(err);
      });
  });

// Get single employee
employeeRoute.route("/read/:id").get(async (req, res, next) => {
  await Employee.findById(req.params.id, req.body)
    .then((result) => {
      console.log("resulwrt2374982ui4thwnsgsfg", result)
      request.post({
        url: "http://10.0.0.4:4000/users",
          dataType: "json",
          contentType: 'application/x-www-form-urlencoded',
          form: {
              username: 'user',
              orgName: 'Org1'
          }
      }, (err, httpResponse, body) => {
        var bodyData = JSON.parse(body);
        var token = bodyData.token;
        console.log('token', token)
        const queryParams = { args: ["neha.mutke@shell.com"], fcn: "ReadEmployee", peer: "peer0.org1.example.com" }; // Query parameters
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // ["{\"name\":\"Neha\",\"email\":\"neha.mutke1@shell.com\",\"mobile\":1212121212,\"designation\":\"AM\"}"]
        const options = {
          url: "http://10.0.0.4:4000/channels/mychannel/chaincodes/employee?args=[\""+ result.email +"\"]&fcn=ReadEmployee&peer=peer0.org1.example.com",
          headers: headers,
        };
        request.get(options, (error, response, body) => {
          if (error) {
            console.log("errorasdasd", error)
          } else {
            console.log("body--087yuhj", body)
            var bodyData = JSON.parse(body)
            console.log("response", response)
            console.log("JSON.parse(body)", bodyData.result.email)
  // _id: new ObjectId("64f7ffd939c16dc5bd42cac2"),
  // name: 'neha mutke',
  // email: 'neha.mutke@shell.com',
  // designation: 'Finance',
  // phoneNumber: 6767676767,
  // __v: 0

            var data = {
              _id: result._id,
              name: bodyData.result.name,
              email: bodyData.result.email,
              designation: bodyData.result.designation,
              phoneNumber: bodyData.result.mobile
            }

            res.json({
              data: data,
              message: "Data successfully retrieved.",
              status: 200,
            });
          }
        });
      })
      
//       args=["neha.mutke@shell.com"]&fcn=ReadEmployee&peer=peer0.org1.example.com
//       request.get({url: "http://localhost:8000", qs: {"foo": "bar"}}, function(err, response, body) {
//     console.log(err, body);
// })
      
    })
    .catch((err) => {
      return next(err);
    });
});

// Update employee
employeeRoute.route("/update/:id").put(async (req, res, next) => {
  await Employee.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  })
    .then((result) => {
      var formData = {
        "fcn": "UpdateEmployee",
        "chaincodeName":"employee",
        "channelName": "mychannel",
        "args": [req.body.email, req.body.name, req.body.designation, req.body.phoneNumber]
      }
      request.post({
        url: "http://10.0.0.4:4000/users",
        dataType: "json",
        contentType: 'application/x-www-form-urlencoded',
        form: {
            username: 'user',
            orgName: 'Org1'
        }
      }, (err, httpResponse, body) => {
        var bodyData = JSON.parse(body);
        var token = bodyData.token;
        console.log('token', token)
        request.post({
          url: "http://10.0.0.4:4000/channels/mychannel/chaincodes/employee",
          json: true,
          body: formData,
          headers: {
            "Authorization": "Bearer " + token
          }
        }, (err, response, body) => {
          console.log("body", body, "  err", err)
            res.json({
              data: result,
              message: "Data successfully added!",
              status: 200,
            });
        })
      });
      // res.json({
      //   data: result,
      //   msg: "Data successfully updated.",
      // });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Delete employee
employeeRoute.route("/delete/:id").delete(async (req, res) => {
  await Employee.findById(req.params.id, req.body)
    .then(async (result) => {
      // await Employee.findByIdAndRemove(req.params.id)
      //   .then(() => {
          console.log("1212212121212", result)
      var formData = {
        "fcn": "DeleteEmployee",
        "chaincodeName":"employee",
        "channelName": "mychannel",
        "args": [result.email]
      }
      request.post({
          url: "http://10.0.0.4:4000/users",
          dataType: "json",
          contentType: 'application/x-www-form-urlencoded',
          form: {
              username: 'user',
              orgName: 'Org1'
          }
        }, (err, httpResponse, body) => {
          var bodyData = JSON.parse(body);
          var token = bodyData.token;
          console.log('token', token)
          request.post({
            url: "http://10.0.0.4:4000/channels/mychannel/chaincodes/employee",
            json: true,
            body: formData,
            headers: {
              "Authorization": "Bearer " + token
            }
          }, (err, response, body) => {
            console.log("body", body, "  err", err)
              res.json({
                data: result,
                message: "Data successfully added!",
                status: 200,
              });
          })
        });
          // res.json({
          //   msg: "Data successfully updated.",
          // });
        // })
        // .catch((err) => {
        //   console.log(err);
        // });
      
      
    })
  
});

module.exports = employeeRoute;
