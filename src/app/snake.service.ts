import { Injectable } from '@angular/core';
import {Snake} from "./model/snake";
import {Coord} from "./model/coord";
import {KEY_DIRECTION_ARRAY} from "./const/key-direction-array";
import {CANVAS_SIZE} from "./const/canvas-size";
import {Food} from "./model/food";
import {Game} from "./model/game";

@Injectable()
export class SnakeService {
  clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y)
  };
  changeFoodPosition (food: Food, snake: Snake): Food {
    food.coord = food.generateFoodPositionRandomly(CANVAS_SIZE, snake.body);
    return food;
  };
  detectBorderCanvas(size: number, abscisse: number, ordonnee: number) : Coord {
    if (abscisse >= CANVAS_SIZE.x) {
      abscisse = 0;
    } else if (abscisse < 0) {
      abscisse = CANVAS_SIZE.x - size;
    }
    if (ordonnee >= CANVAS_SIZE.y) {
      ordonnee = 0;
    } else if (ordonnee < 0) {
      ordonnee = CANVAS_SIZE.y - size;
    }
    return new Coord(abscisse, ordonnee);
  };
  drawFood(ctx: CanvasRenderingContext2D, food:Food) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(food.coord.x, food.coord.y, food.size, food.size);
    ctx.strokeStyle = 'purple';
    ctx.strokeRect(food.coord.x, food.coord.y, food.size, food.size);
  }
  drawSnake(ctx: CanvasRenderingContext2D, snake: Snake): void {
    snake.body.forEach((bodyPart, index) => {
      let colorBody = index === 0 ? 'red' : 'green';
      ctx.fillStyle = colorBody;
      ctx.fillRect(bodyPart.x, bodyPart.y, snake.size, snake.size);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(bodyPart.x, bodyPart.y, snake.size, snake.size);
    });
  };
  isSnakeEatingFood (snake: Snake, food: Food): boolean {
    let snakeHead = snake.getSnakeHead();
    return food.coord && snakeHead.x === food.coord.x && snakeHead.y === food.coord.y;
  };
  moveSnake(snake: Snake): Snake {
    snake = snake.moveSnake();
    snake.body = snake.body.map(bodyPart => this.detectBorderCanvas(snake.size, bodyPart.x, bodyPart.y));
    return snake;
  };
  onKeyUp(eventKey: string, snake: Snake): Snake {
    let requestedKey = KEY_DIRECTION_ARRAY.find(item => item.key === eventKey);
    if (requestedKey && requestedKey.opposite !== snake.direction) {
      snake.direction = requestedKey.direction;
    }
    return snake;
  };
  runGame(game: Game, ctx: CanvasRenderingContext2D): boolean {
    this.clearCanvas(ctx);
    this.moveSnake(game.snake);
    game.isGameOver = game.snake.isSnakeCollision();
    game.snake.isGrowing = this.isSnakeEatingFood(game.snake, game.food);
    if (game.snake.isGrowing) {
      game.food.coord = null;
      game.score = game.score + game.level*10;
    }
    if (!game.food.coord) {
      this.changeFoodPosition(game.food, game.snake);
    }
    if (game.food) {
      this.drawSnake(ctx, game.snake);
      this.drawFood(ctx, game.food);
    } else {
      game.isGameOver = true;
    }
    return game.isGameOver;
  }
}
