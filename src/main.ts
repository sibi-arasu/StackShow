import "./style.css"
import VintageFX from "./assets/VintageFX.gif";
import { initSkills3D } from "./skills-3d";

const coverGif = document.getElementById("CoverGif") as HTMLImageElement;
coverGif.src = VintageFX;

initSkills3D();
