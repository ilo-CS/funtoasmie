const { query } = require('../config/database');

class DistributionItem {
    constructor(data) {
        this.id = data.id;
        this.distribution_id = data.distribution_id;
        this.medication_id = data.medication_id;
        this.quantity = data.quantity;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Créer un item de distribution
    static async create(data) {
        try {
            const sql = `
                INSERT INTO distribution_items (distribution_id, medication_id, quantity)
                VALUES (?, ?, ?)
            `;
            const result = await query(sql, [data.distribution_id, data.medication_id, data.quantity]);
            return new DistributionItem({ id: result.insertId, ...data });
        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'item de distribution:', error);
            throw new Error(`Erreur lors de la création de l'item: ${error.message}`);
        }
    }

    // Récupérer tous les items d'une distribution
    static async getByDistributionId(distributionId) {
        try {
            const sql = `
                SELECT di.*, m.name as medication_name, m.unit_name
                FROM distribution_items di
                JOIN medications m ON di.medication_id = m.id
                WHERE di.distribution_id = ?
                ORDER BY m.name
            `;
            const results = await query(sql, [distributionId]);
            return results.map(item => new DistributionItem(item));
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des items:', error);
            throw new Error(`Erreur lors de la récupération des items: ${error.message}`);
        }
    }

    // Récupérer un item par ID
    static async getById(id) {
        try {
            const sql = `
                SELECT di.*, m.name as medication_name, m.unit_name
                FROM distribution_items di
                JOIN medications m ON di.medication_id = m.id
                WHERE di.id = ?
            `;
            const [result] = await query(sql, [id]);
            return result ? new DistributionItem(result) : null;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de l\'item:', error);
            throw new Error(`Erreur lors de la récupération de l'item: ${error.message}`);
        }
    }

    // Mettre à jour un item
    static async update(id, data) {
        try {
            const sql = `
                UPDATE distribution_items 
                SET medication_id = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await query(sql, [data.medication_id, data.quantity, id]);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de l\'item:', error);
            throw new Error(`Erreur lors de la mise à jour de l'item: ${error.message}`);
        }
    }

    // Supprimer un item
    static async delete(id) {
        try {
            const sql = 'DELETE FROM distribution_items WHERE id = ?';
            await query(sql, [id]);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'item:', error);
            throw new Error(`Erreur lors de la suppression de l'item: ${error.message}`);
        }
    }

    // Supprimer tous les items d'une distribution
    static async deleteByDistributionId(distributionId) {
        try {
            const sql = 'DELETE FROM distribution_items WHERE distribution_id = ?';
            await query(sql, [distributionId]);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression des items:', error);
            throw new Error(`Erreur lors de la suppression des items: ${error.message}`);
        }
    }

    // Récupérer les statistiques des items
    static async getStatistics() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_items,
                    SUM(quantity) as total_quantity,
                    COUNT(DISTINCT distribution_id) as distributions_count,
                    COUNT(DISTINCT medication_id) as medications_count
                FROM distribution_items
            `;
            const [result] = await query(sql);
            return result;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des statistiques:', error);
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    // Récupérer les items par médicament
    static async getByMedicationId(medicationId) {
        try {
            const sql = `
                SELECT di.*, d.site_id, s.name as site_name, d.status
                FROM distribution_items di
                JOIN distributions d ON di.distribution_id = d.id
                JOIN sites s ON d.site_id = s.id
                WHERE di.medication_id = ?
                ORDER BY d.created_at DESC
            `;
            const results = await query(sql, [medicationId]);
            return results.map(item => new DistributionItem(item));
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des items par médicament:', error);
            throw new Error(`Erreur lors de la récupération des items par médicament: ${error.message}`);
        }
    }
}

module.exports = DistributionItem;

