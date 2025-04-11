import express from 'express';

const router = express.Router();

// Get all pets
router.get('/', async (req, res) => {
  try {
    // Mock data for now
    const pets = [
      {
        id: '1',
        name: 'Max',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 2,
        gender: 'male',
        description: 'Friendly and energetic dog looking for a loving home',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
        shelterId: '1',
        status: 'available'
      }
    ];
    
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets' });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Mock data for now
    const pet = {
      id,
      name: 'Max',
      type: 'dog',
      breed: 'Golden Retriever',
      age: 2,
      gender: 'male',
      description: 'Friendly and energetic dog looking for a loving home',
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
      shelterId: '1',
      status: 'available'
    };
    
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pet' });
  }
});

export default router;