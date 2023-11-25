import {React, useEffect} from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton, LoginButton } from './Auth';
import API from '../API';


const Navigation = (props) => {

  useEffect(() => {
      API.getSiteName()
        .then(name => {
          props.setSiteName(name);
        })
        .catch(e => { handleErrors(e); } ); 
    }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
  }
  return (
    <Navbar bg="primary" expand="sm" variant="dark" fixed="top" className="navbar-padding justify-content-between">
        <Link to="/">
          <Navbar.Brand>
            <i className="bi bi-house-fill"></i>
            {props.siteName}
          </Navbar.Brand>
        </Link>

      <Nav className="ml-md-auto">
        <Navbar.Text className="d-flex align-items-center mx-2">
          {props.loggedIn && (
            <div>
              <Link to={"/page/" + props.user_id} state={{ nextpage: location.pathname }}>
                <i className="bi bi-person-fill icon-size" />
              </Link>
              {props.user && props.user.name && <span className="ml-2 welcome-message">Welcome, {props.user.name}!</span>}
            </div>
          )}
        </Navbar.Text>
        <Form className="d-flex align-items-center mx-2">
          {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
        </Form>
      </Nav>
    </Navbar>
    
  );
}

export { Navigation }; 