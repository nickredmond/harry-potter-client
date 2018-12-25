import { Component } from '@angular/core';
import { HttpClient } from '../../node_modules/@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  spellCode = '';
  questionNumber = 0;
  questionText = '';
  answers = [];
  rewardCode = '';

  isHome = true;
  isQuizzing = false;
  isGameOver = false;
  isWinner = false;

  isAuthError = false;
  isAnswerVerified = false;
  isRewardRevealed = false;

  private currentQuestionId = 0;
  private accessToken: string;
  private serverBaseUrl = "https://harry-potter-server.herokuapp.com";

  constructor(private http: HttpClient) {}

  authenticate() {
    this.http.post(this.serverBaseUrl + "/authenticate", { userCode: this.spellCode }).toPromise().then(
      response => {
        this.isAuthError = false;
        this.accessToken = response['accessToken'];
        this.getNextQuestion();
      },
      () => {
        this.isAuthError = true;
      }
    );
  }

  goNext() {
    if (this.isAnswerVerified) {
      this.isAnswerVerified = false;
      this.getNextQuestion();
    }
    else {
      this.submitAnswer();
    }
  }

  startOver() {
    this.questionNumber = 0;
    this.answers = [];
    this.currentQuestionId = 0;
    this.getNextQuestion();
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  revealReward() {
    this.isRewardRevealed = true;
  }

  private getNextQuestion() {
    const questionRequest = { userCode: this.spellCode, accessToken: this.accessToken }; 
    this.http.post(this.serverBaseUrl + "/question", questionRequest).toPromise().then(
      response => {
        this.currentQuestionId = response['id'];
        this.questionText = response['text'];
        this.answers = [];
        for (var i = 0; i < response['numberOfAnswers']; i++) {
          this.answers.push('');
        }

        this.questionNumber++;

        this.isHome = false;
        this.isWinner = false;
        this.isGameOver = false;
        this.isQuizzing = true;
      },
      () => {
        alert("MAJOR ERROR getting questions :/");
      }
    );
  }

  private submitAnswer() {
    const request = {
      userCode: this.spellCode,
      accessToken: this.accessToken,
      questionId: this.currentQuestionId,
      answer: this.answers.length > 1 ? this.answers : this.answers[0]
    };
    this.http.post(this.serverBaseUrl + "/submit", request).toPromise().then(
      response => {
        if (response['isCorrect']) {
          if (response['reward']) {
            this.rewardCode = response['reward'];
            this.isQuizzing = false;
            this.isWinner = true;
          }
          this.isAnswerVerified = true;
        }
        else {
          this.isQuizzing = false;
          this.isGameOver = true;
        }
      },
      () => {
        alert("MAJOR ERROR submitting question :(");
      }
    );
  }
}
