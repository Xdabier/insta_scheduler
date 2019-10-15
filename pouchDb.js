const PouchDB = require('pouchdb');
const db = new PouchDB('posts');


const addPost = async function (name, caption) {
    return db.put({_id: 'id' + name,  name, caption, added: new Date().getTime()});
};

const getPosts = async () => {
  return db.allDocs({include_docs: true, descending: true});
};

module.exports = {
    addPost,
    getPosts
};
