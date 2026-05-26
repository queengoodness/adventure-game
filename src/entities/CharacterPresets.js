/**
 * Character Presets - Cyberpunk Gaming Characters
 * Image 1: Gamer #1 - Tech Hacker (Burgundy & White)
 * Image 2: Gamer #2 - Young Prodigy (Yellow & Purple)
 */

export const CHARACTERS = {
  HACKER: {
    id: 'hacker',
    name: 'Kai - Tech Hacker',
    description: 'A skilled hacker with advanced tech gear. Masters digital magic and precision attacks.',
    image: 1,
    color: '#8B0000', // Burgundy
    stats: {
      health: 100,
      mana: 80,
      stamina: 100,
      strength: 7,
      intelligence: 10,
      dexterity: 9,
      defense: 6,
      magicDefense: 8
    },
    equipment: {
      weapon: 'Digital Blade',
      armor: 'Tech Suit',
      accessory: 'Headphones'
    },
    spells: ['ElectricShock', 'DataMine', 'SystemOverload'],
    specialAbility: 'Hack',
    backstory: 'A cyberpunk hacker who escaped the corporate grid and now seeks ancient digital artifacts in a fantasy realm.'
  },

  PRODIGY: {
    id: 'prodigy',
    name: 'Nova - Young Prodigy',
    description: 'A talented young gamer with raw power and potential. Quick reflexes and high energy.',
    image: 2,
    color: '#FFD700', // Gold
    stats: {
      health: 90,
      mana: 120,
      stamina: 110,
      strength: 8,
      intelligence: 9,
      dexterity: 10,
      defense: 5,
      magicDefense: 9
    },
    equipment: {
      weapon: 'Gaming Gauntlets',
      armor: 'Star Jacket',
      accessory: 'Power Chain'
    },
    spells: ['StarBurst', 'GoldenShield', 'PowerSurge'],
    specialAbility: 'LevelUp',
    backstory: 'A young prodigy gamer transported to a magical world where their gaming skills become real powers.'
  }
};

export class Character {
  constructor(preset) {
    this.id = preset.id;
    this.name = preset.name;
    this.description = preset.description;
    this.image = preset.image;
    this.color = preset.color;
    
    // Copy stats
    this.stats = { ...preset.stats };
    this.maxHealth = preset.stats.health;
    this.maxMana = preset.stats.mana;
    this.maxStamina = preset.stats.stamina;
    
    // Current values
    this.health = this.maxHealth;
    this.mana = this.maxMana;
    this.stamina = this.maxStamina;
    
    // Equipment
    this.equipment = { ...preset.equipment };
    this.spells = [...preset.spells];
    this.specialAbility = preset.specialAbility;
    
    // Character progression
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 1000;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health;
  }

  useMana(amount) {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }

  restoreMana(amount) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
  }

  useStamina(amount) {
    if (this.stamina >= amount) {
      this.stamina -= amount;
      return true;
    }
    return false;
  }

  restoreStamina(amount) {
    this.stamina = Math.min(this.maxStamina, this.stamina + amount);
  }

  gainExperience(amount) {
    this.experience += amount;
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.experience = 0;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.15);
    
    // Stat increases on level up
    this.stats.strength += 1;
    this.stats.intelligence += 1;
    this.stats.dexterity += 1;
    this.maxHealth += 20;
    this.maxMana += 15;
    this.maxStamina += 10;
    
    this.health = this.maxHealth;
    this.mana = this.maxMana;
    this.stamina = this.maxStamina;
  }

  getStats() {
    return {
      name: this.name,
      level: this.level,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
      health: this.health,
      maxHealth: this.maxHealth,
      mana: this.mana,
      maxMana: this.maxMana,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      ...this.stats
    };
  }
}
