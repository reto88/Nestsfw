import { Component, OnInit, Input } from '@angular/core';
import { numericIdObject } from '../../service/models/numeric-id-object.model';

@Component({
  selector: 'app-show-value',
  templateUrl: './show-value.component.html',
  styleUrls: ['./show-value.component.scss']
})
export class ShowValueComponent implements OnInit {
  @Input() numericIdObject: numericIdObject;
  @Input() picture: number;
  constructor() { }

  ngOnInit() {
    
  }

}
