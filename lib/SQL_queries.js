const mysql = require("mysql2");
const connection = require("./sql_login");
const asTable = require('as-table').configure({ delimiter: ' | ', dash: '-' });

class SQLquery {

    constructor(query, values) {
        this.query = query;
        this.values = values;
    }

    generalTableQuery(nextStep) {
        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            console.log("\n");
            console.log(asTable(res));
            console.log("\n");
            nextStep();
        });
    }

    getQueryNoRepeats(nextStep, parameterToPassToNextStep) {
        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            let titleArr = []
            for (let i = 0; i < res.length; i++) {
                if (!titleArr.includes(res[i].role_title)) {   // Use role_title instead of title
                    titleArr.push(res[i].role_title);
                }
            }
            nextStep(titleArr, parameterToPassToNextStep);
        });
    }

    delete(nextStep) {
        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err;
            console.log("Delete Successful!");
            nextStep();
        });
    }

    update(nextStep, message) {
        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err;
            console.log(message);
            nextStep();
        });
    }

    queryReturnResult(nextStep) {
        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err;
            nextStep(res);
        });
    }
}

module.exports = SQLquery;
