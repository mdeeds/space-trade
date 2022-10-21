// import { Storage } from "@google-cloud/storage";

export interface Codeable {
  serialize(): Object;
  deserialize(serialized: Object): this;
  fallback(p: THREE.Vector3): this;
}

export class File {
  static saveButtons = new Map<string, HTMLElement>();

  static makeSaveButton(o: Object, target: string) {
    const div = document.createElement('div');
    //<a href="path_to_file" download="proposed_file_name">Download</a>
    const anchor = document.createElement('a');
    anchor.href = "data:application/json;base64," + btoa(JSON.stringify(o));
    anchor.innerText = target;

    JSON.stringify(o);
    anchor.download = `${target}.json`;
    anchor.target = '_blank';

    div.appendChild(anchor);
    return div;
  }

  static refreshLink(o: Object, target: string) {
    if (File.saveButtons.get(target)) {
      document.body.removeChild(File.saveButtons.get(target));
    }

    const button = File.makeSaveButton(o, target);
    document.body.appendChild(button);
    File.saveButtons.set(target, button);
  }

  static save(value: Codeable, target: string) {
    const o = value.serialize();
    window.localStorage.setItem(target, JSON.stringify(o));
    // File.saveToCloud(value, target);
    File.refreshLink(o, target);
  }

  static load(target: Codeable, source: string, p: THREE.Vector3) {
    const saved = window.localStorage.getItem(source);
    if (saved) {
      console.log(`Loading saved file: ${source}`);
      const o = JSON.parse(saved);
      File.refreshLink(o, source);
      return target.deserialize(o);
    } else {
      console.log('Regenerating data.');
      const result = target.fallback(p);
      File.save(result, source);
      return result;
    }
  }

  // static async saveToCloud(value: Codeable, target: string) {
  //   const storage = new Storage();
  //   const bucket = storage.bucket('space-trade-dev');
  //   const o = value.serialize();
  //   bucket.file(target).save(JSON.stringify(o));
  //   return;
  // }
}