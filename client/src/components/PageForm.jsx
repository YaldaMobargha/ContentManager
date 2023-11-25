import dayjs from 'dayjs';

import {useState, useContext} from 'react';
import {Form, Button, Alert, Image, Row, Col} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../API';
import MessageContext from '../messageCtx';



const PageForm = (props) => {
   
  const [title, setTitle] = useState(props.page ? props.page.title : '');
  const [author, setAuthor] = useState(props.page ? props.page.author : props.user.name || '');
  const [user_id, setuser_id] = useState(props.user_id ? props.user_id : 1);
  const [creation_date, setCreationDate] = useState((props.page && props.page.creation_date) ? dayjs(props.page.creation_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD') || '');
  const [publication_date, setPublicationDate] = useState(
    (props.page && props.page.publication_date && dayjs(props.page.publication_date).format('YYYY-MM-DD')) || ''
  );
  const [header, setHeader] = useState('');
  const [addtextBoxValue, setAddTextBoxValue] = useState('');
  const [addheaderBoxValue, setHeaderTextBoxValue] = useState('');
  const [error, setError] = useState('');
  const [authorList,setAuthorList] = useState(props.authorList ? props.authorList : []);
  const [blocks, setBlocks] = useState(props.page ? props.page.blocks : []);
  const [selectedAuthorOption, setSelectedAuthorOption] = useState(props.page?props.page.user-1:1);


  // useNavigate hook to change page
  const navigate = useNavigate();
  const location = useLocation();
  const {handleErrors} = useContext(MessageContext);


  const handleAddInputChange = (event) => {
    setAddTextBoxValue(event.target.value);
  };



  // if the page is successfully added or edited we return to the user's page(logged in), 
  // otherwise, if cancel is pressed, we go back to the previous location.
  const nextpage = location.state?.nextpage || '/';

  const handleSubmit = (event) => {
    event.preventDefault();

    let countheader = 0;
    let countother = 0;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.type === 0) {
        countheader++;
      } else if (block.type === 1 || block.type === 2) {
        countother++;
      }
    }

    if (countheader<1 || countother<1) {
      setError('Please add at least one block of text/Image and one block of header.');
      return;
    }

    // String.trim() method is used for removing leading and ending whitespaces from the title.
    const page = {"user": user_id,"title": title.trim(), "author": author.trim(), "creation_date": creation_date, "publication_date": publication_date, "header":header.trim(), "blocks":  blocks}
    

    if(props.page) {
      page.id = props.page.id;
      props.editPage(page);
    }
    else
      props.addPage(page);

    navigate(nextpage);
  }


  const img = ["../src/images/1.jpg",
  "../src/images/2.jpg",
  "../src/images/3.jpg",
  "../src/images/4.jpg"]

  const handleAddImage = (value) => {
    return () => {
      const updatedBlocks = [...blocks];
      updatedBlocks.push({ type: 2, value: value });
      setBlocks(updatedBlocks);
    };
  };

  const handleAddHeaderBlock = (value) => {
    const updatedBlocks = [...blocks];
    updatedBlocks.push({type:0,value:value});
    setHeader('');
    setBlocks(updatedBlocks);
  };

  const handleAddTextBlock = (value) => {
    const updatedBlocks = [...blocks];
    updatedBlocks.push({type:1,value:value});
    setAddTextBoxValue('');
    setBlocks(updatedBlocks);
  };

  const handleTextChange = (index, value) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index].value = value;
    setBlocks(updatedBlocks);
  };

  const handleDeleteBlock = (index) => {
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index, 1);
    setBlocks(updatedBlocks);
  };

  const reorderArray = (event) => {
    const originalArray = [...blocks];
    const movedItem = originalArray.find((item, index) => index === event.oldIndex);
    const remainingItems = originalArray.filter((item, index) => index !== event.oldIndex);
  
    const reorderedItems = [
        ...remainingItems.slice(0, event.newIndex),
        movedItem,
        ...remainingItems.slice(event.newIndex)
    ];
  
    return reorderedItems;
  }


  function changeOrder(index, direction) {
    const updatedBlocks = reorderArray({oldIndex: index, newIndex: index + (direction === "UP" ? (-1) : 1)});
    setBlocks(updatedBlocks);
  }

  const updatePageAuthor = (page,index) => {
    API.updatePage(page)
      .then(() => {
        setSelectedAuthorOption(index)
      })
      .catch(e => handleErrors(e)); 
  }

  const handleSelectAuthorChange = (event) => {
    if(!props.page){
      setSelectedAuthorOption(event.target.value);
    }
    else
    {
      props.page.user = authorList[event.target.value].id;
      props.page.author = authorList[event.target.value].name;
      setAuthor(props.page.author);
      setuser_id(props.page.user);
      updatePageAuthor(props.page,event.target.value);
    }
  };
  // setSelectedAuthorOption(props.user_id);


  const containerStyle_1 = {
    display: 'flex',
    flexDirection: 'row',
  };

  const containerStyle_2 = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};


  return (!props.onlyView ? 
    
    <Form className="block-example border border-primary rounded mb-0 form-padding" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)}/>
      </Form.Group>


      {props.admin && props.page && (<Form.Group>
          <Form.Label>Author</Form.Label>
          <Form.Select value={selectedAuthorOption} onChange={handleSelectAuthorChange}>
            {authorList.map((author, index) => (
                <option key={index} value={index}>
                  {author.name}
                </option>
              ))}
          </Form.Select>
        </Form.Group>)}

      {props.admin && !props.page &&(<Form.Group className="mb-3">
      <Form.Label>Author</Form.Label>
      <Form.Control type="text" required={true} value={author} onChange={event => setAuthor(event.target.value)} readOnly
  style={{ pointerEvents: 'none' }}/>
    </Form.Group>)}

      {!props.admin &&(<Form.Group className="mb-3">
        <Form.Label>Author</Form.Label>
        <Form.Control type="text" required={true} value={author} onChange={event => setAuthor(event.target.value)} readOnly
    style={{ pointerEvents: 'none' }}/>
      </Form.Group>)}

      <Form.Group className="mb-3">
        <Form.Label>Creation Date</Form.Label>
        <Form.Control type="date" value={creation_date} onChange={event => setCreationDate(event.target.value)} readOnly
    style={{ pointerEvents: 'none' }}/>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Publication Date</Form.Label>
        <Form.Control
          type="date"
          value={publication_date}
          onChange={event => setPublicationDate(event.target.value)}
          min={creation_date} // Set the min attribute to today's date
        />
      </Form.Group>
      <div className='row'>
      {blocks.map((row, index) => (
        <div className="row mb-3" key={index}>
        <div className='col-1'>
            <div className='row'>
              <div className='col' style={containerStyle_2}>
                <Button onClick={() => changeOrder(index, "UP")}><i className="bi bi-arrow-up-circle"></i></Button>
              </div>
            </div>
            <div className='row'>
              <div className='col' style={containerStyle_2}>
                <Button  onClick={() => changeOrder(index, "DOWN")}><i className="bi bi-arrow-down-circle"></i></Button>
              </div>
            </div>
          </div>
          <div className='col-11'>
            <Form.Group style={containerStyle_1}>
              {row.type===0 && (<Form.Control type="text" required={true} value={row.value} onChange={(e) => handleTextChange(index, e.target.value)}/>)}
              {row.type===1 && (<Form.Control
                as="textarea" rows={3} value={row.value} onChange={(e) => handleTextChange(index, e.target.value)}
              />)}
              {row.type===2 && (<Image className='mb-2' src={row.value} thumbnail value={index}/>)}
              <Button variant="danger" onClick={() => handleDeleteBlock(index)}><i className="bi bi-trash"/></Button>
            </Form.Group>
          </div>
        </div>
      ))}
      </div>
      {/* <Form.Label>Please Choose one of this blocks:</Form.Label> */}
      <div className="row mb-3">
        <div className='col'>
          <div className='row'>
            <Form.Group className="mb-3">
              <Form.Label>Header</Form.Label>
              <Form.Control type="text" value={header} onChange={event => setHeader(event.target.value)} readOnly
    style={{ pointerEvents: 'none' }}/>
            </Form.Group>
          </div>
        <div className='row mb-3'>
          <Button variant='success' onClick={() => handleAddHeaderBlock(header)}>+</Button>
        </div>
        </div>
      </div>
      <div className="row mb-3">
          <div className='col-6'>
            <div className='row mb-3'>
              <Form.Group>
                <Form.Label>Text box:</Form.Label>
                <Form.Control
                  as="textarea" rows={3} value={addtextBoxValue}
                  onChange={handleAddInputChange} readOnly
                  style={{ pointerEvents: 'none' }}/>
              </Form.Group>
            </div>
            <div className='row mb-3'>
              <Button variant='success' onClick={() => handleAddTextBlock(addtextBoxValue)}>+</Button>
            </div>
          </div>
          <div className='col-6'>
            <div className='row'>
              <Form.Group className="mb-3 images-div">
                <Form.Label>Image:</Form.Label>
                  <div className='row'>
                      {img.map((path,index) =>(
                          <div className='col-3' key={index}> 
                              <Image className='mb-2' src={path} thumbnail value={index}/>
                            <div className='row'>
                            <Button variant="success" onClick={handleAddImage(path)}>+</Button>

                            </div>
                          </div>
                      ))}
                      </div>
              </Form.Group>
            </div>
          </div>
        </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button className="mb-3" variant="primary" type="submit">Save</Button>
      &nbsp;
      <Link className="btn btn-danger mb-3" to={nextpage}> Cancel </Link>
    </Form>
