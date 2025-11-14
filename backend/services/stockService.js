const Medication = require('../models/Medication');
const SiteStock = require('../models/SiteStock');
const StockMovement = require('../models/StockMovement');

class StockService {
  /**
   * Vérifier si le stock global est suffisant pour une distribution
   * @param {Array} items - Liste des items à distribuer
   * @returns {Object} - Résultat de la vérification
   */
  static async validateGlobalStock(items) {
    const errors = [];
    const warnings = [];

    for (const item of items) {
      try {
        const medication = await Medication.findById(item.medication_id);
        if (!medication) {
          errors.push(`Médicament ID ${item.medication_id} non trouvé`);
          continue;
        }

        if (medication.quantity < item.quantity) {
          errors.push(
            `Stock insuffisant pour ${medication.name}: ` +
            `demandé ${item.quantity}, disponible ${medication.quantity}`
          );
        } else if (medication.quantity - item.quantity <= medication.min_stock) {
          warnings.push(
            `Attention: ${medication.name} sera en stock faible après distribution ` +
            `(${medication.quantity - item.quantity} restants, minimum: ${medication.min_stock})`
          );
        }
      } catch (error) {
        errors.push(`Erreur lors de la vérification du stock pour le médicament ID ${item.medication_id}: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Effectuer un transfert de stock (distribution)
   * @param {Object} transferData - Données du transfert
   * @returns {Object} - Résultat du transfert
   */
  static async performStockTransfer(transferData) {
    const {
      site_id,
      items,
      user_id,
      reference_type = 'DISTRIBUTION',
      reference_id = null,
      notes = null
    } = transferData;

    const { pool } = require('../config/database');
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const movements = [];
      const errors = [];

      for (const item of items) {
        try {
          // 1. Vérifier et diminuer le stock global
          const medication = await Medication.findById(item.medication_id);
          if (!medication) {
            throw new Error(`Médicament ID ${item.medication_id} non trouvé`);
          }

          if (medication.quantity < item.quantity) {
            throw new Error(
              `Stock insuffisant pour ${medication.name}: ` +
              `demandé ${item.quantity}, disponible ${medication.quantity}`
            );
          }

          // Diminuer le stock global
          await connection.execute(
            'UPDATE medications SET quantity = ?, updated_at = NOW() WHERE id = ?',
            [medication.quantity - item.quantity, medication.id]
          );

          // 2. Augmenter ou créer le stock du site
          // Vérifier si le stock existe déjà
          const [existingStocks] = await connection.execute(
            'SELECT * FROM site_stocks WHERE site_id = ? AND medication_id = ?',
            [site_id, item.medication_id]
          );
          
          if (existingStocks.length > 0) {
            // Mettre à jour le stock existant
            await connection.execute(
              'UPDATE site_stocks SET quantity = quantity + ?, updated_at = NOW() WHERE site_id = ? AND medication_id = ?',
              [item.quantity, site_id, item.medication_id]
            );
          } else {
            // Créer un nouveau stock pour le site
            await connection.execute(
              'INSERT INTO site_stocks (site_id, medication_id, quantity, min_stock, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
              [site_id, item.medication_id, item.quantity, medication.min_stock || 0]
            );
          }

          // 3. Enregistrer le mouvement de sortie (stock global)
          const [outResult] = await connection.execute(
            'INSERT INTO stock_movements (medication_id, movement_type, quantity, reference_type, reference_id, user_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [
              item.medication_id,
              'OUT',
              item.quantity,
              reference_type,
              reference_id,
              user_id,
              `Distribution vers site ${site_id}: ${notes || ''}`
            ]
          );
          const outMovementId = outResult.insertId;

          // 4. Enregistrer le mouvement d'entrée (stock site)
          const [inResult] = await connection.execute(
            'INSERT INTO stock_movements (medication_id, movement_type, quantity, reference_type, reference_id, site_id, to_site_id, user_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [
              item.medication_id,
              'TRANSFER_IN',
              item.quantity,
              reference_type,
              reference_id,
              site_id,
              site_id,
              user_id,
              `Réception depuis stock global: ${notes || ''}`
            ]
          );
          const inMovementId = inResult.insertId;

          // Récupérer la quantité finale du stock du site
          const [finalSiteStock] = await connection.execute(
            'SELECT quantity FROM site_stocks WHERE site_id = ? AND medication_id = ?',
            [site_id, item.medication_id]
          );

          movements.push({
            medication_id: item.medication_id,
            medication_name: medication.name,
            quantity: item.quantity,
            out_movement_id: outMovementId,
            in_movement_id: inMovementId,
            global_stock_after: medication.quantity - item.quantity,
            site_stock_after: finalSiteStock[0].quantity
          });

        } catch (error) {
          errors.push({
            medication_id: item.medication_id,
            error: error.message
          });
        }
      }

      if (errors.length > 0) {
        await connection.rollback();
        return {
          success: false,
          errors,
          movements: []
        };
      }

      await connection.commit();

      return {
        success: true,
        movements,
        errors: []
      };

    } catch (error) {
      await connection.rollback();
      throw new Error(`Erreur lors du transfert de stock: ${error.message}`);
    } finally {
      await connection.release();
    }
  }

  /**
   * Annuler un transfert de stock
   * @param {Object} cancelData - Données d'annulation
   * @returns {Object} - Résultat de l'annulation
   */
  static async cancelStockTransfer(cancelData) {
    const {
      reference_type,
      reference_id,
      user_id,
      notes = null
    } = cancelData;

    try {
      // Récupérer tous les mouvements liés à cette référence
      const movements = await StockMovement.findByReference(reference_type, reference_id);
      
      if (movements.length === 0) {
        throw new Error('Aucun mouvement trouvé pour cette référence');
      }

      const { pool } = require('../config/database');
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        const reversedMovements = [];

        for (const movement of movements) {
          try {
            if (movement.movement_type === 'OUT') {
              // Annuler une sortie = augmenter le stock global
              const medication = await Medication.findById(movement.medication_id);
              if (medication) {
                await medication.updateQuantity(medication.quantity + movement.quantity, 'ADD');
              }
            } else if (movement.movement_type === 'TRANSFER_IN' && movement.site_id) {
              // Annuler une entrée = diminuer le stock du site
              const siteStock = await SiteStock.findBySiteAndMedication(
                movement.site_id, 
                movement.medication_id
              );
              if (siteStock) {
                await siteStock.updateQuantity(movement.quantity, 'SUBTRACT');
              }
            }

            // Enregistrer le mouvement d'annulation
            const cancelMovementId = await StockMovement.create({
              medication_id: movement.medication_id,
              movement_type: movement.movement_type === 'OUT' ? 'IN' : 'TRANSFER_OUT',
              quantity: movement.quantity,
              reference_type: 'ADJUSTMENT',
              reference_id: null,
              site_id: movement.site_id,
              from_site_id: movement.site_id,
              user_id,
              notes: `Annulation de ${reference_type} #${reference_id}: ${notes || ''}`
            });

            reversedMovements.push({
              original_movement_id: movement.id,
              cancel_movement_id: cancelMovementId,
              medication_id: movement.medication_id,
              quantity: movement.quantity
            });

          } catch (error) {
            console.error(`Erreur lors de l'annulation du mouvement ${movement.id}:`, error);
          }
        }

