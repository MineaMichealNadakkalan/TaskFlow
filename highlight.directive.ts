// ============================================
// Custom Directives - Visual Highlighting
// ============================================

import { Directive, Input, ElementRef, OnInit, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';
import { ITask } from '../models/task.model';

/** Highlight overdue tasks with a red border/background */
@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective implements OnInit, OnChanges {
  @Input('appHighlightOverdue') task!: ITask;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.applyHighlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) this.applyHighlight();
  }

  private applyHighlight(): void {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = !this.task.completed && this.task.dueDate < today;

    if (isOverdue) {
      this.renderer.setStyle(this.el.nativeElement, 'border-left', '3px solid #ef4565');
      this.renderer.setStyle(this.el.nativeElement, 'background', 'rgba(239,69,101,0.04)');
      this.renderer.addClass(this.el.nativeElement, 'overdue-task');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'border-left');
      this.renderer.removeStyle(this.el.nativeElement, 'background');
      this.renderer.removeClass(this.el.nativeElement, 'overdue-task');
    }
  }
}

/** Highlight high-priority tasks */
@Directive({
  selector: '[appHighlightPriority]',
  standalone: true
})
export class HighlightPriorityDirective implements OnInit, OnChanges {
  @Input('appHighlightPriority') priority!: string;

  private colorMap: Record<string, string> = {
    high: 'rgba(239,69,101,0.08)',
    medium: 'rgba(232,160,69,0.06)',
    low: 'rgba(62,207,142,0.06)'
  };

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void { this.apply(); }
  ngOnChanges(): void { this.apply(); }

  private apply(): void {
    const bg = this.colorMap[this.priority] || 'transparent';
    this.renderer.setStyle(this.el.nativeElement, 'background-color', bg);
  }
}
