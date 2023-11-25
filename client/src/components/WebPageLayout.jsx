import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Button ,Form} from 'react-bootstrap';
import { Link, useParams, useLocation, Outlet } from 'react-router-dom';

import PageForm from './PageForm';
import PageTable from './PageLibrary';
import { LoginForm } from './Auth';
import MessageContext from '../messageCtx';
import API from '../API';



function DefaultLayout(props) {

  const location = useLocation();

  const filterId = 1;
  
  return (
    <Row className="vh-100">
      <Col className="below-nav">
        <Outlet/>
      </Col>
    </Row>
  );
}

function AdminLayout(props) {

  const dirty = props.dirty;
  const setDirty = props.setDirty;
  const location = useLocation();

  const {handleErrors} = useContext(MessageContext);
  const filterId = 1;
  const [inputValue, setInputValue] = useState('');
 
  useEffect(() => {
    setDirty(true);
  }, [filterId])

  useEffect(() => {
    if (dirty) {
      API.getPages()
        .then(pages => {
          props.setPages(pages);
          setDirty(false);
        })
        .catch(e => { handleErrors(e); } ); 
    }
  }, [filterId, dirty]);

  const deletePage = (pageId) => {
    API.deletePage(pageId)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }

    // update a page 
  const updatePage = (page) => {
    API.updatePage(page)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }

  const updateSiteName = (name) => {
    API.updateSiteName(name)
      .then(() => { 
        setDirty(true);
        props.setSiteName(name); 
      })
      .catch(e => handleErrors(e)); 
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    updateSiteName(inputValue);
  };

  return (
    <>
      <h1 className="pb-3">Change Site Name:</h1>
      <Form>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Change site name"
            value={inputValue}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button onClick={handleSendClick}>Send</Button>
      </Form>
      <h1 className="pb-3">All Pages:</h1>
      <PageTable Pages={props.Pages} deletePage={deletePage} updatePages={updatePage} editable={true}/>
      <Link className="btn btn-primary btn-lg fixed-right-bottom" to="/add" state={{nextpage: location.pathname}}> &#43; </Link>
    </>
  )
}

function BackOfficeLayout(props) {

  const dirty = props.dirty;
  const setDirty = props.setDirty;
  const location = useLocation();
  const showpage = false;

  const {handleErrors} = useContext(MessageContext);
  const {filterId} = useParams();

  // Without this we do not pass the if(dirty) test in the [filterId, dirty] useEffect
  useEffect(() => {
    setDirty(true);
  }, [filterId])

  useEffect(() => {
    if (dirty) {
      API.getPagesFiltered_other(filterId)
        .then(pages => {
          props.setPages(pages);
          setDirty(false);
        })
        .catch(e => { handleErrors(e); } ); 
    }
  }, [filterId, dirty]);

  useEffect(() => {
    if (dirty) {
      API.getPagesFiltered(filterId)
        .then(pagesFiltered => {
          props.setpagesFiltered(pagesFiltered);
          setDirty(false);
        })
        .catch(e => { handleErrors(e); } ); 
    }
  }, [filterId, dirty]);

  const deletePage = (pageId) => {
    API.deletePage(pageId)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }

    // update a page
  const updatePage = (page) => {
    API.updatePage(page)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }

  return (
    <>
      <h1 className="pb-3">Authored Pages:</h1>
      <PageTable Pages={props.pagesFiltered} deletePage={deletePage} updatePages={updatePage} editable={true} showpage={showpage}/>
      <h1 className="pb-3">Other Pages:</h1>
      <PageTable Pages={props.Pages} deletePage={deletePage} updatePages={updatePage} editable={false} showpage={showpage}/>
      <Link className="btn btn-primary btn-lg fixed-right-bottom" to="/add" state={{nextpage: location.pathname}}> &#43; </Link>
    </>
  )
}

