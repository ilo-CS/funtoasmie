const ROLES = {
  ADMIN: 'admin',
  ADMIN_PERSONNEL: 'admin personnel',
  USER: 'user',
  ADMIN_PHARMACIST: 'admin pharmacist',
  PHARMACIST: 'pharmacist',
  HEAD_DOCTOR: 'head doctor',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  NURSE: 'nurse'
};

class RoleService {
  static isValidRole(role) {
    return Object.values(ROLES).includes(role);
  }

  static getAllRoles() {
    return Object.values(ROLES);
  }
  static hasRole(user, roles) {
    if (!user || !user.role) return false;
    
    const userRole = user.role;
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    
    return rolesToCheck.includes(userRole);
  }

  static isAdmin(user) {
    return this.hasRole(user, ROLES.ADMIN);
  }

  static isEmployee(user) {
    return this.hasRole(user, [
      ROLES.USER, 
      ROLES.DOCTOR, 
      ROLES.HEAD_DOCTOR,
      ROLES.RECEPTIONIST, 
      ROLES.NURSE
    ]);
  }

  static isPharmacist(user) {
    return this.hasRole(user, [ROLES.PHARMACIST, ROLES.ADMIN_PHARMACIST]);
  }

  static canAccessPatientFeatures(user) {
    return this.hasRole(user, [
      ROLES.USER, 
      ROLES.DOCTOR, 
      ROLES.HEAD_DOCTOR,
      ROLES.RECEPTIONIST, 
      ROLES.NURSE, 
      ROLES.PHARMACIST,
      ROLES.ADMIN_PHARMACIST,
      ROLES.ADMIN_PERSONNEL,
      ROLES.ADMIN
    ]);
  }

  static getDefaultRole() {
    return ROLES.USER;
  }

  static getRolesForSelection() {
    return [
      { value: ROLES.ADMIN, label: 'Administrateur' },
      { value: ROLES.ADMIN_PERSONNEL, label: 'Personnel d\'administration' },
      { value: ROLES.USER, label: 'Utilisateur' },
      { value: ROLES.ADMIN_PHARMACIST, label: 'Administrateur Pharmacie' },
      { value: ROLES.PHARMACIST, label: 'Pharmacien' },
      { value: ROLES.HEAD_DOCTOR, label: 'Chef Médecin' },
      { value: ROLES.DOCTOR, label: 'Médecin' },
      { value: ROLES.RECEPTIONIST, label: 'Réceptionniste' },
      { value: ROLES.NURSE, label: 'Infirmière' }
    ];
  }
}

module.exports = {
  RoleService,
  ROLES
};
