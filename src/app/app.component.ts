import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { startWith, map, tap, pairwise } from "rxjs/operators";
import { Observable } from "rxjs";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

const EMPTY_STRING = String("");
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {isExpandCategory: any = {};

stateRecord: StateName[] = [];
states = new FormControl();

stateList: StateGroup[] = [
  { 
    letter: "A",
    checked: false,
    names: [
      {
        id: 1,
        type: "Alabama" 
      },
      {
        id: 2,
        type: "Alaska"
      },
      {
        id: 3,
        type: "Arizona"
      },
      {
        id: 4,
        type: "Arkansas"
      }
    ]
  },
  {
    letter: "C",
    checked: false,
    names: [
      {
        id: 8,
        type: "California"
      },
      {
        id: 9,
        type: "Colorado"
      },
      {
        id: 10,
        type: "Connecticut"
      }
    ]
  },
  {
    letter: "D",
    checked: false,
    names: [
      {
        id: 18,
        type: "Delaware"
      },
      {
        id: 19,
        type: "Denwer"
      }
    ]
  }
];

stateGroupOptions$: Observable<StateGroup[]>;

searching: boolean;

ngOnInit() {
  this.stateGroupOptions$ = this.states.valueChanges.pipe(
    startWith(EMPTY_STRING),
    tap(val => {
      this.searching = typeof val === "string" && val !== EMPTY_STRING;
      this.stateRecord = [];
    }),
    map(value => this._filterGroup(value))
  );
}

setValueFromOption(event: MatAutocompleteSelectedEvent) {
  const name = event.option.value;
  const exists = (this.stateRecord || []).indexOf(name) > -1;

  if (exists) {
    this.setValue(this.stateRecord.filter(item => item !== name));
  } else {
    this.setValue([...this.stateRecord, name]);
  }
}

displayWith(names: StateName[]) {
  if (!names || !names.length) {
    return "";
  }
  return (
    names[0].type +
    (names.length > 1
      ? ` (+${names.length - 1} ${names.length === 2 ? "other" : "others"})`
      : "")
  );
} 

private _filterGroup(value: any) {
  if (!this.searching || !value.trim()) {
    return this.stateList.map((x: any) => {
      if (!x.allNames) {
        x.allNames = [...x.names];
      } 
      x.names = [...x.allNames];

      return x;
    });
  }

  value = value.trim().toLowerCase();

  return this.stateList
    .map((group: any) => {
     group.names = group.allNames.filter((item: any) =>
        item.type.toLowerCase().includes(value)
     );

     return group;
    })
    .filter(
      group =>
        group.letter.toLowerCase().includes(value) || group.names.length > 0
    );
}

setValue(newValue: any) {
  this.searching = false;
  this.states.setValue(newValue);
  this.stateRecord = this.states.value;
  if (!newValue.length) {
    this.stateList.forEach(group => group.checked = false)
  }
}

expandDocumentTypes(group: any) { 
  this.isExpandCategory[group.letter] = !this.isExpandCategory[group.letter];
}

toggleSelection(event: any, name: StateName, group: any) {
  if (event.checked) {
    this.isExpandCategory[group.letter] = true; 
    this.setValue([...(this.stateRecord || []), name]);
  } else {
    this.setValue(
      this.stateRecord.filter((item: StateName) => item.id !== name.id) 
    );
  } 

  const isAllSelected = group['allNames'].every((x: any) => this.stateRecord.some(y => y.id === x.id));
  group.checked = isAllSelected;
}

toggleParent(event: any, group: any) {
  group.checked = event.checked;

  let states: StateName[] = this.stateRecord || [];

  if (event.checked) {
    this.isExpandCategory[group.letter] = true;
    this.setValue([...states.filter(n => group.allNames.every((item: any) => item.id !== n.id)), ...group.allNames]);
  } else {
    this.setValue(states.filter(x => group.allNames.every((n: any) => n.id !== x.id)));
  }
}
}


interface StateName {
id: number;
type: string;
}
export interface StateGroup {
letter: string;
checked: boolean;
names: StateName[];
}