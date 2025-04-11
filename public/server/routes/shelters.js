import express from 'express';

const router = express.Router();

// Get all shelters
router.get('/', async (req, res) => {
  try {
    // Mock data for now
    const shelters = [
      {
        id: '1',
        name: 'Happy Paws Shelter',
        location: '123 Pet Street, Anytown, USA',
        contact: 'contact@happypaws.com',
        description: 'A loving shelter dedicated to finding forever homes for pets'
      }
    ];
    
    res.json(shelters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shelters' });
  }
});

// Get single shelter
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Mock data for now
    const shelter = {
      id,
      name: 'Happy Paws Shelter',
      location: '123 Pet Street, Anytown, USA',
      contact: 'contact@happypaws.com',
      description: 'A loving shelter dedicated to finding forever homes for pets'
    };
    
    res.json(shelter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shelter' });
  }
});

export default router;