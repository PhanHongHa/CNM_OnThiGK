const port = 3000
const multer = require('multer')
const express = require('express')
const AWS = require('aws-sdk')

const convertFormToJson = multer()
const app = express()


app.use(express.static('./templates'));
app.set('view engine', 'ejs');
app.set('views', './templates');

require("dotenv").config({ path: __dirname + "/.env" });

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})

const docClient = new AWS.DynamoDB.DocumentClient()
const tableName = 'Paper'

app.get('/', (req, res) => {
    const params = {
        TableName: tableName
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            return res.send("Lỗi: " + err);
        } else {
            //console.log("Data: ", JSON.stringify(data));
            return res.render('index', { data: data.Items });
        }
    });
});

//Chuyển sang trang add
app.get('/them', (req, res) => {
    const params = {
        TableName: tableName 
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            return res.send("ERROR: " + err);
        } else {
            return res.render('add');
        }
    });
});


//Xữ lý thêm 
app.post('/them', convertFormToJson.fields([]), (req, res) => {
    //console.log("req.body =", req.body);
    const { id, tenBaiBao, tenNhomTacGia, chiSoISBN, soTrang, namXuatBan} = req.body;
    const params = {
        TableName: tableName,
        Item: {
            id: id,
            tenBaiBao: tenBaiBao,
            tenNhomTacGia: tenNhomTacGia,
            chiSoISBN: chiSoISBN,
            soTrang: soTrang,
            namXuatBan: namXuatBan

        },
    };
    docClient.put(params, (err, data) => {
        if (err) {
            return res.send("Lỗi: " + err);
        } else {
            return res.redirect("/");
        }
    });
});

app.post("/delete", convertFormToJson.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length == 0) {
        return res.redirect("/");
    }

    function onDeleteItem (index) {
        const params = {
            TableName: tableName,
            Key: {
                id: listItems[index],
            },
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send("Lỗi: " + err);
            } else {
                if (index > 0) {
                    onDeleteItem(index - 1);
                } else {
                    return res.redirect("/");
                }
            }
        });
    }
    onDeleteItem(listItems.length - 1);
});


app.listen(port, () => {
    console.log(`localhost:${port}`)
})
