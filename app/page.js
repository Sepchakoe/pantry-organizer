'use client'
import { useState, useEffect } from "react";
import { firestore } from '@/firebase'
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, InputGroup, Container, Card, ListGroup, Navbar, Nav } from 'react-bootstrap';
import '/app/globals.css'; 

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [aboutOpen, setAboutOpen] = useState(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      }); 
    });
    setInventory(inventoryList);
  };


  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }
    await updateInventory();
  };
  
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAboutOpen = () => setAboutOpen(true);
  const handleAboutClose = () => setAboutOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar bg="light" variant="light" expand="lg" fixed="top" className="w-100">
        <Container fluid>
          <Navbar.Brand onClick={handleAboutOpen} style={{cursor: 'pointer'}}>
            <img
              src="/logo.png"
              width="40"
              height="40"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ">
              <Nav.Link href="/" className="mx-3">Home</Nav.Link>
              <Nav.Link href="/recipes" className="mx-3">Recipe Suggestion</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal className="about-modal" show={aboutOpen} onHide={handleAboutClose}>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Pantry Assistant</Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="d-flex justify-content-center">
          <img
            src="/logo.png"
            width="100"
            height="100"
            className="align-center"
          />
        </Modal.Body>

        <Modal.Body className="w-100 text-center">
          <p>A simple and intuitive pantry assistant designed to help you keep track of your ingredients and get personalized recipe suggestions based on your pantry list. You can also search for recipes by entering the ingredients you have on hand.</p>
        </Modal.Body>
          
        <Modal.Footer className="mb-0 text-center py-2 w-100" style={{ color: '#87510f', fontSize: '12px' }}>
          <p>Koe Myint © 2024</p>
        </Modal.Footer>
      </Modal>

    <Container fluid className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 style={{ marginTop: '7%'}}>Welcome to Pantry Assistant</h1>
      <img src="/logo.png" alt="Logo" style={{ maxWidth: '200px', height: 'auto' }} />

      <Modal className="custom-modal" show={open} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
            />
          <Form.Control
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(Number(e.target.value))}
            placeholder="Quantity"
            min="1"
          />

          <Button
            variant="outline-primary"
            onClick={() => {
            addItem(itemName, itemQuantity);
            setItemName('');
            setItemQuantity(1);
            handleClose();
            }}
          >
          Add
          </Button>
          </InputGroup>
        </Modal.Body>
      </Modal>

      <InputGroup className="mb-4 w-50" >
        <Form.Control
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <div className="mb-4 d-flex">
        <Button variant="primary" onClick={handleOpen} className="me-2">
          Add New Item
        </Button>
      </div>

      <Card style={{ width: '60%', marginBottom: '20px'}}>
        <Card.Header style={{ backgroundColor: '#ADD8E6'}} className="text-center">
          <h2 className="mt-1 mb-1">Pantry List</h2>
        </Card.Header>
        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto'}}>
          {filteredInventory.length === 0 ? (
            <p className="text-center mt-3">There is no item in the Pantry List. Please add the items.</p>
          ):(
          filteredInventory.map(({ name, quantity }) => (
            <Card className="mb-2" key={name}>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1 fs-4">{name.charAt(0).toUpperCase() + name.slice(1)}</h3>
                  <p className="mb-0 fs-6">Quantity: {quantity}</p>
                </div>
                <div className="d-flex">
                  <Button variant="outline-success" className="me-2" onClick={() => addItem(name, 1)}>Add</Button>
                  <Button variant="outline-danger" className="me-2" onClick={() => removeItem(name)}>Remove</Button>
                  <Button variant="outline-danger" className="me-2" onClick={() => deleteItem(name)}>Delete</Button>
                </div>
              </Card.Body>
            </Card>
          ))
          )}
        </Card.Body>
      </Card>
    </Container>
    </>
  );
}