        await connection.commit();

        return {
          success: true,
          reversed_movements: reversedMovements
        };

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        await connection.release();
      }

    } catch (error) {
      throw new Error(`Erreur lors de l'annulation du transfert: ${error.message}`);
    }
  }

  /**
   * Obtenir le résumé des stocks
   * @param {Object} filters - Filtres optionnels
   * @returns {Object} - Résumé des stocks
   */
  static async getStockSummary(filters = {}) {
    try {
      // Stock global
      const globalStocks = await Medication.findAll();
      const globalSummary = {
        total_medications: globalStocks.length,
        total_quantity: globalStocks.reduce((sum, med) => sum + med.quantity, 0),
        low_stock_count: globalStocks.filter(med => med.quantity <= med.min_stock).length,
        out_of_stock_count: globalStocks.filter(med => med.quantity === 0).length
      };

      // Stock par site
      const siteStocks = await SiteStock.findAll(filters);
      const siteSummary = {
        total_sites_with_stock: new Set(siteStocks.map(stock => stock.site_id)).size,
        total_items_in_sites: siteStocks.length,
        total_quantity_in_sites: siteStocks.reduce((sum, stock) => sum + stock.quantity, 0),
        low_stock_items: siteStocks.filter(stock => stock.isLowStock()).length,
        out_of_stock_items: siteStocks.filter(stock => stock.isOutOfStock()).length
      };

      return {
        global: globalSummary,
        sites: siteSummary,
        timestamp: new Date()
      };

    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
    }
  }

  /**
   * Synchroniser le stock d'un site avec le stock global
   * @param {number} site_id - ID du site
   * @param {number} user_id - ID de l'utilisateur
   * @returns {Object} - Résultat de la synchronisation
   */
  static async synchronizeSiteStock(site_id, user_id) {
    try {
      const siteStocks = await SiteStock.findBySite(site_id);
      const adjustments = [];

      for (const siteStock of siteStocks) {
        // Vérifier si le stock global a été mis à jour
        const medication = await Medication.findById(siteStock.medication_id);
        
        if (medication && medication.quantity !== siteStock.quantity) {
          // Enregistrer un mouvement d'ajustement
          await StockMovement.create({
            medication_id: siteStock.medication_id,
            movement_type: 'ADJUSTMENT',
            quantity: medication.quantity - siteStock.quantity,
            reference_type: 'ADJUSTMENT',
            reference_id: null,
            site_id,
            user_id: user_id || null,
            notes: `Synchronisation automatique avec stock global`
          });

          // Mettre à jour le stock du site
          await siteStock.updateQuantity(medication.quantity, 'SET');

          adjustments.push({
            medication_id: siteStock.medication_id,
            medication_name: medication.name,
            old_quantity: siteStock.quantity,
            new_quantity: medication.quantity,
            difference: medication.quantity - siteStock.quantity
          });
        }
      }

      return {
        success: true,
        adjustments,
        total_adjusted: adjustments.length
      };

    } catch (error) {
      throw new Error(`Erreur lors de la synchronisation: ${error.message}`);
    }
  }
}

module.exports = StockService;