:
    <Form className="block-example border border-primary rounded mb-0 form-padding" onSubmit={handleSubmit}>
    <Form.Group className="mb-3">
      <Form.Label>Title</Form.Label>
      <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} readOnly
    style={{ pointerEvents: 'none' }}/>
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Author</Form.Label>
      <Form.Control type="text" required={true} value={author} onChange={event => setAuthor(event.target.value)} readOnly
    style={{ pointerEvents: 'none' }}/>
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Creation Date</Form.Label>
      <Form.Control type="date" value={creation_date} onChange={event => setCreationDate(event.target.value) } readOnly
    style={{ pointerEvents: 'none' }}/>
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Publication Date</Form.Label>
      <Form.Control type="date" value={publication_date} onChange={event => setPublicationDate(event.target.value) } readOnly
    style={{ pointerEvents: 'none' }}/>
    </Form.Group>

    <div className='row'>
      {blocks.map((row, index) => (
        <div className="row mb-3" key={index}>
          <div className='col-12'>
            <Form.Group style={containerStyle_1}>
              {row.type===0 && (<Form.Control type="text" required={true} value={row.value} onChange={(e) => handleTextChange(index, e.target.value)}/>)}
              {row.type===1 && (<Form.Control
                as="textarea" rows={3} value={row.value} onChange={(e) => handleTextChange(index, e.target.value)}
              />)}
              {row.type===2 && (<Image className='mb-2' src={row.value} thumbnail value={index}/>)}
            </Form.Group>
          </div>
        </div>
      ))}
      </div>

    
    <Link className="btn btn-primary mb-3"  to={nextpage}> Back </Link>
    </Form>
)

}

export default PageForm;
