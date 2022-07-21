import { debounceTime, distinctUntilChanged, filter, Subject, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-advanced-operator',
  templateUrl: './advanced-operator.component.html',
  styleUrls: ['./advanced-operator.component.scss']
})
export class AdvancedOperatorComponent implements OnInit {
  title!: string;
  intro!: string;
  inputText!:string;
  raw: any;
  res1: any;

  private debounceSubject$ = new Subject<string>();
  constructor(
    private http: HttpClient,

  ) { }
  private getName(code:string) {
    return this.http.post<{
      code: number;
      status: string;
      message: string;
      data: {
        wallet: {
          users: {
            id: number,
            name: string,
            is_admin: boolean
          }[]
        }
      }
    }>('https://wallet.usongrat.tw/api/wallet/user', { code: code });
  }

  doDebounceTime(){
    this.title = 'debounceTime / distinctUntilChanged / filter';
    this.intro = " <strong>debounceTime</strong> 可以設定一個時間(毫秒)，在這段時間只要還有新資料傳入，就會暫時忽視，直到一定時間沒有新資料後，才將最新的資料交給下一個 operator。"
    +" <br>下一個operator可以接 <strong>distinctUntilChanged</strong>，他會確認你這次的資料與上次資料是否相同，決定是否要繼續往下執行。"
    +" <br> <strong>filter</strong> 則跟陣列filter類似，當filter內條件符合才往執行。";
    this.debounceSubject$.pipe(
      debounceTime(500), // 500ms沒新值後才往下做事情
      distinctUntilChanged(), // 當「內容真正有變更」時，再往下做事情
      filter(v => v.length>=3), // 當「內容長度>=3」時，再往下做事情
      switchMap(val=>this.getName(val))
    ).subscribe((res)=>{
      this.res1 = res;
    });
  }

  inputChange(val:string){
   this.debounceSubject$.next(val);
  }

  ngOnInit(): void {
  }

}