function FrontOfficeLayout(props) {

  const dirty = props.dirty;
  const setDirty = props.setDirty;
  const showpage = true;

  const {handleErrors} = useContext(MessageContext);
  const filterId = 1;

  // Without this we do not pass the if(dirty) test in the [filterId, dirty] useEffect
  useEffect(() => {
    setDirty(true);
  }, [filterId])

  useEffect(() => {
    if (dirty) {
      API.getPagesFilterPub()
        .then(pages => {
          props.setPages(pages);
          setDirty(false);
        })
        .catch(e => { handleErrors(e); } ); 
    }
  }, [filterId, dirty]);


  const deletePage = (pageId) => {
    API.deletePage(pageId)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }

    // update a page
  const updatePage = (page) => {
    API.updatePage(page)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }


  return (
    <>
      <h1 className="pb-3">All Pages:</h1>
      <PageTable Pages={props.Pages} deletePage={deletePage} updatePages={updatePage} editable={false} showpage={showpage}/>
    </>
  )
}

function AddLayout(props) {
  const {handleErrors} = useContext(MessageContext);
  const [authorList,setAuthorList] = useState([]);

  const setDirty = props.setDirty;
  const onlyView = false;

  useEffect(() => {
    API.getAuthors()
      .then(authors => {
        setAuthorList(authors);
      })
      .catch(e => {
        handleErrors(e); 
      }); 
  }, []);
  
  // add a page
  const addPage = (page) => {
    API.addPage(page)
      .catch(e => handleErrors(e)); 
  }
  return (
    <PageForm addPage={addPage} user={props.user} onlyView={onlyView} authorList={authorList} admin={props.admin} user_id={props.user_id} />
  );
}

function ViewLayout(props) {

  const onlyView = true;

  const setDirty = props.setDirty;
  const {handleErrors} = useContext(MessageContext);
  const { PageId } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    API.getPage(PageId)
      .then(page => {
        setPage(page);
      })
      .catch(e => {
        handleErrors(e); 
      }); 
  }, [PageId]);

  return (
    page ? <PageForm page={page} user={props.user} onlyView={onlyView} admin={props.admin} user_id={props.user_id}/> : <></>
  );

}

function EditLayout(props) {

  const onlyView = false;
  const setDirty = props.setDirty;
  const {handleErrors} = useContext(MessageContext);

  const { PageId } = useParams();
  const [page, setPage] = useState(null);
  const [authorList,setAuthorList] = useState([]);

  useEffect(() => {
    API.getPage(PageId)
      .then(page => {
        setPage(page);
      })
      .catch(e => {
        handleErrors(e); 
      }); 
  }, [PageId]);

  useEffect(() => {
    API.getAuthors()
      .then(authors => {
        setAuthorList(authors);
      })
      .catch(e => {
        handleErrors(e); 
      }); 
  }, []);

  // update a page
  const editPage = (page) => {
    API.updatePage(page)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e)); 
  }

  return (
    page ? <PageForm page={page} user={props.user} editPage={editPage} onlyView={onlyView} authorList={authorList} admin={props.admin} user_id={props.user_id}/> : <></>
  );

}

function NotFoundLayout() {
    return(
        <>
          <h2>This is not the route you are looking for!</h2>
          <Link to="/">
            <Button variant="primary">Go Home!</Button>
          </Link>
        </>
    );
  }

/**
 * This layout shuld be rendered while we are waiting a response from the server.
 */
function LoadingLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={4} bg="light" className="below-nav" id="left-sidebar">
      </Col>
      <Col md={8} className="below-nav">
        <h1>page Library ...</h1>
      </Col>
    </Row>
  )
}

function LoginLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={12} className="below-nav">
        <LoginForm login={props.login} user_id={props.user_id} />
      </Col>
    </Row>
  );
}

export { DefaultLayout, AddLayout, ViewLayout, EditLayout, NotFoundLayout, FrontOfficeLayout ,BackOfficeLayout ,AdminLayout, LoadingLayout ,LoginLayout}; 
