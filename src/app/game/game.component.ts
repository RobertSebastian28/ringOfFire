import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';


import { Game } from 'src/models/game';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  game: Game;
  gameId: string;
  AddedPlayer: boolean = false;

  constructor(public firestore: AngularFirestore,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute) {


  }

  /**
   * this function is a lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Define an ngOnInit() method to handle any additional initialization tasks.
   * 
   */
  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];
      console.log(this.gameId);
      this
        .firestore
        .collection('games')
        .doc(this.gameId)
        .valueChanges()
        .subscribe((game: any) => {
          console.log('game update', game);
          this.game.currentPlayer = game.currentPlayer;
          this.game.playedCards = game.playedCards;
          this.game.players = game.players;
          this.game.stack = game.stack;
          this.game.pickCardAnimation = game.pickCardAnimation;
          this.game.currentCard = game.currentCard;
        })

    });

  }

  /**
   * this function assigns the class Game to the variable game 
   * 
   */
  newGame() {
    this.game = new Game();
  }

  /**
   * this function checks the values of two bolic variables. 
   * If the variables have the correct values, the values of certain variables are changed and certain functions are executed.  
   * 
   */
  takeCard() {
    if (!this.game.pickCardAnimation && this.AddedPlayer) {
      this.game.currentCard = this.game.stack.pop();
      this.game.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();
      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();
      }, 1000);
    }
    else if (!this.AddedPlayer) {
      this.openDialog();
    }
  }

  /**
   * This function opens a dialog box
   * 
   */
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(name => {
      if (name && name.length > 0) {
        this.AddedPlayer = true;
        this.game.players.push(name);
        this.saveGame();
      }

    });
  }

  /**
   * This function saves certain values in the Firestore 
   * 
   */
  saveGame() {
    this
      .firestore
      .collection('games')
      .doc(this.gameId)
      .update(this.game.toJson());
  }
}



