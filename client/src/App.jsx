import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { React, useState, useEffect } from 'react';
import { Container, Toast } from 'react-bootstrap/'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Navigation } from './components/Navigation';
import { FrontOfficeLayout, BackOfficeLayout, AdminLayout, AddLayout, EditLayout, DefaultLayout, NotFoundLayout, LoadingLayout ,LoginLayout, ViewLayout} from './components/WebPageLayout';

import MessageContext from './messageCtx';
import API from './API';

function App() {

  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(true);

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);

  // This state keeps track if the user is currently admin.
  const [Admin, setAdmin] = useState(false);

  // This state contains the user's info.
  const [user, setUser] = useState(null);

  const [user_id, setUser_id] = useState(1);

  // This state is used for displaying a LoadingLayout while we are waiting an answer from the server.
  const [loading, setLoading] = useState(false);

  // This state contains the list of pages.
  const [pages, setPages] = useState([]);

  const [pagesFiltered, setpagesFiltered] = useState([]);

  const [siteName, setSiteName] = useState(['']);

  const saveLoggedInStatus = (value) => {
    document.cookie = 'loggedIn=' + value;
  };

  const getStoredLoggedInStatus = () => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('loggedIn=')) {
        const value = cookie.substring('loggedIn='.length, cookie.length);
        return value === 'true';
      }
    }
    return false;
  };

  // If an error occurs, the error message will be shown in a toast.
  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); // WARN: a more complex application requires a queue of messages. In this example only last error is shown.
  }

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        if(getStoredLoggedInStatus()){
          const user = await API.getUserInfo();  // here you have the user info, if already logged in
          setUser(user);
          if(user.admin==1 || user.admin=="1"){
            setAdmin(true);
          }
          setLoggedIn(true);
        }
        setLoading(false);
      } catch (err) {
        // handleErrors(err); // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false); setLoading(false);
      }
    };
    init();
  }, []);
  

   /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
   */
   const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setUser_id(user.id);
      if(user.admin==1){
        setAdmin(true);
      }
      else{
        setAdmin(false);
      }
      setLoggedIn(true);
      saveLoggedInStatus(true);
      navigate('/page/1');
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function handles the logout.
   */ 
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    saveLoggedInStatus(false);
    // clean up everything
    setUser(null);
  };

  return (
    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
        <Container fluid className='App'>
          <Navigation logout={handleLogout} user={user} user_id={user_id} loggedIn={loggedIn} siteName={siteName} setSiteName={setSiteName} />
          <Routes>
            <Route path="/" element={ loading ? <LoadingLayout /> : <DefaultLayout pages={pages} pagesFiltered={pagesFiltered} /> } >
              <Route index element={ loggedIn ? <FrontOfficeLayout Pages={pages} setPages={setPages} dirty={dirty} setDirty={setDirty} /> : <FrontOfficeLayout Pages={pages} setPages={setPages} dirty={dirty} setDirty={setDirty} /> } />
              <Route path="page/:filterId" element={loggedIn ? (Admin ? <AdminLayout Pages={pages} setPages={setPages} pagesFiltered={pagesFiltered} setpagesFiltered={setpagesFiltered} dirty={dirty} setDirty={setDirty} setSiteName={setSiteName} /> : <BackOfficeLayout Pages={pages} setPages={setPages} pagesFiltered={pagesFiltered} setpagesFiltered={setpagesFiltered} dirty={dirty} setDirty={setDirty} />) : <Navigate replace to='/login' />} />
              <Route path="add" element={loggedIn ? <AddLayout user={user} admin={Admin} user_id={user_id} /> : <Navigate replace to='/login' /> } />
              <Route path="edit/:PageId" element={loggedIn ? <EditLayout Pages={pages} user={user} admin={Admin} user_id={user_id} setDirty={setDirty} /> : <Navigate replace to='/login' />} />
              <Route path="view/:PageId" element={<ViewLayout Pages={pages} user={user} admin={Admin} user_id={user_id}/>}/>
              <Route path="*" element={<NotFoundLayout />} />
            </Route>
            <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin} user_id={user_id}/> : <Navigate replace to={'/page/' + user_id} />} />
          </Routes>
          <Toast show={message !== ''} onClose={() => setMessage('')} delay={4000} autohide bg="danger">
            <Toast.Body>{ message }</Toast.Body>
          </Toast>
        </Container>
      </MessageContext.Provider>
    </BrowserRouter>
  );

}

export default App;
