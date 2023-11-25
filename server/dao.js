'use strict';

const db = require('./db');


// This function retrieves the whole list of pages from the database without any filters.
exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Pages';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
   
};



// This function retrieves the pages that have been published(filter draft and programmed).
exports.listPagesFilterPublication = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Pages WHERE DATE(publication_date) <= DATE("now") ORDER BY publication_date ASC';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
   
};


// This function retrieves the pages that have been authored by specific user.
exports.getPageFilterUser = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Pages WHERE user=?';
    db.all(sql, [userId],(err, row) => {
      if (err) { reject(err); }
      if (row == undefined) {
        resolve({ error: 'pages not found with this userId.' });
      } else {
        resolve(row);
      }
    });
  });
};
  

// This function retrieves the all the pages that have not been authored by the user.
exports.getPageFilterUser_other = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Pages WHERE user!=?';
    db.all(sql, [userId],(err, row) => {
      if (err) { reject(err); }
      if (row == undefined) {
        resolve({ error: 'pages not found with this userId.' });
      } else {
        resolve(row);
      }
    });
  });
};


// This function retrieves a page based on it's page id.
exports.getPage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Pages WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row === undefined) {
        resolve({ error: 'page not found.' });
      } else {
        const sql2 = 'SELECT value,type FROM Blocks WHERE pageid = ? ORDER BY block_order';
        db.all(sql2, [row.id], (err, blocks) => {
          if (err) {
            reject(err);
          }
          const pageWithBlocks = { ...row, blocks: blocks };
          resolve(pageWithBlocks);
        });
      }
    });
  });
};


  
// This function adds a new page in the database.
exports.createPage = (page) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO Pages (user, title, author, creation_date, publication_date) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [page.user, page.title, page.author, page.creation_date, page.publication_date], function (err) {
      if (err) {
        reject(err);
        return;
      }
      const page_id = this.lastID;
      const blocks = page.blocks;

      const insertBlockPromises = blocks.map((block, i) => {
        return new Promise((resolve, reject) => {
          const sql_2 = 'INSERT INTO Blocks (pageid, block_order, value,type) VALUES (?, ?, ?,?)';
          db.run(sql_2, [page_id, i, block.value,block.type], function (err) {
            if (err) {
              reject(err);
            }
            resolve();
          });
        });
      });

      Promise.all(insertBlockPromises)
        .then(() => {
          resolve(exports.getPage(page_id));
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};


  
// This function updates an existing page given its id and the new properties.
exports.updatePage = (id, page) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE Pages SET user = ?, title = ?, author = ?, creation_date = ?, publication_date = ? WHERE id = ?';
    db.run(sql, [page.user, page.title, page.author, page.creation_date, page.publication_date, id], function (err) {
      if (err) {
        reject(err);
      }
      const page_id = id;
      const blocks = page.blocks;

      exports.deleteBlocks(page_id) // Assuming deleteBlocks returns a promise
        .then(() => {
          return Promise.all(exports.createBlocks(blocks, page_id)); // Assuming createBlocks returns a promise
        })
        .then(() => {
          resolve(exports.getPage(page_id));
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

  
// This function deletes an existing page given its id.
exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM Pages WHERE id = ?';
    db.run(sql, [id], (err) => {
      if (err) {
        reject(err);
      } 
      else
      {
        exports.deleteBlocks(id) // Assuming deleteBlocks returns a promise
        .then(() => {
          resolve(null);
        }).catch((err) => {
          reject(err);
        });
      }
    });
  });
}

// this function created new blocks in blocks table that store contents inside the pages.
exports.createBlocks = (blocks,page_id) => {
  return blocks.map((block, i) => {
    return new Promise((resolve, reject) => {
      const sql_2 = 'INSERT INTO Blocks (pageid, block_order, value, type) VALUES (?, ?, ?,?)';
      db.run(sql_2, [page_id, i, block.value,block.type], function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });
}


// this function deleted all the blocks with a specific pageid inside blocks table.
exports.deleteBlocks = (page_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM Blocks WHERE pageid = ?';
    db.run(sql, [page_id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};


// this fucntion retrieves the website name from base_info table in database.
exports.getSiteName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM base_info WHERE id=1';
    db.get(sql, [],(err, row) => {
      if (err) { reject(err); }
      if (row == undefined) {
        resolve({ error: 'pages not found with this userId.' });
      } else {
        resolve(row);
      }
    });
  });
};


// this function updates site name from base_info table.
exports.updateSiteName = (newName) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE base_info SET siteName = ? WHERE id = 1';
    db.run(sql, [newName], function (err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes === 0) {
          resolve({ error: 'No row found with the specified ID.' });
        } else {
          resolve({ success: 'Website name updated successfully.' });
        }
      }
    });
  });
};


// this function retrieves a list of all the authors registered in website.
exports.getAuthors = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id,name FROM users';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
   
};