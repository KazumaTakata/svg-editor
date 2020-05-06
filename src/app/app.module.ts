import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ToolsComponent } from './tools/tools.component';
import { EditorComponent } from './editor/editor.component';
import { ElementComponent } from './element/element.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolsComponent,
    EditorComponent,
    ElementComponent
  ],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
