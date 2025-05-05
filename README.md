# Material table

## Installation

```
npm i @kovalenko/watch-title
```

## Usage

Restores page title when child route destroys.

```typescript
import {Component, inject, OnInit} from '@angular/core';
import {WatchTitle} from '@kovalenko/watch-title';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-route',
  template: '',
})
export class RouteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);
  
  private readonly title = inject(Title);

  @WatchTitle()
  setTitle(groupName: string): void {
    this.title.setTitle(groupName);
  }

  ngOnInit(): void {
    this.setTitle('New book');
  }
}
```
