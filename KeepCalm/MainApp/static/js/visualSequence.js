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


gameTimeManager.getInstance().stop();