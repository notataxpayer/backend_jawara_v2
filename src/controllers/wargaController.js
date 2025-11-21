import { WargaModel } from '../models/wargaModel.js';

export const WargaController = {
  // Get all warga
  async getAll(req, res) {
    try {
      const warga = await WargaModel.getAll();

      res.status(200).json({
        success: true,
        message: 'Warga retrieved successfully',
        data: warga
      });
    } catch (error) {
      console.error('Get all warga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get warga by NIK
  async getByNIK(req, res) {
    try {
      const { nik } = req.params;
      const warga = await WargaModel.findByNIK(nik);

      if (!warga) {
        return res.status(404).json({
          success: false,
          message: 'Warga not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Warga retrieved successfully',
        data: warga
      });
    } catch (error) {
      console.error('Get warga by NIK error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Create new warga
  async create(req, res) {
    try {
      const { nik, namaWarga, jenisKelamin, statusDomisili, statusHidup, keluargaId } = req.body;

      // Validate required fields
      if (!nik || !namaWarga || !jenisKelamin || !statusDomisili || !statusHidup) {
        return res.status(400).json({
          success: false,
          message: 'nik, namaWarga, jenisKelamin, statusDomisili, and statusHidup are required'
        });
      }

      // Validate NIK format (should be 16 digits)
      if (!/^\d{16}$/.test(nik)) {
        return res.status(400).json({
          success: false,
          message: 'nik must be 16 digits'
        });
      }

      // Check if NIK already exists
      const existingWarga = await WargaModel.findByNIK(nik);
      if (existingWarga) {
        return res.status(409).json({
          success: false,
          message: 'NIK already exists'
        });
      }

      // Validate jenisKelamin
      if (!['Laki-laki', 'Perempuan'].includes(jenisKelamin)) {
        return res.status(400).json({
          success: false,
          message: 'jenisKelamin must be either L or P'
        });
      }

      // Prepare warga data
      const wargaData = {
        nik,
        namaWarga,
        jenisKelamin,
        statusDomisili,
        statusHidup
      };

      // Add KeluargaId only if provided
      if (keluargaId) {
        wargaData.keluargaId = keluargaId;
      }

      const newWarga = await WargaModel.create(wargaData);

      res.status(201).json({
        success: true,
        message: 'Warga created successfully',
        data: newWarga
      });
    } catch (error) {
      console.error('Create warga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Update warga
  async update(req, res) {
    try {
      const { nik } = req.params;
      const { namaWarga, jenisKelamin, statusDomisili, statusHidup, keluargaId } = req.body;

      // Check if warga exists
      const existingWarga = await WargaModel.findByNIK(nik);
      if (!existingWarga) {
        return res.status(404).json({
          success: false,
          message: 'Warga not found'
        });
      }

      // Prepare update data
      const updateData = {};
      if (namaWarga) updateData.namaWarga = namaWarga;
      if (jenisKelamin) {
        if (!['Laki-laki', 'Perempuan'].includes(jenisKelamin)) {
          return res.status(400).json({
            success: false,
            message: 'jenisKelamin must be either Laki-laki or Perempuan'
          });
        }
        updateData.jenisKelamin = jenisKelamin;
      }
      if (statusDomisili) updateData.statusDomisili = statusDomisili;
      if (statusHidup) updateData.statusHidup = statusHidup;
      if (keluargaId !== undefined) {
        updateData.keluargaId = keluargaId || null;
      }

      const updatedWarga = await WargaModel.update(nik, updateData);

      res.status(200).json({
        success: true,
        message: 'Warga updated successfully',
        data: updatedWarga
      });
    } catch (error) {
      console.error('Update warga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Delete warga
  async delete(req, res) {
    try {
      const { nik } = req.params;

      // Check if warga exists
      const existingWarga = await WargaModel.findByNIK(nik);
      if (!existingWarga) {
        return res.status(404).json({
          success: false,
          message: 'Warga not found'
        });
      }

      await WargaModel.delete(nik);

      res.status(200).json({
        success: true,
        message: 'Warga deleted successfully'
      });
    } catch (error) {
      console.error('Delete warga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};
