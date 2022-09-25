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
    if (!Log.loggedMessages.has(message)) {
      Log.loggedMessages.add(message);
      Log.info(message);
    }
  }

  static clear(): void {
    if (!Log.container) { Log.initialize(); }
    Log.container.innerHTML = '';
  }
}