const functions = require('firebase-functions');

const app = require('express')();

const { db } = require('./utils/admin')

const FBAuth = require('./utils/fbAuth');

const { 
    getAllWinks, 
    postOneWink, 
    getWink, 
    commentOnWink,
    likeWink,
    unlikeWink,
    deleteWink
} = require('./handlers/winks');


const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead
 } = require('./handlers/users');

//wink route
app.get('/winks', getAllWinks);
app.post('/wink', FBAuth, postOneWink);
app.get('/wink/:winkId', getWink);
app.get('/wink/:winkId/like', FBAuth, likeWink);
app.get('/wink/:winkId/unlike', FBAuth, unlikeWink);
app.post('/wink/:winkId/comment', FBAuth, commentOnWink);
app.delete('/wink/:winkId', FBAuth, deleteWink);



//users route
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.region('europe-west1').https.onRequest(app);


//database triggers
exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/winks/${snapshot.data().winkId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`)
          .set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            winkId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });


exports.deleteNotificationOnUnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

  exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/winks/${snapshot.data().winkId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions
  .region('europe-west1')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('winks')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const wink = db.doc(`/winks/${doc.id}`);
            batch.update(wink, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions
  .region('europe-west1')
  .firestore.document('/winks/{winkId}')
  .onDelete((snapshot, context) => {
    const winkId = context.params.winkId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('winkId', '==', winkId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('winkId', '==', winkId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('winkId', '==', winkId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });