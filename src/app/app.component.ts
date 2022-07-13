import { Component, OnInit } from '@angular/core';
import { AsyncSubject, BehaviorSubject, interval, Observable, ReplaySubject, Subject, take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'rxjsNote';
  res1: string[] = [];

  private Observable$ = new Observable(subscriber => {
    // Observable 非常適合在有固定資料流的情境先建立好流程，以供未來訂閱都會照此流程走
    console.log('stream start');
    this.res1.push('stream start');
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    setTimeout(() => {
      // 如果要在Observable中使用非同步處理資料，要想辦法在整個非同步最後呼叫complete()，避免提早結束接不到資料
      subscriber.next(4);
      console.log('stream end');
      this.res1.push('stream end');
      subscriber.complete();
    });
  });
  private subject$ = new Subject();
  private behaviorSub$ = new BehaviorSubject(0);
  // 設定「重播」最近 3 次資料給訂閱者
  private replaySub$ = new ReplaySubject(3);
  private asyncSub$ = new AsyncSubject();

  /*
  Cold Observable : 每次訂閱都產生一次新的資料流。
                    把整個資料流當作水管管線設計圖的話，每次訂閱就是用此設計圖組裝出新的水管
                    好處就是多個訂閱就是多條獨立水管(兩邊資料流互不影響)。
                    與Obeserver 為"一對一"關西(unicast)

  Hot  Observable : Subject系列都屬於 Hot Observable。
                    將Subject視為一條水管管線，每次訂閱就是等待這條管線有資料傳過來。
                    好處是較有彈性，可以為不同情境準備不同流程
                    與Obeserver 為"一對多"關西(multicast)

  Warm Observable : 利用一些 Mulitcast類的 Operators 把 Cold Observable 達到類似 Hot Observable 的效果
  */


  public subOb() {
    this.Observable$.subscribe({
      next: data => {
        console.log('Observable 第一次訂閱: ' + data);
        this.res1.push('Observable 第一次訂閱: ' + data);
      },
      complete: () => {
        console.log('第一次訂閱 完成');
        this.res1.push('第一次訂閱 完成');
      }
    });

    this.Observable$.subscribe({
      next: data => {
        console.log('Observable 第二次訂閱: ' + data);
        this.res1.push('Observable 第二次訂閱: ' + data);
      },
      complete: () => {
        console.log('第二次訂閱 完成');
        this.res1.push('第二次訂閱 完成');
      }
    });
  }

  public subSub() {
    /*
    Subject 與 Observable 有兩個明顯不同的地方：
     1. Observable 在建立物件同時就決定好資料流向了，而 Subject 是在產生物件後才決定資料的流向。
     2. Observable 每個訂閱者都會得到獨立的資料流，又稱為 unicast；
        而 Subject 則是每次事件發生時就會同步傳遞給所有訂閱者 (Observer)，又稱為 multicast。

    由於 Subject 是在產生物件後才決定資料流向，因此比較適合在程式互動過程中動態決定資料流向，
    也就是 Subjct 建立好後，將這個 Subject 物件傳出去，讓其它程式來透過呼叫該物件的 next() 等方法來決定資料流向。
    */
    this.subject$.subscribe(data => this.res1.push('Subject 第1次訂閱:' + data));

    this.subject$.next(1);
    this.subject$.next(2);

    // 之後再追加訂閱
    this.subject$.subscribe(data => this.res1.push('Subject 第2次訂閱:' + data));

    this.subject$.next(3);
    this.subject$.next(4);

    this.subject$.subscribe(data => this.res1.push('Subject 第3次訂閱:' + data));

    this.subject$.complete();
  }

  public subBehav() {
    /*
    Subject 產生的物件在訂閱時若沒有事件發生，會一直收不到資料，
    如果希望在一開始訂閱時會先收到一個預設值，且有事件發生後才訂閱的行為也可以收到最近一次發生過的事件資料，則可以使用 BehaviorSubject
    */
    this.behaviorSub$.subscribe(data => this.res1.push('BehaviorSubject 第1次訂閱' + data));

    this.behaviorSub$.next(1);
    this.behaviorSub$.next(2);

    // 此處會先取得「最近一次事件的資料」
    this.behaviorSub$.subscribe(data => this.res1.push('BehaviorSubject 第2次訂閱' + data));

    this.behaviorSub$.next(3);
    this.behaviorSub$.next(4);

    this.res1.push('目前 BehaviorSubject 的內容為: ' + this.behaviorSub$.value);
  }

  public subRep() {
    //ReplaySubject 會幫我們保留最近 N 次的事件資料，並在訂閱時重播這些發生過的事件資料給訂閱者，跟 BehaviorSubject 類似，都有 cache 的概念，只是更有彈性。
    this.replaySub$.subscribe(data => this.res1.push('ReplaySubject 第1次訂閱:' + data));

    this.replaySub$.next(1);
    this.replaySub$.next(2);

    //目前只有兩次事件，所以只會收到兩次事件的資料
    this.replaySub$.subscribe(data => this.res1.push('ReplaySubject 第2次訂閱:' + data));

    this.replaySub$.next(3);
    this.replaySub$.next(4);

    //當事件繼續發生超過三次時，這時再訂閱就會收到完整 cache 的最近三次資料
    this.replaySub$.subscribe(data => this.res1.push('ReplaySubject 第3次訂閱:' + data));

  }

  public subAsync(){
    // 當 AsyncSubject 物件被建立後，過程中發生任何事件都不會收到資料，直到 complete() 被呼叫後，才會收到「最後一次事件資料」
    // 如果希望訂閱的 Observer 只關注在結束前的最後資料就好，可以考慮使用 AsyncSubject
    this.asyncSub$.subscribe(data=>this.res1.push('AsyncSubject 第1次訂閱: '+data));

    this.asyncSub$.next(1);
    this.asyncSub$.next(2);

    this.asyncSub$.subscribe(data=>this.res1.push('AsyncSubject 第2次訂閱: '+data));

    this.asyncSub$.next(3);
    this.asyncSub$.next(4);

    this.asyncSub$.subscribe(data=>this.res1.push('AsyncSubject 第3次訂閱: '+data));

    this.asyncSub$.complete();
  }

  public clear() {
    this.res1 = [];
  }




  ngOnInit(): void {


  }
}
