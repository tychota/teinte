export abstract class ColorspaceVisitor<T> {
  public abstract visitRGBColor(color: InstanceType<typeof Color.RGB>): T;
  public abstract visitHSLColor(color: InstanceType<typeof Color.HSL>): T;
  public abstract visitXYZColor(color: InstanceType<typeof Color.XYZ>): T;
  public abstract visitOkLabColor(color: InstanceType<typeof Color.OkLab>): T;
  public abstract visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>): T;
}

function clip(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export abstract class Color {
  abstract name: string;

  static RGB = class RGB extends Color {
    name = "RGB";
    constructor(public r: number, public g: number, public b: number) {
      super();
    }

    clip() {
      this.r = clip(this.r, 0, 1);
      this.g = clip(this.g, 0, 1);
      this.b = clip(this.b, 0, 1);
      return this;
    }
  };
  static HSL = class HSL extends Color {
    name = "HSL";
    constructor(public h: number, public s: number, public l: number) {
      super();
    }

    clip() {
      console.warn("It makes no sense to clip a polor space.");
      this.s = clip(this.s, 0, 1);
      this.l = clip(this.l, 0, 1);
      return this;
    }
  };

  static XYZ = class XYZ extends Color {
    name = "XYZ";
    constructor(public x: number, public y: number, public z: number) {
      super();
    }

    clip() {
      console.warn("XYZ has no gammut limits.");
      return this;
    }
  };
  static OkLab = class OkLab extends Color {
    name = "OkLab";
    constructor(public l: number, public a: number, public b: number) {
      super();
    }

    clip() {
      console.warn("OkLab has no gammut limits.");
      return this;
    }
  };
  static OkLCH = class OkLCH extends Color {
    name = "OkLCH";
    constructor(public l: number, public c: number, public h: number) {
      super();
    }

    clip() {
      console.warn("OkLCH has no gammut limits.");
      return this;
    }
  };

  public static new(data: [number, number, number], colorspace: "RGB" | "HSL" | "XYZ" | "OkLab" | "OkLCH") {
    switch (colorspace) {
      case "RGB":
        return new Color.RGB(data[0], data[1], data[2]);
      case "HSL":
        return new Color.HSL(data[0], data[1], data[2]);
      case "XYZ":
        return new Color.XYZ(data[0], data[1], data[2]);
      case "OkLab":
        return new Color.OkLab(data[0], data[1], data[2]);
      case "OkLCH":
        return new Color.OkLCH(data[0], data[1], data[2]);
      default:
        throw new Error(`Colorspace ${colorspace} is not handled`);
    }
  }

  public accept(visitor: ColorspaceVisitor<any>) {
    if (this instanceof Color.RGB) {
      return (visitor as ColorspaceVisitor<InstanceType<typeof Color.RGB>>).visitRGBColor(this);
    } else if (this instanceof Color.HSL) {
      return (visitor as ColorspaceVisitor<InstanceType<typeof Color.HSL>>).visitHSLColor(this);
    } else if (this instanceof Color.XYZ) {
      return (visitor as ColorspaceVisitor<InstanceType<typeof Color.XYZ>>).visitXYZColor(this);
    } else if (this instanceof Color.OkLab) {
      return (visitor as ColorspaceVisitor<InstanceType<typeof Color.OkLab>>).visitOkLabColor(this);
    } else if (this instanceof Color.OkLCH) {
      return (visitor as ColorspaceVisitor<InstanceType<typeof Color.OkLCH>>).visitOkLCHColor(this);
    } else {
      throw new Error(`Color ${this} is not handled by the visitor`);
    }
  }

  abstract clip(): unknown;
}
