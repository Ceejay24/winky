const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { database } = require('firebase-admin');


admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
    exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
 });

 exports.getWinks = functions.https.onRequest((request, response) => {
     admin
     .firestore()
     .collection('winks')
     .get()
     .then((data) => {
         let winks = [];
         data.forEach((doc) => {
             winks.push(doc.data());
         });
         return response.json(winks);
     })
     .catch((err) => console.error(err));
});


exports.createWinks = functions.https.onRequest((request, response) => {
    if(request.method !== 'POST'){
        return response.status(400).json({ error: `Method is not allowed`})
    }
    const newWink = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };
    admin.firestore()
    .collection('winks')
    .add(newWink)
    .then(doc => {
        response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
        response.status(500).json({ error: `something went wrong` });
        console.error(err);
    });
});
