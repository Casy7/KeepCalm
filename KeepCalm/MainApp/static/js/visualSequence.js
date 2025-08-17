const routeScriptBuilder = new RouteScriptBuilder();

class Scene {
    constructor(name) {
        this.name = name;
        this.images = new Map();
    }
}

class SceneAnimator {
    constructor() {
        
    }
}

async function firstScene() {

    const firstScene = new Scene("firstScene");

    firstScene.images.set("way_to_school", await routeScriptBuilder.buffer("/static/svg/way_to_school.svg"));
    firstScene.images.set("main_hero", await routeScriptBuilder.buffer("/static/svg/main_hero.svg"));
    return firstScene;

}


class ImageCache {
  constructor(limit = 20) {
    this.limit = limit;
    this.map = new Map(); // url -> {img, atime}
  }
  async get(url) {
    if (this.map.has(url)) {
      const item = this.map.get(url);
      item.atime = performance.now();
      return item.img;
    }
    const img = await preloadImage(url);
    this.map.set(url, { img, atime: performance.now() });
    if (this.map.size > this.limit) this.evict();
    return img;
  }
  evict() {
    let oldestUrl = null, oldest = Infinity;
    for (const [url, v] of this.map) if (v.atime < oldest) { oldest = v.atime; oldestUrl = url; }
    if (oldestUrl) this.map.delete(oldestUrl);
  }
}



gameTimeManager.getInstance().stop();