import type { Template } from "../utils/reactive-resume-utils";

// Official/Reactive-Resume templates
import { Azurill } from "./azurill";
import { Bronzor } from "./bronzor";
import { Chikorita } from "./chikorita";
import { Ditto } from "./ditto";
import { Gengar } from "./gengar";
import { Glalie } from "./glalie";
import { Kakuna } from "./kakuna";
import { Leafish } from "./leafish";
import { Nosepass } from "./nosepass";
import { Onyx } from "./onyx";
import { Pikachu } from "./pikachu";
import { Rhyhorn } from "./rhyhorn";

// Custom templates
import { Classic } from "./classic";
import { Modern } from "./modern";
import { Stylish } from "./stylish";
import { Compact } from "./compact";
import { Overleaf } from "./overleaf";
import { Elegant } from "./elegant";

export const getTemplate = (template: Template) => {
  switch (template) {
    case "azurill": return Azurill;
    // case "bronzor": return Bronzor;
    // case "chikorita": return Chikorita;
    case "ditto": return Ditto;
    // case "gengar": return Gengar;
    // case "glalie": return Glalie;
    // case "kakuna": return Kakuna;
    // case "leafish": return Leafish;
    // case "nosepass": return Nosepass;
    // case "onyx": return Onyx;
    case "pikachu": return Pikachu;
    // case "rhyhorn": return Rhyhorn;
    case "classic": return Classic;
    // case "modern": return Modern;
    case "stylish": return Stylish;
    case "compact": return Compact;
    case "overleaf": return Overleaf;
    case "elegant": return Elegant;
    default: return Azurill;
  }
};