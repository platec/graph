import Data from './Data';
import DataModel from './DataModel';
import GraphView from './GraphView';
import { drawNodeImage } from './utils';

interface GlobalGraph {
  imageCache: any;
  setImage: (name: string, image: any) => void;
  drawNodeImage: (gv: GraphView, dm: DataModel, data: Data, image: any) => void;
  getImage: (name: string) => any;
  loadImage: (imageList: ImageCompConfig[]) => Promise<any>;
  load: (display: string) => Promise<any>;
  loadSymbol: (symbolList: any[]) => Promise<any>;
  convertURL: (url: string) => string
}

const globalGraph: GlobalGraph = {
  imageCache: {}, // 图标缓存
  setImage,
  drawNodeImage,
  getImage,
  loadImage,
  load,
  loadSymbol,
  convertURL: (url: string) => url
}; 

function setImage(name: string, image: any) {
  globalGraph.imageCache[name] = image;
}

function getImage(name: string) {
  return globalGraph.imageCache[name];
}

async function loadImage(imageList: ImageCompConfig[]) {
  const loadList = imageList.map((image) => {
    return new Promise((resolve: (p: void) => void) => {
      const img = new Image();
      img.onload = () => {
        if (image.name.startsWith('data:image')) {
          setImage(image.displayName, img);
        } else {
          setImage(image.name, img);
        }
        resolve();
      };
      img.src = image.name;
    });
  });
  return Promise.all(loadList);
}

async function loadSymbol(symbolList: any[]) {
  const loadList = symbolList.map((v) => {
    return new Promise(async (resolve: (p: void) => void) => {
      const json = await load(v);
      setImage(v, json);
      resolve();
    });
  });
  return Promise.all(loadList);
}

/**
 * 加载图纸
 * @param display
 */
async function load(display: string) {
  const url = globalGraph.convertURL(display);
  const resp = await fetch(url, {
    method: 'GET',
  });
  const json = await resp.json();
  return json;
}

export default globalGraph;
