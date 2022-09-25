export class Log {
  private static container: HTMLDivElement;
  private static initialize() {
    Log.container = document.createElement('div');
    document.body.appendChild(Log.container);
  }

  static info(message: string): void {
    if (!Log.container) { Log.initialize(); }
    const d = document.createElement('div');
    d.innerHTML = message;
    Log.container.appendChild(d);
  }

  static loggedMessages = new Set<string>();
  static once(message: string): void {
    if (!this.loggedMessages.has(message)) {
      this.loggedMessages.add(message);
      this.info(message);
    }
  }

  static clear(): void {
    if (!Log.container) { Log.initialize(); }
    Log.container.innerHTML = '';
  }
}