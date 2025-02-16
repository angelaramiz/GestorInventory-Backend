import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Ruta temporal para prueba
app.get('/productos', (req, res) => {
    res.json([{ codigo: '123', nombre: 'Producto de prueba' }]);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor backend en http://localhost:${PORT}`);
});