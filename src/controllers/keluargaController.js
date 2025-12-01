import { KeluargaModel } from '../models/keluargaModel.js';
import { supabase } from '../config/supabase.js';

export const KeluargaController = {
  // Get all keluarga
  async getAll(req, res) {
    try {
      const keluargaList = await KeluargaModel.getAll();

      // Enrich each keluarga with kepala_keluarga info and anggota list
      const enriched = await Promise.all(keluargaList.map(async (k) => {
        const kepalaNik = k.kepala_keluarga_id || k.kepala_Keluarga_Id || null;

        let kepala = null;
        if (kepalaNik) {
          const { data: kepalaData } = await supabase
            .from('warga')
            .select('nik, namaWarga')
            .eq('nik', kepalaNik)
            .single();
          kepala = kepalaData || null;
        }

        const { data: anggota } = await supabase
          .from('warga')
          .select('nik, namaWarga')
          .eq('keluargaId', k.id);

        return {
          ...k,
          kepala_keluarga: kepala,
          anggota: anggota || []
        };
      }));

      res.status(200).json({
        success: true,
        message: 'Keluarga retrieved successfully',
        data: enriched
      });
    } catch (error) {
      console.error('Get all keluarga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get keluarga by id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const keluarga = await KeluargaModel.findById(id);

      if (!keluarga) {
        return res.status(404).json({
          success: false,
          message: 'Keluarga not found'
        });
      }

      // Resolve kepala_keluarga (if present) and anggota list
      const kepalaNik = keluarga.kepala_keluarga_id || keluarga.kepala_Keluarga_Id || null;
      let kepala = null;
      if (kepalaNik) {
        const { data: kepalaData } = await supabase
          .from('warga')
          .select('nik, namaWarga')
          .eq('nik', kepalaNik)
          .single();
        kepala = kepalaData || null;
      }

      const { data: anggota } = await supabase
        .from('warga')
        .select('nik, namaWarga')
        .eq('keluargaId', keluarga.id);

      res.status(200).json({
        success: true,
        message: 'Keluarga retrieved successfully',
        data: {
          ...keluarga,
          kepala_keluarga: kepala,
          anggota: anggota || []
        }
      });
    } catch (error) {
      console.error('Get keluarga by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Create new keluarga
  async create(req, res) {
    try {
      const { namaKeluarga, jumlahAnggota, rumahId, kepala_Keluarga_Id } = req.body;

      // Validate input
      if (!namaKeluarga || !jumlahAnggota) {
        return res.status(400).json({
          success: false,
          message: 'namaKeluarga and jumlahAnggota are required'
        });
      }

      // Validate jumlahAnggota is a number
      if (isNaN(jumlahAnggota) || jumlahAnggota < 1) {
        return res.status(400).json({
          success: false,
          message: 'jumlahAnggota must be a positive number'
        });
      }

      // Prepare keluarga data with correct column names
      const keluargaData = {
        namaKeluarga,
        jumlahanggota: parseInt(jumlahAnggota)
      };

      // Add optional fields
      if (rumahId) {
        keluargaData.rumahid = rumahId;
      }

      if (kepala_Keluarga_Id) {
        keluargaData.kepala_keluarga_id = kepala_Keluarga_Id;
      }

      const newKeluarga = await KeluargaModel.create(keluargaData);

      res.status(201).json({
        success: true,
        message: 'Keluarga created successfully',
        data: newKeluarga
      });
    } catch (error) {
      console.error('Create keluarga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Update keluarga
  async update(req, res) {
    try {
      const { id } = req.params;
      const { namaKeluarga, jumlahAnggota, rumahId, kepala_Keluarga_Id } = req.body;

      // Check if keluarga exists
      const existingKeluarga = await KeluargaModel.findById(id);
      if (!existingKeluarga) {
        return res.status(404).json({
          success: false,
          message: 'Keluarga not found'
        });
      }

      // Prepare update data with correct column names
      const updateData = {};
      if (namaKeluarga) updateData.namaKeluarga = namaKeluarga;
      if (jumlahAnggota) {
        if (isNaN(jumlahAnggota) || jumlahAnggota < 1) {
          return res.status(400).json({
            success: false,
            message: 'jumlahAnggota must be a positive number'
          });
        }
        updateData.jumlahanggota = parseInt(jumlahAnggota);
      }
      
      if (rumahId !== undefined) {
        updateData.rumahId = rumahId || null;
      }
      
      if (kepala_Keluarga_Id !== undefined) {
        updateData.kepala_keluarga_id = kepala_Keluarga_Id || null;
      }

      const updatedKeluarga = await KeluargaModel.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Keluarga updated successfully',
        data: updatedKeluarga
      });
    } catch (error) {
      console.error('Update keluarga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Delete keluarga
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if keluarga exists
      const existingKeluarga = await KeluargaModel.findById(id);
      if (!existingKeluarga) {
        return res.status(404).json({
          success: false,
          message: 'Keluarga not found'
        });
      }

      await KeluargaModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Keluarga deleted successfully'
      });
    } catch (error) {
      console.error('Delete keluarga error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};
