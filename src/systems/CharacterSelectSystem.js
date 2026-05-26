/**
 * Character Selection System
 * Allows players to choose between cyberpunk characters at game start
 */

import { CHARACTERS, Character } from '../entities/CharacterPresets.js';

export class CharacterSelectSystem {
  constructor(game) {
    this.game = game;
    this.selectedCharacter = null;
    this.isOpen = true;
  }

  render(ctx, canvas) {
    if (!this.isOpen) return;

    // Dim background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#FF00FF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT YOUR CHARACTER', canvas.width / 2, 60);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#00FFFF';
    ctx.fillText('Choose your cyberpunk hero to begin the adventure', canvas.width / 2, 100);

    // Character cards
    const cardWidth = 350;
    const cardHeight = 500;
    const spacing = 50;
    const totalWidth = (cardWidth * 2) + spacing;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 150;

    let index = 0;
    for (const [key, preset] of Object.entries(CHARACTERS)) {
      const x = startX + (index * (cardWidth + spacing));
      const y = startY;

      this.renderCharacterCard(ctx, x, y, cardWidth, cardHeight, preset, key);
      index++;
    }

    // Instructions
    ctx.fillStyle = '#00FF00';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click a character card or press 1 or 2 to select', canvas.width / 2, canvas.height - 30);
  }

  renderCharacterCard(ctx, x, y, width, height, preset, key) {
    const isHover = this.isCardHovered(x, y, width, height);
    
    // Card background
    ctx.fillStyle = isHover ? preset.color : '#1a1a1a';
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.strokeStyle = preset.color;
    ctx.lineWidth = isHover ? 4 : 2;
    ctx.strokeRect(x, y, width, height);

    // Character number (represents image)
    ctx.fillStyle = preset.color;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(preset.image, x + width / 2, y + 80);

    // Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(preset.name, x + width / 2, y + 130);

    // Description
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial';
    const descLines = this.wrapText(ctx, preset.description, width - 20);
    let descY = y + 160;
    descLines.forEach(line => {
      ctx.fillText(line, x + width / 2, descY);
      descY += 20;
    });

    // Stats preview
    ctx.fillStyle = preset.color;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    
    const statsX = x + 15;
    let statsY = y + 250;
    const statsSpacing = 18;

    ctx.fillText(`❤ HP: ${preset.stats.health}`, statsX, statsY);
    statsY += statsSpacing;
    ctx.fillText(`✦ Mana: ${preset.stats.mana}`, statsX, statsY);
    statsY += statsSpacing;
    ctx.fillText(`⚡ STR: ${preset.stats.strength} | INT: ${preset.stats.intelligence}`, statsX, statsY);
    statsY += statsSpacing;
    ctx.fillText(`🎯 DEX: ${preset.stats.dexterity} | DEF: ${preset.stats.defense}`, statsX, statsY);

    // Special ability
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px Arial';
    statsY += statsSpacing + 10;
    ctx.fillText(`Special: ${preset.specialAbility}`, statsX, statsY);

    // Click hint
    if (isHover) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x, y + height - 40, width, 40);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK TO SELECT', x + width / 2, y + height - 15);
    }
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }

  isCardHovered(x, y, width, height) {
    return this.game.mouse.x >= x && 
           this.game.mouse.x <= x + width &&
           this.game.mouse.y >= y && 
           this.game.mouse.y <= y + height;
  }

  handleInput(event) {
    // Keyboard shortcuts
    if (event.key === '1') {
      this.selectCharacter('HACKER');
    } else if (event.key === '2') {
      this.selectCharacter('PRODIGY');
    }
  }

  handleMouseClick(x, y) {
    // Check which card was clicked
    const cardWidth = 350;
    const cardHeight = 500;
    const spacing = 50;
    const totalWidth = (cardWidth * 2) + spacing;
    const startX = (this.game.canvas.width - totalWidth) / 2;
    const startY = 150;

    let index = 0;
    for (const [key] of Object.entries(CHARACTERS)) {
      const cardX = startX + (index * (cardWidth + spacing));
      const cardY = startY;

      if (x >= cardX && x <= cardX + cardWidth &&
          y >= cardY && y <= cardY + cardHeight) {
        this.selectCharacter(key);
        return;
      }
      index++;
    }
  }

  selectCharacter(characterKey) {
    const preset = CHARACTERS[characterKey];
    if (preset) {
      this.selectedCharacter = new Character(preset);
      this.isOpen = false;
      
      // Notify game that character was selected
      if (this.game.onCharacterSelected) {
        this.game.onCharacterSelected(this.selectedCharacter);
      }
    }
  }

  getSelectedCharacter() {
    return this.selectedCharacter;
  }
}
