import { TimeEntry } from "../timer";
import { AbstractUI } from "./abstract-ui";

export const timesListDiv = document.querySelector('.times-list') as HTMLDivElement;

export class TimeTableUI extends AbstractUI {
  noOfTimes: number = 0;

  bindUI() {
    // override to not update the time table periodically
  }

  updateUI(times: TimeEntry[]): void {
    if (times.length === 0 || this.noOfTimes === times.length) return;
    this.noOfTimes = times.length;
    
    if (!timesListDiv) return;
    timesListDiv.innerHTML = ''
    const timesListOl = document.createElement('ol');
    times.forEach(time => {
      const timesListLi = document.createElement('li');
  
      timesListLi.innerText = `${time.timeStr} - ${time.nickname} (CP: ${time.checkpoints}) `;
      timesListOl.appendChild(timesListLi);
      timesListDiv.appendChild(timesListOl);
    });
  }
}