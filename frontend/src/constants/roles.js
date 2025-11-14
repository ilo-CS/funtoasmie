// Constantes pour les rôles utilisateur
export const ROLES = {
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

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.ADMIN_PERSONNEL]: 'personnel d\'administration',
  [ROLES.USER]: 'Utilisateur',
  [ROLES.ADMIN_PHARMACIST]: 'Administrateur Pharmacie',
  [ROLES.PHARMACIST]: 'Pharmacien',
  [ROLES.HEAD_DOCTOR]: 'Chef Médecin',
  [ROLES.DOCTOR]: 'Médecin',
  [ROLES.RECEPTIONIST]: 'Réceptionniste',
  [ROLES.NURSE]: 'Infirmière'
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'danger',
  [ROLES.ADMIN_PERSONNEL]: 'dark',
  [ROLES.USER]: 'primary',
  [ROLES.ADMIN_PHARMACIST]: 'success',
  [ROLES.PHARMACIST]: 'success',
  [ROLES.HEAD_DOCTOR]: 'warning',
  [ROLES.DOCTOR]: 'warning',
  [ROLES.RECEPTIONIST]: 'info',
  [ROLES.NURSE]: 'secondary'
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role;
export const getRoleColor = (role) => ROLE_COLORS[role] || 'primary';
