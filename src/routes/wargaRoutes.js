import express from 'express';
import { WargaController } from '../controllers/wargaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Warga
 *   description: Warga management endpoints
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/warga:
 *   get:
 *     summary: Get all warga
 *     tags: [Warga]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of warga
 */
router.get('/', WargaController.getAll);

/**
 * @swagger
 * /api/warga/{nik}:
 *   get:
 *     summary: Get warga by NIK
 *     tags: [Warga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nik
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warga details
 *       404:
 *         description: Warga not found
 */
router.get('/:nik', WargaController.getByNIK);

/**
 * @swagger
 * /api/warga:
 *   post:
 *     summary: Create new warga (adminSistem, ketuaRT, ketuaRW only)
 *     tags: [Warga]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nik
 *               - namaWarga
 *               - jenisKelamin
 *               - statusDomisili
 *               - statusHidup
 *             properties:
 *               nik:
 *                 type: string
 *                 pattern: '^\\d{16}$'
 *               namaWarga:
 *                 type: string
 *               jenisKelamin:
 *                 type: string
 *                 enum: [Laki-laki, Perempuan]
 *               statusDomisili:
 *                 type: string
 *               statusHidup:
 *                 type: string
 *               keluargaId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Warga created
 *       409:
 *         description: NIK already exists
 */
router.post(
  '/',
  roleMiddleware(['adminSistem', 'ketuaRT', 'ketuaRW']),
  WargaController.create
);

/**
 * @swagger
 * /api/warga/{nik}:
 *   put:
 *     summary: Update warga (adminSistem, ketuaRT, ketuaRW only)
 *     tags: [Warga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nik
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               namaWarga:
 *                 type: string
 *               jenisKelamin:
 *                 type: string
 *               statusDomisili:
 *                 type: string
 *               statusHidup:
 *                 type: string
 *               keluargaId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Warga updated
 *       404:
 *         description: Warga not found
 */
router.put(
  '/:nik',
  roleMiddleware(['adminSistem', 'ketuaRT', 'ketuaRW']),
  WargaController.update
);

/**
 * @swagger
 * /api/warga/{nik}:
 *   delete:
 *     summary: Delete warga (adminSistem, ketuaRT, ketuaRW only)
 *     tags: [Warga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nik
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warga deleted
 *       404:
 *         description: Warga not found
 */
router.delete(
  '/:nik',
  roleMiddleware(['adminSistem', 'ketuaRT', 'ketuaRW']),
  WargaController.delete
);

export default router;
