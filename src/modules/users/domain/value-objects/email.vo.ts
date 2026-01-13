/**
 * Value Object para Email
 * Encapsula la lógica de validación de emails
 */
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email.toLowerCase().trim();
  }

  /**
   * Valida el formato del email
   */
  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene el valor del email
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara dos emails
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
