/**
 * Roles de usuario en el sistema
 */
export enum UserRole {
  USER = 'user',
  SPONSOR = 'sponsor',
  ADMIN = 'admin',
}

/**
 * Estados de un patrocinador
 */
export enum SponsorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISABLED = 'disabled',
}

/**
 * Métodos de verificación para objetivos patrocinados
 */
export enum VerificationMethod {
  QR = 'qr',
  CHECKLIST = 'checklist',
  MANUAL = 'manual',
  EXTERNAL_API = 'external_api',
}

/**
 * Estado de inscripción a un objetivo patrocinado
 * Las inscripciones son automáticas (siempre empiezan en ACTIVE)
 */
export enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
}

/**
 * Estado de una milestone
 */
export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * Estado de una task
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * Estado de una recompensa de usuario
 */
export enum UserRewardStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  DELIVERED = 'delivered',
}

/**
 * Tipos de fuente para transacciones de puntos
 */
export enum PointsSourceType {
  TASK = 'task',
  DAILY = 'daily',
  SPONSORED_GOAL = 'sponsored_goal',
  REVIEW = 'review',
  BADGE = 'badge',
}

/**
 * Niveles de dificultad para entradas diarias
 */
export enum Difficulty {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Cambios de energía para entradas diarias
 */
export enum EnergyChange {
  INCREASED = 'increased',
  STABLE = 'stable',
  DECREASED = 'decreased',
}
