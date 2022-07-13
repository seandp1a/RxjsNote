import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map, tap, Observable, switchMap, combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-common-operator',
  templateUrl: './common-operator.component.html',
  styleUrls: ['./common-operator.component.scss']
})
export class CommonOperatorComponent implements OnInit {
  title!: string;
  intro!: string;
  raw: any;
  res1: any;

  asyncPipeObservable$!: Observable<any>;

  constructor(private http: HttpClient) { }
  private getName() {
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
    }>('https://wallet.usongrat.tw/api/wallet/user', { code: 'LP3LEvEe' });
  }
  private getName2() {
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
    }>('https://wallet.usongrat.tw/api/wallet/user', { code: 'tVtaCfUS' });
  }
  private login(name: string) {
    return this.http.post<{
      code: number;
      status: string;
      message: string;
      data: {
        id: number,
        name: string,
        member_token: string,
        wallet: {
          id: number,
          code: string
        }
      }
    }>('https://wallet.usongrat.tw/api/wallet/auth/login', { name: name, code: 'LP3LEvEe' });
  }

  public doMap() {
    this.title = 'map';
    this.intro = '將一個訂閱可以得到的資料轉換成另外一筆資料';
    this.getName().pipe(
      map(res => [...res.data.wallet.users.map(v => v.name)])
    ).subscribe((res) => {
      this.res1 = res;
    });
  }

  public doTap() {
    this.title = 'tap';
    this.intro = '透過 tap()，可以窺視各階段的資料(如轉換前轉換後)，常用方式為搭配 console.log 就能夠確保我們使用的 operators 邏輯是否正常，'
      + '又或是直接將該值暫存起來。'
    this.getName().pipe(
      tap(data => console.log(data)),
      map(res => [...res.data.wallet.users.map(v => v.name)]),
      tap(data => console.log(data)),
    ).subscribe((res) => {
      this.res1 = res;
    });
  }

  public doSwitchMap() {
    this.title = 'switchMap';
    this.intro = '當你拿到Observable資料後，要轉換成另一個Observable，就可以使用switchMap。'
      + '例如當你需要先透過第一個API取得A資料，然後要用A資料去Call第二個API，'
      + '若不用switchMap 就會變成是第一次subscribe裡面call第二個API，然後再subscribe一次'
      ;
    this.getName().pipe(
      map(res => res.data.wallet.users.map(v => v.name)),
      switchMap(name => this.login(name[1]))
    ).subscribe(res => {
      this.res1 = res;
    });
  }

  public doCombineLatest() {
    this.title = 'CombineLatest';
    this.intro = '當你想要無序且一次處理多個Observable，且都拿到資料後進行後續處理時便可使用CombineLatest';
    combineLatest(this.getName(), this.getName2())
      .pipe(
        map(([res1, res2]) => ({ data1: res1.data.wallet.users.map(v=>v.name), data2: res2.data.wallet.users.map(v=>v.name) }))
      )
      .subscribe(data => this.res1 = data);
  }

  public doForkJoin(){
    this.title = 'forkJoin';
    this.intro = '與 combineLatest 類似，差別在於 combineLatest 在 RxJS 整個資料流有資料變更時都會發生，而 forkJoin 會在所有 observable 都完成(complete)後，才會取得最終的結果，所以對於 Http Request 的整合，我們可以直接使用 forkJoin 因為 Http Request 只會發生一次';
    forkJoin(this.getName(), this.getName2())
      .pipe(
        map(([res1, res2]) => ({ data1: res1.data.wallet.users.map(v=>v.name), data2: res2.data.wallet.users.map(v=>v.name) }))
      )
      .subscribe(data => this.res1 = data);
  }

  ngOnInit(): void {
    // template 可利用 AsyncPipe 來直接取得Observable內的值，可以不用直接subscribe出來
    this.asyncPipeObservable$ = this.getName().pipe(tap(data => this.raw = data));
  }

}
