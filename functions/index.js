const functions = require("firebase-functions");
const admin = require('firebase-admin');
const moment = require('moment');

const express = require('express');
const cors = require('cors')
const app = express();

admin.initializeApp();

const db = admin.firestore();
const ticketsCollection = db.collection("tickets");
const cardsCollection = db.collection("cardprojects");

app.use(cors());

app.get('/', (req, res, next) => {
    res.send('Welcome')
});

app.post('/api/createticket', async (req, res) => {
    try {
        let ticket = {
            "ticketName": req.body.ticket_name,
            "ticketDescription": req.body.ticket_description,
            "ticketContact": req.body.ticket_contact,
            "createDate": new Date(),
            "updateDate": new Date(),
            "ticketStatus": "pending",
        }

        await ticketsCollection.add(ticket);
        res.status(200).json();

    }
    catch (err) {
        return res.json(err)
    }
});

app.post('/api/addcard', async (req, res) => {
    try {
        let cards = {
            "imgurl": req.body.imgurl,
            "title": req.body.title,
            "subtitle": req.body.subtitle,
            "text": req.body.text,
            "Link1D":req.body.Link1D,
            "Link1": req.body.Link1,
            "Link2D": req.body.Link2D,
            "Link2": req.body.Link2,
            "create_date" : new Date()
        }

        await cardsCollection.add(cards);
        res.status(200).json();

    }
    catch (err) {
        return res.json(err)
    }
});

app.get('/api/ticketlist', (req, res,) => {
    try {
        let allTic = [];
        ticketsCollection.orderBy("updateDate", "asc").get().then(async snapshot => {
            await snapshot.forEach(doc => {
                allTic.push({
                    "ticket_id": doc.id,
                    "ticketName": doc.data().ticketName,
                    "ticketDescription": doc.data().ticketDescription,
                    "ticketContact": doc.data().ticketContact,
                    "createDate": moment(doc.data().ticketContact.createDate).format('YYYY-MM-DD'),
                    "updateDate": moment(doc.data().ticketContact.updateDate).format('YYYY-MM-DD'),
                    "ticketStatus": doc.data().ticketStatus,
                })
            })
            return res.json({
                "statuscode": 200,
                "message": "OK",
                "data": allTic,
            })
        })
            .catch(err => {
                console.log('error', err);
            })
    }
    catch (err) {
        return res.json(err)
    }
});

app.get('/api/cardlist', (req, res,) => {
    try {
        let allCard = [];
        cardsCollection.orderBy("create_date", "asc").get().then(async snapshot => {
            await snapshot.forEach(doc => {
                allCard.push(doc.data())
            })
            return res.json({
                "statuscode": 200,
                "message": "OK",
                "data": allCard,
            })
        })
            .catch(err => {
                console.log('error', err);
            })
    }
    catch (err) {
        return res.json(err)
    }
});

app.post('/api/ticketByFilter', (req, res,) => {
    try {
        let allTic = [];
        let status_fil = req.body.filterStatus;

        let st_date = null;
        let en_date = null;
        if (req.body.start_date) {
            st_date = new Date(req.body.start_date)
        }
        if (req.body.end_date) {
            en_date = new Date(req.body.end_date)
        }

        var query = db.collection("tickets");

        if (status_fil) {
            query = query.where("ticketStatus", "==", status_fil);
        }

        if (st_date && en_date) {
            query = query.where("createDate", ">", st_date).where("createDate", "<", en_date);
        }

        query.get().then(async snapshot => {
            await snapshot.forEach(doc => {
                allTic.push(
                    {
                        "ticket_id": doc.id,
                        "ticketName": doc.data().ticketName,
                        "ticketDescription": doc.data().ticketDescription,
                        "ticketContact": doc.data().ticketContact,
                        "createDate": moment(doc.data().ticketContact.createDate).format('YYYY-MM-DD'),
                        "updateDate": moment(doc.data().ticketContact.updateDate).format('YYYY-MM-DD'),
                        "ticketStatus": doc.data().ticketStatus,
                    })
            })

            if (req.body.paginate) {
                allTic.slice(0, req.body.paginate)
            }

            return res.json({
                "statuscode": 200,
                "message": "OK",
                "data": allTic,
            })
        })
            .catch(err => {
                console.log('error', err);
            })

    }
    catch (err) {
        return res.json(err)
    }


});

app.get('/api/ticketById/:id', (req, res,) => {

    try {
        let allTic = [];
        let tickId = req.params.id;

        ticketsCollection.doc(tickId).get().then(doc => {

            allTic.push({
                "ticket_id": doc.id,
                "ticketName": doc.data().ticketName,
                "ticketDescription": doc.data().ticketDescription,
                "ticketContact": doc.data().ticketContact,
                "createDate": moment(doc.data().ticketContact.createDate).format('YYYY-MM-DD'),
                "updateDate": moment(doc.data().ticketContact.updateDate).format('YYYY-MM-DD'),
                "ticketStatus": doc.data().ticketStatus,
            })

            return res.json({
                "statuscode": 200,
                "message": "OK",
                "data": allTic,
            })
        })
            .catch(err => {
                console.log('error', err);
            })

    }
    catch (err) {
        return res.json(err)
    }


});

app.post('/api/updateTicketStatus/:id', (req, res,) => {

    try {
        let tickId = req.params.id;
        let newStatus = req.body.newstatus;

        if (newStatus == "pending" || newStatus == "accepted" || newStatus == "resolved" || newStatus == "rejected") {
            ticketsCollection.doc(tickId).update({
                "ticketStatus": newStatus,
                "updateDate": new Date(),
            })
            return res.json({
                "statuscode": 200,
                "message": "updated"
            })
        }
        else {
            return res.json({
                "statuscode": 500,
                "message": "status wrong"
            })
        }

    }
    catch (err) {
        return res.json(err)
    }


});

exports.app = functions.https.onRequest(app);
