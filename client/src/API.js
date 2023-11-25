import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';


/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) 
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}


// this function get's the list of all authors from database
const getAuthors = async () => {
  return getJson(fetch(SERVER_URL + 'authors', { credentials: 'include' })
  ).then( json => {
    return json.map((author) => {
      const clientPage = {
        id: author.id,
        name: author.name,
      }
      return clientPage;
    })
  })
}

// this function get's the website name from database
const getSiteName = async () => {
    return getJson( fetch(SERVER_URL + 'sitename', { credentials: 'include' }))
      .then( row => {
        const name = row.siteName
        return name;
      } )
  }


// this function updates site name from database
function updateSiteName(name) {
  return getJson(
    fetch(SERVER_URL + "updatesitename" , {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name:name
      }) 
    })
  )
}


// this fucntion returns a lits of all pages from database
const getPages = async () => {
  
  return getJson(fetch(SERVER_URL + 'pages', { credentials: 'include' })
  ).then( json => {
    return json.map((page) => {
      const clientPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        paragraph: page.paragraph,
        creation_date: page.creation_date,
        publication_date: page.publication_date,
        user: page.user
      }
      if (page.creation_date)
        clientPage.creation_date = dayjs(page.creation_date);
      if (page.publication_date)
      clientPage.publication_date = dayjs(page.publication_date);
      return clientPage;
    })
  })
}


// this fucntion returns a lits of all publisehd pages from database
const getPagesFilterPub = async () => {
  
  return getJson(fetch(SERVER_URL + 'pagesFilterPub', { credentials: 'include' })
  ).then( json => {
    return json.map((page) => {
      const clientPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        paragraph: page.paragraph,
        creation_date: page.creation_date,
        publication_date: page.publication_date,
        user: page.user
      }
      if (page.creation_date)
        clientPage.creation_date = dayjs(page.creation_date);
      if (page.publication_date)
      clientPage.publication_date = dayjs(page.publication_date);
      return clientPage;
    })
  })
}


// this fucntion returns a lits of all pages that are authored by a specific user from database
const getPagesFiltered = async (filterId) => {
  
  return getJson(fetch(SERVER_URL + 'pages/filter/' + filterId, { credentials: 'include' })
  ).then( json => {
    return json.map((page) => {
      const clientPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        paragraph: page.paragraph,
        creation_date: page.creation_date,
        publication_date: page.publication_date,
        user: page.user
      }
      if (page.creation_date)
        clientPage.creation_date = dayjs(page.creation_date);
      if (page.publication_date)
      clientPage.publication_date = dayjs(page.publication_date);
      return clientPage;
    })
  })
}

// this fucntion returns a lits of all pages that are not authored by a specific user from database
const getPagesFiltered_other = async (filterId) => {
  
  return getJson(fetch(SERVER_URL + 'pages/filter_other/' + filterId, { credentials: 'include' })
  ).then( json => {
    return json.map((page) => {
      const clientPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        paragraph: page.paragraph,
        creation_date: page.creation_date,
        publication_date: page.publication_date,
        user: page.user
      }
      if (page.creation_date)
        clientPage.creation_date = dayjs(page.creation_date);
      if (page.publication_date)
      clientPage.publication_date = dayjs(page.publication_date);
      return clientPage;
    })
  })
}


// Getting and returing a page, specifying its Id.
const getPage = async (pageId) => {
  return getJson( fetch(SERVER_URL + 'pages/' + pageId, { credentials: 'include' }))
    .then( page => {
      const clientPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        paragraph: page.paragraph,
        creation_date: page.creation_date,
        publication_date: page.publication_date,
        user: page.user,
        blocks: page.blocks
      }
      if (page.creation_date)
        clientPage.creation_date = dayjs(page.creation_date);
      if (page.publication_date)
      clientPage.publication_date = dayjs(page.publication_date);
      return clientPage;
    } )
}


// this fucntion updates a specific page data
function updatePage(page) {
  if (page && page.creation_date && (page.creation_date instanceof dayjs))
      page.creation_date = page.creation_date.format("YYYY-MM-DD");
  if (page && page.publication_date && (page.publication_date instanceof dayjs))
      page.publication_date = page.publication_date.format("YYYY-MM-DD");
  const clientPage = {
    id: page.id,
    title: page.title,
    author: page.author,
    creation_date: page.creation_date,
    publication_date: page.publication_date,
    user: page.user,
    blocks: page.blocks
  }
  return getJson(
    fetch(SERVER_URL + "pages/" + clientPage.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(clientPage) 
    })
  )
}


// This funciton adds a new page in the back-end library.
function addPage(page) {
  return getJson(
    fetch(SERVER_URL + "pages/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(page) 
    })
  )
}


// This function deletes a page from the back-end library.
function deletePage(pageId) {
  return getJson(
    fetch(SERVER_URL + "pages/" + pageId, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}


const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  )
};

const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    credentials: 'include'
  })
  )
};


//This function destroy the current user's session and execute the log-out.

const logOut = async() => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  
  })
  )
}

const API = { getAuthors, getSiteName, updateSiteName, getPages , getPagesFilterPub, getPagesFiltered, getPagesFiltered_other, getPage, addPage, deletePage, updatePage, logIn, getUserInfo, logOut};
export default API;
