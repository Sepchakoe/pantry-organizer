// pages/recipes.js 
// app/recipes/page.js
'use client'
import { useState, useEffect } from "react";
import { firestore } from '@/firebase'
import { collection, getDocs, query } from "firebase/firestore";
import { Modal, Container, Card,  Navbar, Nav, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import '/app/globals.css'; 


export default function Recipes() {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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

  const fetchRecipes = async () => {
    const ingredients = inventory.map(item => item.name).join(',');
    const apiKey = '5f8ec51c1c264338b06863563bb0c10e'; // Replace with your Spoonacular API key
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${apiKey}`;

    try {
      const response = await axios.get(url);
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const searchRecipes = async (query) => {
    const apiKey = '5f8ec51c1c264338b06863563bb0c10e';
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${apiKey}`;

    try {
      console.log(`Searching recipes for: ${query}`);
      const response = await axios.get(url);
      console.log('Search response:', response.data);
      setSearchResults(response.data.results);
      } catch (error) {
        console.error("Error searching recipes:", error);
      }
    };

    useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      fetchRecipes();
    }
  }, [inventory]);

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      searchRecipes(searchTerm);
    }
  };

  const handleAboutOpen = () => setAboutOpen(true);
  const handleAboutClose = () => setAboutOpen(false);

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
            <Nav className="me-auto">
              <Nav.Link href="/" className="mx-3">Home</Nav.Link>
              <Nav.Link href="/recipes" className="mx-3">Recipe Suggestion</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={aboutOpen} onHide={handleAboutClose} className="about-modal">
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
          <p>© 2024 @Koe Myint</p>
        </Modal.Footer>
      </Modal>

    <Container fluid className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 style={{ marginTop: '7%'}}>Recipe Suggestion</h1>
      <img src="/recipes.png" alt="Logo" style={{ maxWidth: '200px', height: 'auto' }} />

      <InputGroup className="mb-5 w-50">
        <Form.Control
          placeholder = "Search recipes..."
          value = {searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button 
          variant="outline-primary" 
          onClick={handleSearch}
        >
          Search
        </Button>
      </InputGroup>

      <Card style={{ width: '60%', marginBottom: '20px'}}>
        <Card.Header style={{ backgroundColor: '#ADD8E6' }}className="text-center">
          <h2 className="mt-1 mb-1">Pantry List</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            {inventory.length === 0 ? (
            <p className="text-center mt-3">Please add items in order to see recipe.</p>
          ):(
            inventory.map(({ name, quantity }) => (
              <Col key={name} md={6} lg={4} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{name.charAt(0).toUpperCase() + name.slice(1)}</Card.Title>
                    <Card.Text>Quantity: {quantity}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
          </Row>
        </Card.Body>
      </Card>

      
      <Row className="mt-3 g-4">
        {recipes.length > 0 ? (
          recipes.map(recipe => (
            <Col key={recipe.id} sm={12} md={6} lg={4} xl={3}>
              <Card className="h-100 recipe-card">
                <Card.Img 
                  variant="top" 
                  src={`https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`} 
                  className="recipe-card-img"
                />
                <Card.Body>
                  <Card.Title className="recipe-card-title">{recipe.title}</Card.Title>
                  <Card.Text className="text-muted">
                    <strong>Used:</strong> {recipe.usedIngredientCount} | 
                    <strong> Missed:</strong> {recipe.missedIngredientCount}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="text-center">
                  <Button 
                    variant="primary" 
                    href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`} 
                    target="_blank"
                  >
                    View Recipe
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">No recipe suggestions available.</p>
          </Col>
        )}
      </Row>

      {searchResults.length > 0 && (
        <>
          <h2 className="mt-5">Recipe with {searchTerm}</h2>
          <Row className="mt-3 g-4">
            {searchResults.map(recipe => (
              <Col key={recipe.id} sm={12} md={6} lg={4} xl={3}>
                <Card className="h-100 recipe-card">
                  <Card.Img
                    variant="top"
                    src={`https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`}
                    className="recipe-card-img"
                  />
                  <Card.Body>
                    <Card.Title className="recipe-card-title">{recipe.title}</Card.Title>
                  </Card.Body>
                  <Card.Footer className="text-center">
                    <Button
                      variant="primary"
                      href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`}
                      target="_blank"
                    >
                      View Recipe
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
    </>
  );
}
