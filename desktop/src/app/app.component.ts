import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { ToastContainer } from "@core/ui/toast/container/toast-container/toast-container";
import { DeepLinkService } from "@core/services/deep-link.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ToastContainer],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  private readonly deepLinkService = inject(DeepLinkService);

  greetingMessage = "";

  constructor() {
    this.deepLinkService.init();
  }

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }
}
