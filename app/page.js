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

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar bg="light" variant="light" expand="lg" fixed="top" className="w-100">
        <Container fluid>
          <Navbar.Brand href="#">
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

    <Container fluid className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 style={{ marginTop: '7%'}}>Welcome to Pantry Assistant</h1>
      <img src="/logo.png" alt="Logo" style={{ maxWidth: '200px', height: 'auto' }} />

      <Modal show={open} onHide={handleClose} className="custom-modal">
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

      {/* <Button className="mb-4" variant="primary" onClick={handleOpen}>
        Add New Item
      </Button> */}
      <div className="mb-4 d-flex">
        <Button variant="primary" onClick={handleOpen} className="me-2">
          Add New Item
        </Button>
      </div>

      <Card style={{ width: '60%', marginBottom: '20px'}}>
        <Card.Header style={{ backgroundColor: '#ADD8E6' }}className="text-center">
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
                  <Button variant="outline-danger" onClick={() => removeItem(name)}>Remove</Button>
                </div>
              </Card.Body>
            </Card>
          ))
          )}
        </Card.Body>
      </Card>
    </Container>

    {/* Footer
    <footer className="fixed-bottom mt-3 bg-light text-center py-2 w-100" style={{ color: 'darkblue', fontSize: '12px' }}>
      <Container>
        <p className="mb-0">© 2024 @Koe Myint</p>
      </Container>
    </footer> */}
    </>
  );
}
