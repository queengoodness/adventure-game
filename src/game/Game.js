/**
 * Main Game Class
 * Orchestrates all game systems and the main game loop
 */

import { Player } from '../entities/Player.js';
import { World } from './World.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { InventorySystem } from '../systems/InventorySystem.js';
import { MagicSystem } from '../systems/MagicSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { CharacterSelectSystem } from '../systems/CharacterSelectSystem.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    
    // Game systems
    this.player = null;
    this.world = new World();
    this.dialogue = new DialogueSystem();
    this.inventory = new InventorySystem();
    this.magic = new MagicSystem();
    this.quests = new QuestSystem();
    this.save = new SaveSystem();
    this.characterSelect = new CharacterSelectSystem(this);
    
    // Input tracking
    this.keys = {};
    this.mouse = { x: 0, y: 0 };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.characterSelect.handleInput(e);
      if (this.player) {
        this.handleGameInput(e);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.characterSelect.isOpen) {
        this.characterSelect.handleMouseClick(x, y);
      }
    });
  }

  onCharacterSelected(character) {
    // Initialize player with selected character
    this.player = new Player(character);
    this.inventory.owner = this.player;
    this.magic.owner = this.player;
    console.log(`Character selected: ${character.name}`);
  }

  handleGameInput(event) {
    switch(event.key.toLowerCase()) {
      case 'e':
        this.tryInteract();
        break;
      case 'i':
        this.inventory.toggle();
        break;
      case 'q':
        this.quests.toggle();
        break;
      case ' ':
        this.player.jump();
        break;
    }
  }

  tryInteract() {
    // Check for nearby NPCs
    const nearbyNPCs = this.world.getNearbyNPCs(this.player.x, this.player.y, 100);
    if (nearbyNPCs.length > 0) {
      const npc = nearbyNPCs[0];
      this.dialogue.startConversation(npc);
    }
  }

  start() {
    this.running = true;
    this.gameLoop();
  }

  stop() {
    this.running = false;
  }

  gameLoop = (currentTime) => {
    if (!this.running) return;

    // Calculate delta time
    if (this.lastTime === 0) this.lastTime = currentTime;
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update
    if (this.player) {
      this.update(this.deltaTime);
    }

    // Render
    this.render();

    requestAnimationFrame(this.gameLoop);
  }

  update(deltaTime) {
    // Player movement
    if (this.keys['w'] || this.keys['ArrowUp']) {
      this.player.moveUp(deltaTime);
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      this.player.moveDown(deltaTime);
    }
    if (this.keys['a'] || this.keys['ArrowLeft']) {
      this.player.moveLeft(deltaTime);
    }
    if (this.keys['d'] || this.keys['ArrowRight']) {
      this.player.moveRight(deltaTime);
    }

    // Update world
    this.world.update(deltaTime, this.player);

    // Update systems
    this.dialogue.update(deltaTime);
    this.inventory.update(deltaTime);
    this.quests.update(deltaTime);

    // Player regeneration
    if (this.player.health < this.player.character.maxHealth) {
      this.player.character.heal(1);
    }
    if (this.player.character.mana < this.player.character.maxMana) {
      this.player.character.restoreMana(0.5);
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.characterSelect.isOpen) {
      // Show character selection
      this.characterSelect.render(this.ctx, this.canvas);
    } else if (this.player) {
      // Game view
      this.renderGame();
    }
  }

  renderGame() {
    // Render world
    this.world.render(this.ctx, this.player);

    // Render player
    this.player.render(this.ctx);

    // Render UI
    this.renderUI();

    // Render dialogue
    this.dialogue.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render inventory
    this.inventory.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render quests
    this.quests.render(this.ctx, this.canvas.width, this.canvas.height);
  }

  renderUI() {
    const padding = 10;
    const lineHeight = 25;

    // Character name
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`${this.player.character.name}`, padding, lineHeight);

    // Health bar
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(padding, lineHeight + 5, 200, 10);
    this.ctx.fillStyle = '#00FF00';
    const healthPercent = this.player.character.health / this.player.character.maxHealth;
    this.ctx.fillRect(padding, lineHeight + 5, 200 * healthPercent, 10);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `HP: ${Math.round(this.player.character.health)}/${this.player.character.maxHealth}`,
      padding + 210,
      lineHeight + 14
    );

    // Mana bar
    this.ctx.fillStyle = '#0000FF';
    this.ctx.fillRect(padding, lineHeight + 30, 200, 10);
    this.ctx.fillStyle = '#00FFFF';
    const manaPercent = this.player.character.mana / this.player.character.maxMana;
    this.ctx.fillRect(padding, lineHeight + 30, 200 * manaPercent, 10);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(
      `Mana: ${Math.round(this.player.character.mana)}/${this.player.character.maxMana}`,
      padding + 210,
      lineHeight + 39
    );

    // Level and experience
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '14px Arial';
    this.ctx.fillText(
      `Level: ${this.player.character.level} | EXP: ${this.player.character.experience}/${this.player.character.experienceToNextLevel}`,
      padding,
      lineHeight + 65
    );

    // Controls hint
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '12px Arial';
    this.ctx.fillText('WASD/Arrows: Move | E: Interact | I: Inventory | Q: Quests', padding, this.canvas.height - 10);
  }
}
