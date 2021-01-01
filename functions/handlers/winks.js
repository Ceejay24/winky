const { request } = require('express');
const { db } = require('../utils/admin');

exports.getAllWinks = (request, response) => {
    db
     .collection('winks')
     .orderBy('createdAt', 'desc')
     .get()
     .then((data) => {
         let winks = [];
         data.forEach((document) => {
            winks.push({
            winkId: document.id,
            body: document.data().body,
            userHandle: document.data().userHandle,
            createdAt: document.data().createdAt,
            likeCount: document.data().likeCount,
            userImage: document.data().userImage
          });
        });
         return response.json(winks);
     })
     .catch((err) => console.error(err));
}

//post a wink status
exports.postOneWink = (request, response) => {
    if(request.method !== 'POST'){
        return response.status(400).json({ error: `Method is not allowed`})
    }
    const newWink = {
        body: request.body.body,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };
    db
    .collection('winks')
    .add(newWink)
    .then(doc => {
        const responseWink = newWink;
        responseWink.winkId = doc.id;
        response.json({ responseWink });
    })
    .catch(err => {
        response.status(500).json({ error: `something went wrong` });
        console.error(err);
    });
}


// Fetch one wink
exports.getWink = (request, response) => {
    let winkData = {};
    db.doc(`/winks/${request.params.winkId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return response.status(404).json({ error: 'Wink not found' });
        }
        winkData = doc.data();
        winkData.winkId = doc.id;
        return db
          .collection('comments')
          .orderBy('createdAt', 'desc')
          .where('winkId', '==', request.params.winkId)
          .get();
      })
      .then((data) => {
        winkData.comments = [];
        data.forEach((document) => {
          winkData.comments.push(document.data());
        });
        return response.json(winkData);
      })
      .catch((err) => {
        console.error(err);
        response.status(500).json({ error: err.code });
      });
};


// Comment on a wink post
exports.commentOnWink = (request, response) => {
  if (request.body.body.trim() === '')
    return response.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: request.body.body,
    createdAt: new Date().toISOString(),
    screamId: request.params.winkId,
    userHandle: request.user.handle,
    userImage: request.user.imageUrl
  };
  console.log(newComment);

  db.doc(`/winks/${request.params.winkId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: 'Wink not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      response.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      response.status(500).json({ error: 'Something went wrong' });
    });
};

// Like a post
exports.likeWink = (request, response) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', request.user.handle)
    .where('winkId', '==', request.params.winkId)
    .limit(1);

  const winkDocument = db.doc(`/winks/${request.params.winkId}`);

  let winkData;

  winkDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        winkData = doc.data();
        winkData.winkId = doc.id;
        return likeDocument.get();
      } else {
        return response.status(404).json({ error: 'Wink not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection('likes')
          .add({
            winkId: request.params.winkId,
            userHandle: request.user.handle
          })
          .then(() => {
            winkData.likeCount++;
            return winkDocument.update({ likeCount: winkData.likeCount });
          })
          .then(() => {
            return response.json(winkData);
          });
      } else {
        return response.status(400).json({ error: 'Wink already liked' });
      }
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

//Unlike a Wink
exports.unlikeWink = (request, response) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', request.user.handle)
    .where('winkId', '==', request.params.winkId)
    .limit(1);

  const winkDocument = db.doc(`/winks/${request.params.winkId}`);

  let winkData;

  winkDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        winkData = doc.data();
        winkData.winkId = doc.id;
        return likeDocument.get();
      } else {
        return response.status(404).json({ error: 'Wink not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return response.status(400).json({ error: 'Wink not liked' });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            winkData.likeCount--;
            return winkDocument.update({ likeCount: winkData.likeCount });
          })
          .then(() => {
            response.json(winkData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

// Delete a scream
exports.deleteWink = (request, response) => {
  const document = db.doc(`/winks/${request.params.winkId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Wink not found' });
      }
      if (doc.data().userHandle !== request.user.handle) {
        return response.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      response.json({ message: 'Wink deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

