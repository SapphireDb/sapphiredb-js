export class SapphireDbFile {
  content!: string;
  type?: string;
  name?: string;

  constructor(content: string, type?: string, name?: string) {
    this.content = content;
    this.type = type;
    this.name = name;
  }

  public static async fromFile(file?: File | null): Promise<SapphireDbFile> {
    const dataUrl = await new Promise<string>(resolve => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };

      reader.readAsDataURL(file as Blob);
    });

    const dataUrlParts = dataUrl?.split(',');
    return new SapphireDbFile(dataUrlParts[1], file?.type, file?.name);
  }

  public getDataUrl(): string {
    return `data:${this.type};base64,${this.content}`;
  }
}
