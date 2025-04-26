let food = 50;
let maxFood = 100;
let wood = 0;
let maxWood = 100;
let metal = 0;
let maxMetal = 100;
let swords = 0;
let maxSwords = 0;
let battling = false;
let research = 0;

let population = 2;
let maxPopulation = 5;

let availableWorkers = population;

let playerIsCurrentlyGathering = false;
let whatIsCurrentlyGathering = "";
let gatheringInterval = 3000; // 3 seconds
let lastGatheringTime = 0;
let playerGatherAmount = 3;

let farmingMultiplier = 1;
let miningMultiplier = 1;
let timberMultiplier = 1;
let researchMultiplier = 1;

let currentAssignmentAmount = 1;
let allSelected = false;

let totalTicks = 0;

let battleTargetVillages = [
    { name: "Brackenford Village", strength: 50 },
    { name: "Thornmere Village", strength: 100 },
    { name: "Elderwyn Village", strength: 500 },
    { name: "Frostvale Town", strength: 2000 },
    { name: "Ironwood Town", strength: 5000 },
    { name: "Stormwatch Town", strength: 10000 },
    { name: "Shadowfen Town", strength: 20000 },
    { name: "Emberfall City", strength: 40000 },
    { name: "Dawnspire City", strength: 10000 },
    { name: "Nightshade City", strength: 500000 },
    { name: "King's Castle", strength: 1000000 }
];

let battleTarget = battleTargetVillages[0];

let assignments = {
    farm: 0,
    pop: 0,
    wood: 0,
    metal: 0,
    swords: 0,
    military: 0,
    explorers: 0
};

let unlocks = {
    hut: true,
    barn: true,
    house: false,
    farm: true,
    mine: false,
    miners: false,
    battle: false,
    barracks: false,
    swords: false,
    bighouse: false,
    biggerhouse: false,
    biggesthouse: false,
    library: false,
    research: false
}

let buildings = {
    barn:
    {
        cost: { wood: 50 },
        effect: { maxWoodMultiplier: 2 },
        get description() { return "Increases max wood storage."; },
        amount: 0
    },
    hut:
    {
        cost: { wood: 10 },
        effect: { maxPopulationIncrease: 2 },
        get description() { return `Increases max population by ${this.effect.maxPopulationIncrease}.`; },
        amount: 0
    },
    house:
    {
        cost: { wood: 100 },
        effect: { maxPopulationIncrease: 4 },
        get description() { return `Increases max population by ${this.effect.maxPopulationIncrease}.`; },
        amount: 0
    },
    farm:
    {
        cost: { food: 50 },
        effect: { maxFoodMultiplier: 2 },
        get description() { return "Increases max food storage."; },
        amount: 0
    },
    mine:
    {
        cost: { food: 100, wood: 100, metal: 0 },
        effect: { maxMetalMultiplier: 2 },
        get description() { return "Increases max metal storage and unlocks miners."; },
        amount: 0
    },
    barracks:
    {
        cost: { food: 100, wood: 100, metal: 100 },
        effect: { maxPopulationIncrease: 5 },
        get description() { return `Increases max population by ${this.effect.maxPopulationIncrease} and unlocks military.`; },
        amount: 0
    },
    bighouse:
    {
        cost: { food: 1000, wood: 1000 },
        effect: { maxPopulationIncrease: 25 },
        get description() { return `Increases max population by ${this.effect.maxPopulationIncrease}.`; },
        amount: 0
    },
    biggerhouse:
    {
        cost: { food: 20000, wood: 20000, metal: 10000 },
        effect: { maxPopulationIncrease: 250 },
        get description() { return `Increases max population by ${this.effect.maxPopulationIncrease}.`; },
        amount: 0
    },
    biggesthouse:
    {
        cost: { food: 200000, wood: 200000, metal: 100000 },
        effect: { maxPopulationIncrease: 1000 },
        get description() { return `Increases max population by ${this.effect.maxPopulationIncrease}.`; },
        amount: 0
    },
    library:
    {
        cost: { food: 1200, wood: 1200, metal: 1200 },
        get description() { return "Unlocks researching."; },
        amount: 0
    },
    book:
    {
        cost: { research: 200 },
        get description() { return "Do some original research and write a book about it"; },
        amount: 0
    }
};

document.getElementById("button1").style.background = "#666"; // defaults the button 1 as selected

document.addEventListener('DOMContentLoaded', function() // Building button tooltips
{
    const tooltips = 
    {
        farmButton: 'farm',
        barnButton: 'barn',
        hutButton: 'hut',
        houseButton: 'house',
        mineButton: 'mine',
        barracksButton: 'barracks',
        bigHouseButton: 'bighouse',
        biggerHouseButton: 'biggerhouse',
        biggestHouseButton: 'biggesthouse',
        libraryButton: 'library',
        buyBookButton: 'book'
    };

    for (let buttonId in tooltips)
    {
        let button = document.getElementById(buttonId);
        if (button)
        {
            let buildingKey = tooltips[buttonId];
            let building = buildings[buildingKey];
            if (building)
            {
                button.title = building.description;
            }
        }
    }
});

// checks if game data is found in local storage and asks if the player wants to load it
function checkForSaveData()
{
    const saveData = localStorage.getItem("gameData");
    if (saveData)
    {
        const confirmLoad = confirm("Found saved game data. Do you want to load it?");
        if (confirmLoad)
        {
            loadGame();
        }
    }
}

checkForSaveData()

function buildBook()
{
    const building = buildings.book;
    const costResearch = buildings.book.cost.research;

    if (research >= costResearch)
    {
        buildings.book.amount += 1;

        research -= costResearch;

        // increase research cost for the next book
        buildings.book.cost.research = Math.floor(costResearch * 1.5);

        // change the buttons to show the new cost
        document.getElementById("buyBookButton").textContent = "Write a book (" + formatNumber(buildings.book.cost.research) + " Research)";
        // increment books amount in the library div
        document.getElementById("booksAmount").textContent = buildings.book.amount;

        updateDisplay();
    }
}

function buildLibrary()
{
    const building = buildings.library;
    const costFood = buildings.library.cost.food;
    const costWood = buildings.library.cost.wood;
    const costMetal = buildings.library.cost.metal;

    if (food >= costFood && wood >= costWood && metal >= costMetal)
    {
        buildings.library.amount += 1;

        food -= costFood;
        wood -= costWood;
        metal -= costMetal;

        unlocks.research = true;

        // hide the library button
        document.getElementById("libraryButton").style.display = "none";

        // show research gathering button
        document.getElementById("buttonResearch").style.display = "inline-block";

        // shows library div
        document.getElementById("researchbuttons").style.display = "inline-block";
        document.getElementById("researchbuttons").style.width = "100%";

        addToLog("You erect a magnificent library! You can now do research.");

        updateDisplay();
    }
}

function buildBarn()
{
    const building = buildings.barn;
    const costWood = buildings.barn.cost.wood;

    if (wood >= costWood)
    {
        buildings.barn.amount += 1;

        wood -= costWood;
        maxWood *= building.effect.maxWoodMultiplier;

        newCostWood = maxWood / 2;
        buildings.barn.cost.wood = newCostWood;

        // change the buttons to show the new cost
        document.getElementById("barnButton").textContent = "Build Barn (" + formatNumber(newCostWood) + " Wood)";

        updateDisplay();
    }
}

function buildFarm()
{
    const building = buildings.farm;
    const costFood = buildings.farm.cost.food;

    if (food >= costFood)
    {
        buildings.farm.amount += 1;

        food -= costFood;
        maxFood *= building.effect.maxFoodMultiplier;

        newCostFood = maxFood / 2;
        buildings.farm.cost.food = newCostFood;

        // change the buttons to show the new cost
        document.getElementById("farmButton").textContent = "Build Farm (" + formatNumber(newCostFood) + " Food)";

        updateDisplay();
    }
}

function buildHut()
{
    const building = buildings.hut;
    const costWood = buildings.hut.cost.wood;

    if (wood >= costWood)
    {
        buildings.hut.amount += 1;

        wood -= costWood;
        maxPopulation += building.effect.maxPopulationIncrease;

        buildings.hut.cost.wood = buildings.hut.cost.wood * 2;

        // change the buttons to show the new cost
        document.getElementById("hutButton").textContent = "Build Hut (" + formatNumber(buildings.hut.cost.wood) + " Wood)";

        updateDisplay();
    }
}

function buildHouse()
{
    const building = buildings.house;
    const costWood = buildings.house.cost.wood;

    if (wood >= costWood)
    {
        buildings.house.amount += 1;

        wood -= costWood;
        maxPopulation += building.effect.maxPopulationIncrease;
        
        buildings.house.cost.wood = buildings.house.cost.wood * 2;

        // change the buttons to show the new cost
        document.getElementById("houseButton").textContent = "Build House (" + formatNumber(buildings.house.cost.wood) + " Wood)";

        updateDisplay();
    }
}

function buildBigHouse()
{
    const building = buildings.bighouse;
    const costWood = buildings.bighouse.cost.wood;
    const costFood = buildings.bighouse.cost.food;

    if (food >= costFood && wood >= costWood)
    {
        buildings.bighouse.amount += 1;

        wood -= costWood;
        maxPopulation += building.effect.maxPopulationIncrease;

        buildings.bighouse.cost.wood = buildings.bighouse.cost.wood * 2;
        buildings.bighouse.cost.food = buildings.bighouse.cost.food * 2;

        // change the buttons to show the new cost
        document.getElementById("bigHouseButton").textContent = "Build Big House (" + formatNumber(buildings.bighouse.cost.food) + " Food, " + formatNumber(buildings.bighouse.cost.wood) + " Wood)";

        updateDisplay();
    }
}

function buildBiggerHouse()
{
    const building = buildings.biggerhouse;
    const costWood = buildings.biggerhouse.cost.wood;
    const costFood = buildings.biggerhouse.cost.food;
    const costMetal = buildings.biggerhouse.cost.metal;

    if (food >= costFood && wood >= costWood && metal >= costMetal)
    {
        buildings.biggerhouse.amount += 1;

        food -= costFood;
        wood -= costWood;
        metal -= costMetal;
        maxPopulation += building.effect.maxPopulationIncrease;

        buildings.house.cost.wood = buildings.house.cost.wood * 2;
        buildings.biggerhouse.cost.food = buildings.biggerhouse.cost.food * 2;
        buildings.biggerhouse.cost.metal = buildings.biggerhouse.cost.metal * 2;

        // change the buttons to show the new cost
        document.getElementById("biggerHouseButton").textContent = "Build Bigger House (" + formatNumber(buildings.biggerhouse.cost.food) + " Food, " + formatNumber(buildings.biggerhouse.cost.wood) + " Wood, " + formatNumber(buildings.biggerhouse.cost.metal) + " Metal)";

        updateDisplay();
    }
}

function buildBiggestHouse()
{
    const building = buildings.biggesthouse;
    const costWood = buildings.biggesthouse.cost.wood;
    const costFood = buildings.biggesthouse.cost.food;
    const costMetal = buildings.biggesthouse.cost.metal;

    if (food >= costFood && wood >= costWood && metal >= costMetal)
    {
        buildings.biggesthouse.amount += 1;

        food -= costFood;
        wood -= costWood;
        metal -= costMetal;
        maxPopulation += building.effect.maxPopulationIncrease;

        buildings.house.cost.wood = buildings.house.cost.wood * 2;
        buildings.biggesthouse.cost.food = buildings.biggesthouse.cost.food * 2;
        buildings.biggesthouse.cost.metal = buildings.biggesthouse.cost.metal * 2;

        // change the buttons to show the new cost
        document.getElementById("biggestHouseButton").textContent = "Build Biggest House (" + formatNumber(buildings.biggesthouse.cost.food) + " Food, " + formatNumber(buildings.biggesthouse.cost.wood) + " Wood, " + formatNumber(buildings.biggesthouse.cost.metal) + " Metal)";

        updateDisplay();
    }
}

function buildMine()
{
    const building = buildings.mine;
    const costFood = buildings.mine.cost.food;
    const costWood = buildings.mine.cost.wood;
    const costMetal = buildings.mine.cost.metal;

    if (food >= costFood && wood >= costWood && metal >= costMetal)
    {
        buildings.mine.amount += 1;

        food -= costFood;
        wood -= costWood;
        maxMetal *= building.effect.maxMetalMultiplier;

        newCostFood = costFood * 2;
        newCostWood = costWood * 2;
        newCostMetal = maxMetal / 2;
        buildings.mine.cost.food = newCostFood;
        buildings.mine.cost.wood = newCostWood;
        buildings.mine.cost.metal = newCostMetal;

        // change the buttons to show the new cost
        document.getElementById("mineButton").textContent = "Build Mine (" + formatNumber(newCostFood) + " Food, " + formatNumber(newCostWood) + " Wood, " + formatNumber(newCostMetal) + " Metal)";

        if(!unlocks.miners)
        {
            unlocks.miners = true;
            playerUnlock("miners");
        }

        updateDisplay();
    }
}

function buildBarracks()
{
    const building = buildings.barracks;
    const costFood = buildings.barracks.cost.food;
    const costWood = buildings.barracks.cost.wood;
    const costMetal = buildings.barracks.cost.metal;

    if (food >= costFood && wood >= costWood && metal >= costMetal)
    {
        buildings.barracks.amount += 1;

        food -= costFood;
        wood -= costWood;
        metal -= costMetal;
        maxPopulation += building.effect.maxPopulationIncrease;

        buildings.barracks.cost.food = buildings.barracks.cost.food * 2;
        buildings.barracks.cost.wood = buildings.barracks.cost.wood * 2;
        buildings.barracks.cost.metal = buildings.barracks.cost.metal * 2;

        // change the buttons to show the new cost
        document.getElementById("barracksButton").textContent = "Build Barracks (" + formatNumber(buildings.barracks.cost.food) + " Food, " + formatNumber(buildings.barracks.cost.wood) + " Wood, " + formatNumber(buildings.barracks.cost.metal) + " Metal)";

        if(!unlocks.military)
        {
            unlocks.military = true;
            playerUnlock("military");
        }

        updateDisplay();
    }
}


function playerUnlock(type)
{
    switch (type)
    {
        case "house":
            unlocks.house = true;
            document.getElementById("houseButton").style.display = "inline-block";
            document.getElementById("houseBuildings").style.display = "inline-block";
            document.getElementById("houseBuildings").style.width = "100%";

            addToLog("You have learned to build a house!");
            break;

        case "mine":
            unlocks.mine = true;
            document.getElementById("mineButton").style.display = "inline-block";

            addToLog("You now know how to make a mine!");
            break;
        
        case "miners":
            unlocks.metal = true;
            document.getElementById("mineBuildings").style.display = "inline-block";
            document.getElementById("mineBuildings").style.width = "100%";                
            document.getElementById("metalStats").style.display = "flex";
            document.getElementById("buttonMetal").style.display = "inline-block";
            document.getElementById("minersSection").style.display = "inline-block";
            document.getElementById("minersSection").style.width = "100%";  

            addToLog("You can now train your population to be miners!");
            break;

        case "barracks":
            unlocks.barracks = true;
            document.getElementById("barracksButton").style.display = "inline-block";
            document.getElementById("barracksBuildings").style.display = "inline-block";
            document.getElementById("barracksBuildings").style.width = "100%";

            addToLog("You have learned how to build a barracks!");
            break;
        
        case "military":
            unlocks.military = true;
            document.getElementById("militarySection").style.display = "inline-block";
            document.getElementById("militarySection").style.width = "100%";
            document.getElementById("battle").style.display = "inline-block";

            addToLog("You now know how to train your people for battle!");
            break;
        
        case "swords":
            unlocks.swords = true;
            document.getElementById("swordsStats").style.display = "inline-block";
            document.getElementById("swordsStats").style.width = "100%";
            document.getElementById("swordsSection").style.display = "inline-block";
            document.getElementById("swordsSection").style.width = "100%";

            addToLog("You have learned to make swords!");
            break;

        case "bighouse":
            unlocks.bighouse = true;
            document.getElementById("bigHouseButton").style.display = "inline-block";

            addToLog("You have learned to build a big house!");
            break;

        case "biggerhouse":
            unlocks.biggerhouse = true;
            document.getElementById("biggerHouseButton").style.display = "inline-block";

            addToLog("You have learned to build an even bigger house!");
            break;

        case "biggesthouse":
            unlocks.biggesthouse = true;
            document.getElementById("biggestHouseButton").style.display = "inline-block";

            addToLog("You have learned to build the biggest house in the world!");
            break;
        case "library":
            unlocks.library = true;
            document.getElementById("libraryButton").style.display = "inline-block";

            addToLog("You have learned to build a library! Maybe you can do some original research.");
            break;
    }
}

function setAssignmentAmount(amount)
{
    if (amount === 'all') {
        allSelected = true;
        currentAssignmentAmount = availableWorkers;
    } else {
        allSelected = false;
        currentAssignmentAmount = amount;
    }

    const buttons = document.querySelectorAll('#assignments .button');
    buttons.forEach(button => {
        button.style.background = "#444";
    });
    switch (amount) {
        case 1:
            document.getElementById("button1").style.background = "#666";
            break;
        case 10:
            document.getElementById("button10").style.background = "#666";
            break;
        case 100:
            document.getElementById("button100").style.background = "#666";
            break;
        case 1000:
            document.getElementById("button1000").style.background = "#666";
            break;
        case 'all':
            document.getElementById("buttonAll").style.background = "#666";
            break;
    }
}

function changeAssignment(type, amount) {
    if (!assignments.hasOwnProperty(type)) {
        console.error(`Invalid assignment type: ${type}`);
        return;
    }

    if (allSelected) {
        amount = amount > 0 ? availableWorkers : -assignments[type];
    }

    const absAmount = Math.abs(amount);

    if (amount > 0 && availableWorkers >= absAmount) {
        assignments[type] += absAmount;
        availableWorkers -= absAmount;
    } else if (amount < 0 && assignments[type] >= absAmount) {
        assignments[type] -= absAmount;
        availableWorkers += absAmount;
    } else {
        console.warn(`Invalid operation: Not enough workers or assignments for type "${type}".`);
        return;
    }

    updateDisplay();
}


function incrementTarget()
{
    battleTarget = battleTargetVillages[battleTargetVillages.indexOf(battleTarget) + 1];
}

function startBattle()
{
    if (assignments.military > 0 && battling == false)
    {
        battling = true;
        document.getElementById("battleButton").style.display = "none";
        addToLog("Battle started!");
    }
}

function endBattle(result)
{

    if (battling == true)
    {
        battling = false;
        document.getElementById("battleButton").style.display = "inline-block";
        if (result == "victory")
        {
            research += 1000 * researchMultiplier;
            addToLog("You won the battle against " + battleTarget.name + "!");
        }
        else
        {
            addToLog("You lost the battle against " + battleTarget.name);
        }
    }
}


function playerStartGathering(type)
{
    if (playerIsCurrentlyGathering)
    {
        if (whatIsCurrentlyGathering === type)
        {
            // Stop gathering the current resource
            console.log("Player stopped gathering " + type);
            document.getElementById("button" + type.charAt(0).toUpperCase() + type.slice(1)).style.background = "#444";
            document.getElementById("button" + type.charAt(0).toUpperCase() + type.slice(1)).textContent = "Gather " + type;
            playerIsCurrentlyGathering = false;
            whatIsCurrentlyGathering = "";
        }
        else
        {
            // Switch to gathering a different resource
            console.log("Player switched to gathering " + type);
            document.getElementById("button" + whatIsCurrentlyGathering.charAt(0).toUpperCase() + whatIsCurrentlyGathering.slice(1)).style.background = "#444";
            document.getElementById("button" + whatIsCurrentlyGathering.charAt(0).toUpperCase() + whatIsCurrentlyGathering.slice(1)).textContent = "Gather " + whatIsCurrentlyGathering;

            document.getElementById("button" + type.charAt(0).toUpperCase() + type.slice(1)).style.background = "#666";
            document.getElementById("button" + type.charAt(0).toUpperCase() + type.slice(1)).textContent = "Stop gathering " + type;
            whatIsCurrentlyGathering = type;
        }
    }
    else
    {
        // Start gathering a resource
        console.log("Player started gathering " + type);
        document.getElementById("button" + type.charAt(0).toUpperCase() + type.slice(1)).style.background = "#666";
        document.getElementById("button" + type.charAt(0).toUpperCase() + type.slice(1)).textContent = "Stop gathering " + type;
        playerIsCurrentlyGathering = true;
        whatIsCurrentlyGathering = type;
    }
}

function tickPlayerGather(type) // player gathers resouces
{
    if (type === "" || !playerIsCurrentlyGathering)
    {
        return;
    }
    let currentTime = new Date().getTime();
    if (currentTime - lastGatheringTime >= gatheringInterval)
    {
        lastGatheringTime = currentTime;

        if (type === "food" && food + playerGatherAmount <= maxFood)
        {
            food += playerGatherAmount;
        }
        else if (type === "wood" && wood + playerGatherAmount <= maxWood)
        {
            wood += playerGatherAmount;
        }
        else if (type === "metal" && metal + playerGatherAmount <= maxMetal)
        {
            metal += playerGatherAmount;
        }
        else if (type === "research" && unlocks.research)
        {
            research += playerGatherAmount * researchMultiplier;
        }        
    }
}

function readBook(type)
{
    if (type === "farming" && buildings.book.amount > 0 && farmingMultiplier < 256)
    {
        farmingMultiplier *= 2;
        buildings.book.amount -= 1;
        addToLog("You are teaching your population about farming. Your farming multiplier is now " + farmingMultiplier);
        if (farmingMultiplier >= 256)
        {
            addToLog("Your population has mastered farming!");
            // hide the button
            document.getElementById("researchFarmingButton").style.display = "none";
        }
    }
    else if(type === "timber" && buildings.book.amount > 0 && timberMultiplier < 256)
    {
        timberMultiplier *= 2;
        buildings.book.amount -= 1;
        addToLog("You are teaching your population about timber. Your timber multiplier is now " + timberMultiplier);
        if (timberMultiplier >= 256)
        {
            addToLog("Your population has mastered timber!");
            // hide the button
            document.getElementById("researchTimberButton").style.display = "none";
        }
    }
    else if(type === "mining" && buildings.book.amount > 0 && miningMultiplier < 256)
    {
        miningMultiplier *= 2;
        buildings.book.amount -= 1;
        addToLog("You are teaching your population about mining. Your mining multiplier is now " + miningMultiplier);
        if (miningMultiplier >= 256)
        {
            addToLog("Your population has mastered mining!");
            // hide the button
            document.getElementById("researchMiningButton").style.display = "none";
        }
    }
    else if(type === "research" && buildings.book.amount > 0 && researchMultiplier < 256)
    {
        researchMultiplier *= 2;
        buildings.book.amount -= 1;
        addToLog("You are teaching your population about research. Your research multiplier is now " + researchMultiplier);
        if (researchMultiplier >= 256)
        {
            addToLog("You have mastered research!");
            // hide the button
            document.getElementById("researchResearchButton").style.display = "none";
        }
    }
    updateDisplay();
}

function tickIncrementMaterials() // Increments materials based on assignments
{
    if (food + (assignments.farm * farmingMultiplier) >= maxFood)
    {
        food = maxFood;
    }
    if (wood + (assignments.wood * timberMultiplier) >= maxWood)
    {
        wood = maxWood;
    }
    if (metal + (assignments.metal * miningMultiplier) >= maxMetal)
    {
        metal = maxMetal;
    }

    if (food + (assignments.farm * farmingMultiplier) <= maxFood)
    {
        food += assignments.farm * farmingMultiplier;
    }
    if (wood + (assignments.wood * timberMultiplier) <= maxWood)
    {
        wood += assignments.wood * timberMultiplier;
    }
    if (metal + (assignments.metal * miningMultiplier) <= maxMetal)
    {
        metal += assignments.metal * miningMultiplier;
    }

    maxSwords = assignments.military * 2;


    for(let i = 0; i < assignments.swords; i++)
    {
        if (metal < 100 || swords >= maxSwords)
        {
            break;
        }
        swords += 1;
        metal -= 100;
    }

}

function tickCheckForGameOver()
{
    if(population === 0)
    {
        alert("Game over! You have no population left.");
        resetGame(true);
    }
}

function tickUpdateFoodAndPopulation() // Updates food and population every 10 ticks
{
    if (totalTicks % 10 === 0 && totalTicks > 9)
    {
        if (food - population >= 0)
        {
            console.log("Food decreases by: " + population);
            food -= population;
        }
        else
        {
            console.log("Food decreases by: " + food);
            food = 0;
        }
        if (population < maxPopulation && assignments.pop >= 2 && food > 0)
        {
            let newPopulation = Math.ceil(assignments.pop / 2);
            if(newPopulation + population > maxPopulation) // goes over limit, set to max
            {
                newPopulation = maxPopulation - population;
            }
            console.log("Population increases by: " + newPopulation);
            population += newPopulation;
        }
    }
}

function tickCheckForUnlocks() // Checks if the player has unlocked new things
{
    if(population >= 15 && unlocks.house == false)
    {
        playerUnlock("house");
    }

    if (maxPopulation >= 10 && unlocks.mine == false)
    {
        playerUnlock("mine");
    }

    if (maxPopulation >= 20 && metal >= 200 && unlocks.barracks == false)
    {
        playerUnlock("barracks");
    }

    if (maxPopulation >= 40 && unlocks.library == false)
    {
        playerUnlock("library");
    }

    if (maxPopulation >= 55 && unlocks.bighouse == false)
    {
        playerUnlock("bighouse");
    }
    if (maxPopulation >= 500 && unlocks.biggerhouse == false)
    {
        playerUnlock("biggerhouse");
    }
    if (maxPopulation >= 2000 && unlocks.biggesthouse == false)
    {
        playerUnlock("biggesthouse");
    }
}



function tickCheckStarvation() // Checks if the player has enough food to feed the population
{
    if (food === 0)
    {
        if (population > 0) // reduce population
        {
            addToLog("Your population is starving!");
            population -= 1;

            if ((assignments.farm + assignments.pop + assignments.wood + assignments.metal) > 0) // reduce workers
            {
                const assignmentKeys = Object.keys(assignments);
                let attempts = 0;
                const checkedKeys = [];

                while (attempts < assignmentKeys.length)
                {
                    const randomIndex = Math.floor(Math.random() * assignmentKeys.length);
                    const randomKey = assignmentKeys[randomIndex];

                    if (checkedKeys.includes(randomKey)) // already checked this key
                    {
                        continue; // next key without incrementing attempts
                    }

                    checkedKeys.push(randomKey);

                    if (assignments[randomKey] > 0)
                    {
                        console.log("Random assignment decreases by 1: " + randomKey);
                        assignments[randomKey] -= 1;
                        break;
                    }

                    attempts++;
                }
            }
        }
    }
}

function tickHandleBattle()
{
    if (assignments.military > 0)
    {
        if(assignments.military > 100)
        {
            // decrease enemy strength by 1 for every 100 military units
            battleTarget.strength -= Math.floor(assignments.military / 100);
            battleTarget.strength -= Math.floor(assignments.military / 100);
            assignments.military -= Math.floor(assignments.military / 100);
            population -= Math.floor(assignments.military / 100);
            swords -= Math.floor(assignments.military / 100);
            if(swords < 0)
            {
                swords = 0;
            }
            if(assignments.military < 0)
            {
                assignments.military = 0;
            }
        }
        else
        {
            // decrease enemy strength
            battleTarget.strength -= 1;
            if(swords > 0)
            {
                swords -= 1;
                battleTarget.strength -= 1;
            }
            // decrease player strength
            assignments.military -= 1;
            population -= 1;
        }

        // check if enemy is defeated
        if (battleTarget.strength <= 0)
        {
            endBattle("victory");
            // if we win the 1st village, unlock swords
            if (battleTargetVillages.indexOf(battleTarget) == 0 && !unlocks.swords)
            {
                unlocks.swords = true;
                playerUnlock("swords");
            }
            // if we win the last village, end the game
            if (battleTargetVillages.indexOf(battleTarget) == battleTargetVillages.length - 1)
            {
                if (confirm("You have conquered the world! You are the new king!\n\nClick OK to reload, or Cancel to continue playing."))
                {
                    location.reload();
                }
            }
            else
            {
                incrementTarget();
            }           
            
            return;
        }
        if (assignments.military <= 0)
        {
            endBattle("defeat");
            return;
        }
    }
}

function tickCheckExplorers()
{
    if (assignments.explorers < 1)
    {
        return;
    }

    if (totalTicks % 50 !== 0)
    {
        return;
    }

    console.log("Explorers are exploring!");

    for (let i = 0; i < assignments.explorers; i++)
    {
        const randomChance = Math.floor(Math.random() * 100) + 1; // Generate a number between 1 and 100
        if (randomChance === 100)
        {
            // Determine the type of discovery: 50% chance for resource, 50% chance for population
            const discoveryType = Math.random() < 0.5 ? "resource" : "population";
            if (discoveryType === "resource")
            {
                const resourceTypes = ["food", "wood", "metal"];
                const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)]; // Randomly pick one of the three resources
                let resourceAmount;
                if (resourceType === "food")
                {
                    resourceAmount = Math.floor(maxFood / 10); // 1/10th of max food
                }
                else if (resourceType === "wood")
                {
                    resourceAmount = Math.floor(maxWood / 10); // 1/10th of max wood
                }
                else
                {
                    resourceAmount = Math.floor(maxMetal / 10); // 1/10th of max metal
                }
                
                if (resourceType === "food")
                {
                    differentFeasts = ["brought home a big feast of bear meat", "found a hidden stash of berries", "brought home a feast of fish", "found a hidden stash of nuts", "brought home a feast of wild boar"];
                    const foodMsg = differentFeasts[Math.floor(Math.random() * differentFeasts.length)];
                    food = Math.min(food + resourceAmount, maxFood); // Add food, but not exceeding maxFood
                    addToLog(`Explorers ${foodMsg}! (+${resourceAmount} food)`);
                }
                else if (resourceType === "wood")
                {
                    differentWood = ["found a hidden stash of firewood", "brought home a big stash of lumber", "found a hidden stash of logs", "brought home a big stack of branches", "found a hidden stash of wood"];
                    const woodMsg = differentWood[Math.floor(Math.random() * differentWood.length)];
                    wood = Math.min(wood + resourceAmount, maxWood); // Add wood, but not exceeding maxWood
                    addToLog(`Explorers ${woodMsg}! (+${resourceAmount} wood)`);
                }
                else
                {
                    differentMetal = ["found a hidden stash of metal", "brought home a big stash of metal", "found a hidden stash of metal", "brought home a big stash of metal", "found a hidden stash of metal"];
                    const metalMsg = differentMetal[Math.floor(Math.random() * differentMetal.length)];
                    metal = Math.min(metal + resourceAmount, maxMetal); // Add metal, but not exceeding maxMetal
                    addToLog(`Explorers ${metalMsg}! (+${resourceAmount} metal)`);
                }
            }
            else
            {
                const populationIncrease = Math.floor(Math.random() * 3) + 1; // Random increase between 1 and 3
                // if population was already at max, don't increase
                if (population < maxPopulation)
                {
                    if(populationIncrease + population > maxPopulation) // goes over limit, set to max
                    {
                        populationIncrease = maxPopulation - population;
                    }
                    // Increase population
                    population += populationIncrease;
                    addToLog(`Explorers found ${populationIncrease} new people!`);
                }
                else
                {
                    // if population was already at max, don't increase
                    addToLog(`Explorers found ${populationIncrease} new people but you didn't have room for them!`);
                }
            }
        }
    }
}

function addToLog(message)
{
    const log = document.getElementById("log");
    const newLogEntry = document.createElement("p");
    newLogEntry.textContent = message;
    log.appendChild(newLogEntry);
    log.scrollTop = log.scrollHeight; // Scroll to the bottom

    // limit log size
    const logEntries = log.getElementsByTagName("p");
    if (logEntries.length > 50)
    {
        log.removeChild(logEntries[0]);
    }
}

function formatNumber(num)
{
    if (num >= 1_000_000_000_000_000)
    {
        return (num / 1_000_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'Q';
    }
    else if (num >= 1_000_000_000_000)
    {
        return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
    }
    else if (num >= 1_000_000_000)
    {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    else if (num >= 1_000_000)
    {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    else if (num >= 1_000)
    {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    else
    {
        return num.toString();
    }
}

function updateDisplay()
{
    // Materials
    document.getElementById("food").textContent = formatNumber(food);
    document.getElementById("maxFood").textContent = formatNumber(maxFood);
    document.getElementById("wood").textContent = formatNumber(wood);
    document.getElementById("maxWood").textContent = formatNumber(maxWood);
    document.getElementById("metal").textContent = formatNumber(metal);
    document.getElementById("maxMetal").textContent = formatNumber(maxMetal);
    document.getElementById("swords").textContent = formatNumber(swords);

    // Materials Progress bars
    document.getElementById("foodProgress").style.width = (food / maxFood) * 100 + "%";
    document.getElementById("woodProgress").style.width = (wood / maxWood) * 100 + "%";
    document.getElementById("metalProgress").style.width = (metal / maxMetal) * 100 + "%";

    // Buildings
    document.getElementById("farm").textContent = formatNumber(buildings.farm.amount);
    document.getElementById("barn").textContent = formatNumber(buildings.barn.amount);
    document.getElementById("hut").textContent = formatNumber(buildings.hut.amount);
    document.getElementById("house").textContent = formatNumber(buildings.house.amount);    
    document.getElementById("mine").textContent = formatNumber(buildings.mine.amount);
    document.getElementById("barracks").textContent = formatNumber(buildings.barracks.amount);
    document.getElementById("bigHouse").textContent = formatNumber(buildings.bighouse.amount);
    document.getElementById("biggerHouse").textContent = formatNumber(buildings.biggerhouse.amount);
    document.getElementById("biggestHouse").textContent = formatNumber(buildings.biggesthouse.amount);
    document.getElementById("library").textContent = formatNumber(buildings.library.amount);

    // Research
    document.getElementById("researchPoints").textContent = formatNumber(research);
    document.getElementById("booksAmount").textContent = formatNumber(buildings.book.amount); 

    if (farmingMultiplier >= 256)
    {
        document.getElementById("researchFarmingButton").style.display = "none";
    }
    if (timberMultiplier >= 256)
    {
        document.getElementById("researchTimberButton").style.display = "none";
    }
    if (miningMultiplier >= 256)
    {
        document.getElementById("researchMiningButton").style.display = "none";
    }
    if (researchMultiplier >= 256)
    {
        document.getElementById("researchResearchButton").style.display = "none";
    }

    // Population
    document.getElementById("population").textContent = formatNumber(population);
    document.getElementById("maxPopulation").textContent = formatNumber(maxPopulation);

    // Assignments
    document.getElementById("availableWorkers").textContent = formatNumber(availableWorkers);
    document.getElementById("farmWorkers").textContent = formatNumber(assignments.farm);
    document.getElementById("popWorkers").textContent = formatNumber(assignments.pop);
    document.getElementById("woodWorkers").textContent = formatNumber(assignments.wood);
    document.getElementById("metalWorkers").textContent = formatNumber(assignments.metal);
    document.getElementById("militaryWorkers").textContent = formatNumber(assignments.military);
    document.getElementById("swordsWorkers").textContent = formatNumber(assignments.swords);
    document.getElementById("explorersWorkers").textContent = formatNumber(assignments.explorers);


    // Battle
    document.getElementById("units").textContent = assignments.military;
    document.getElementById("militaryStrength").textContent = Math.floor(swords / 2) + assignments.military;
    if (assignments.military > 0 && battling == false)
    {
        document.getElementById("battleButton").style.display = "inline-block";
    }
    else
    {
        document.getElementById("battleButton").style.display = "none";
    }
    document.getElementById("targetName").textContent = battleTarget.name;
    document.getElementById("targetStrength").textContent = battleTarget.strength;
    document.getElementById("playerUnits").textContent = assignments.military;
    document.getElementById("enemyUnits").textContent = battleTarget.strength;

    // Combat Progress bars
    let combatRatio = (assignments.military + (swords / 2)) / (battleTarget.strength + assignments.military + (swords / 2)) * 100;
    document.getElementById("combatRatioBar").style.width = combatRatio + "%";
    document.getElementById("playerUnitsLeftBar").style.width = (assignments.military / (assignments.military + battleTarget.strength)) * 100 + "%";
    document.getElementById("enemyUnitsLeftBar").style.width = (battleTarget.strength / (assignments.military + battleTarget.strength)) * 100 + "%";

    // Building affordability
    CheckBuildingAffordability();
}

function CheckBuildingAffordability()
{
    // Check if the player can afford to build a barn
    const barnCost = buildings.barn.cost.wood;
    if (wood >= barnCost)
    {
        document.getElementById("barnButton").disabled = false;
    }
    else
    {
        document.getElementById("barnButton").disabled = true;
    }
    // Check if the player can afford to build a farm
    const farmCost = buildings.farm.cost.food;
    if (food >= farmCost)
    {
        document.getElementById("farmButton").disabled = false;
    }
    else
    {
        document.getElementById("farmButton").disabled = true;
    }
    // Check if the player can afford to build a hut
    const hutCost = buildings.hut.cost.wood;
    if (wood >= hutCost)
    {
        document.getElementById("hutButton").disabled = false;
    }
    else
    {
        document.getElementById("hutButton").disabled = true;
    }
    // Check if the player can afford to build a house
    const houseCost = buildings.house.cost.wood;
    if (wood >= houseCost)
    {
        document.getElementById("houseButton").disabled = false;
    }
    else
    {
        document.getElementById("houseButton").disabled = true;
    }
    // Check if the player can afford to build a big house
    const bigHouseCost = buildings.bighouse.cost.wood;
    const bigHouseFoodCost = buildings.bighouse.cost.food;
    if (food >= bigHouseFoodCost && wood >= bigHouseCost)
    {
        document.getElementById("bigHouseButton").disabled = false;
    }
    else
    {
        document.getElementById("bigHouseButton").disabled = true;
    }
    // Check if the player can afford to build a bigger house
    const biggerHouseCost = buildings.biggerhouse.cost.wood;
    const biggerHouseFoodCost = buildings.biggerhouse.cost.food;
    const biggerHouseMetalCost = buildings.biggerhouse.cost.metal;
    if (food >= biggerHouseFoodCost && wood >= biggerHouseCost && metal >= biggerHouseMetalCost)
    {
        document.getElementById("biggerHouseButton").disabled = false;
    }
    else
    {
        document.getElementById("biggerHouseButton").disabled = true;
    }
    // Check if the player can afford to build a biggest house
    const biggestHouseCost = buildings.biggesthouse.cost.wood;
    const biggestHouseFoodCost = buildings.biggesthouse.cost.food;
    const biggestHouseMetalCost = buildings.biggesthouse.cost.metal;
    if (food >= biggestHouseFoodCost && wood >= biggestHouseCost && metal >= biggestHouseMetalCost)
    {
        document.getElementById("biggestHouseButton").disabled = false;
    }
    else
    {
        document.getElementById("biggestHouseButton").disabled = true;
    }
    // Check if the player can afford to build a mine
    const mineCost = buildings.mine.cost.wood;
    const mineFoodCost = buildings.mine.cost.food;
    const mineMetalCost = buildings.mine.cost.metal;
    if (food >= mineFoodCost && wood >= mineCost && metal >= mineMetalCost)
    {
        document.getElementById("mineButton").disabled = false;
    }
    else
    {
        document.getElementById("mineButton").disabled = true;
    }
    // Check if the player can afford to build a barracks
    const barracksCost = buildings.barracks.cost.wood;
    const barracksFoodCost = buildings.barracks.cost.food;
    const barracksMetalCost = buildings.barracks.cost.metal;
    if (food >= barracksFoodCost && wood >= barracksCost && metal >= barracksMetalCost)
    {
        document.getElementById("barracksButton").disabled = false;
    }
    else
    {
        document.getElementById("barracksButton").disabled = true;
    }
    // Check if the player can afford to build a library
    const libraryCost = buildings.library.cost.wood;
    const libraryFoodCost = buildings.library.cost.food;
    const libraryMetalCost = buildings.library.cost.metal;
    if (food >= libraryFoodCost && wood >= libraryCost && metal >= libraryMetalCost)
    {
        document.getElementById("libraryButton").disabled = false;
    }
    else
    {
        document.getElementById("libraryButton").disabled = true;
    }

    // Check if the player can afford to build a book
    const bookCost = buildings.book.cost.research;
    if (research >= bookCost)
    {
        document.getElementById("buyBookButton").disabled = false;
    }
    else
    {
        document.getElementById("buyBookButton").disabled = true;
    }

    if(buildings.book.amount >= 1)
    {
        document.getElementById("researchFarmingButton").disabled = false;
        document.getElementById("researchTimberButton").disabled = false;
        document.getElementById("researchMiningButton").disabled = false;
        document.getElementById("researchResearchButton").disabled = false;
    }
    else
    {
        document.getElementById("researchFarmingButton").disabled = true;
        document.getElementById("researchTimberButton").disabled = true;
        document.getElementById("researchMiningButton").disabled = true;
        document.getElementById("researchResearchButton").disabled = true;
    }
}

function resetGame(silent = false)
{
    if (!silent)
    {
        if (!confirm("Are you sure you want to reset the game?"))
        {
            return;
        }
    }

    localStorage.removeItem('gameData');

    location.reload();
}

function saveGame(silent = false)
{
    battleTargetIndex = battleTargetVillages.indexOf(battleTarget);
    battleTargetStrength = battleTarget.strength;

    const gameData = {
        food,
        wood,
        metal,
        swords,
        population,
        maxPopulation,
        maxFood,
        maxWood,
        maxMetal,
        maxSwords,
        totalTicks,
        buildings,
        assignments,
        unlocks,
        battling,
        playerIsCurrentlyGathering,
        playerGatherAmount,
        whatIsCurrentlyGathering,
        research,
        farmingMultiplier,
        timberMultiplier,
        miningMultiplier,
        researchMultiplier,
        battleTargetIndex,
        battleTargetStrength
        
    };
    localStorage.setItem("gameData", JSON.stringify(gameData));

    if (!silent)
    {
        alert("Game saved! (The game also autosaves on every tick)");
    }
}

function exportGame() // shows the game data in a textarea
{
    const exportArea = document.getElementById("exportArea");
    exportArea.style.display = "block";

    battleTargetIndex = battleTargetVillages.indexOf(battleTarget);
    battleTargetStrength = battleTarget.strength;

    const gameData = JSON.stringify({
        food,
        wood,
        metal,
        swords,
        population,
        maxPopulation,
        maxFood,
        maxWood,
        maxMetal,
        maxSwords,
        totalTicks,
        buildings,
        assignments,
        unlocks,
        battling,
        playerIsCurrentlyGathering,
        playerGatherAmount,
        whatIsCurrentlyGathering,
        research,
        farmingMultiplier,
        timberMultiplier,
        miningMultiplier,
        researchMultiplier,
        battleTargetIndex,
        battleTargetStrength
    });

    // obfuscates the game data
    const obfuscatedData = btoa(gameData);
    const exportTextArea = document.getElementById("exportTextArea");
    exportTextArea.value = obfuscatedData;
}

function copyToClipboard() // Copies the exported game data to the clipboard
{
    const exportTextArea = document.getElementById("exportTextArea");
    exportTextArea.select();
    navigator.clipboard.writeText(exportTextArea.value).then(() => {
        console.log("Text copied to clipboard");
        alert("Game data copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });

    // hides the <div class="exportArea">
    const exportArea = document.getElementById("exportArea");
    exportArea.style.display = "none";   

}

function importGame()
{
    const gameData = prompt("Paste your game data here:");
    // de obfuscates the game data
    const deobfuscatedData = atob(gameData);

    if (deobfuscatedData)
    {
        loadGame(deobfuscatedData);
    }
}

function loadGame(optionalData)
{
    if(!optionalData)
    {
        gameData = JSON.parse(localStorage.getItem("gameData"));
    }
    else
    {
        gameData = JSON.parse(optionalData);
    }
        
    if (gameData)
    {
        console.log("Game loaded!");
        food = gameData.food;
        wood = gameData.wood;
        metal = gameData.metal;
        swords = gameData.swords;
        population = gameData.population;
        maxPopulation = gameData.maxPopulation;
        maxFood = gameData.maxFood;
        maxWood = gameData.maxWood;
        maxMetal = gameData.maxMetal;
        maxSwords = gameData.maxSwords;
        totalTicks = gameData.totalTicks;
        buildings = gameData.buildings;
        assignments = gameData.assignments;
        unlocks = gameData.unlocks;
        battling = gameData.battling;
        playerIsCurrentlyGathering = gameData.playerIsCurrentlyGathering;
        playerGatherAmount = gameData.playerGatherAmount;
        whatIsCurrentlyGathering = gameData.whatIsCurrentlyGathering;
        research = gameData.research;
        farmingMultiplier = gameData.farmingMultiplier;
        timberMultiplier = gameData.timberMultiplier;
        miningMultiplier = gameData.miningMultiplier;
        researchMultiplier = gameData.researchMultiplier;
        battleTargetIndex = gameData.battleTargetIndex;
        battleTargetStrength = gameData.battleTargetStrength;

        for (let key in unlocks)
        {
            if (unlocks[key])
            {
                playerUnlock(key);
            }
        }

        // update the building buttons to show the actual costs
        document.getElementById("barnButton").textContent = "Build Barn (" + formatNumber(buildings.barn.cost.wood) + " Wood)";
        document.getElementById("farmButton").textContent = "Build Farm (" + formatNumber(buildings.farm.cost.food) + " Food)";
        document.getElementById("hutButton").textContent = "Build Hut (" + formatNumber(buildings.hut.cost.wood) + " Wood)";
        document.getElementById("houseButton").textContent = "Build House (" + formatNumber(buildings.house.cost.wood) + " Wood)";
        document.getElementById("bigHouseButton").textContent = "Build Big House (" + formatNumber(buildings.bighouse.cost.food) + " Food, " + formatNumber(buildings.bighouse.cost.wood) + " Wood)";
        document.getElementById("biggerHouseButton").textContent = "Build Bigger House (" + formatNumber(buildings.biggerhouse.cost.food) + " Food, " + formatNumber(buildings.biggerhouse.cost.wood) + " Wood, " + formatNumber(buildings.biggerhouse.cost.metal) + " Metal)";
        document.getElementById("biggestHouseButton").textContent = "Build Biggest House (" + formatNumber(buildings.biggesthouse.cost.food) + " Food, " + formatNumber(buildings.biggesthouse.cost.wood) + " Wood, " + formatNumber(buildings.biggesthouse.cost.metal) + " Metal)";
        document.getElementById("mineButton").textContent = "Build Mine (" + formatNumber(buildings.mine.cost.food) + " Food, " + formatNumber(buildings.mine.cost.wood) + " Wood, " + formatNumber(buildings.mine.cost.metal) + " Metal)";
        document.getElementById("barracksButton").textContent = "Build Barracks (" + formatNumber(buildings.barracks.cost.food) + " Food, " + formatNumber(buildings.barracks.cost.wood) + " Wood, " + formatNumber(buildings.barracks.cost.metal) + " Metal)";
        document.getElementById("buyBookButton").textContent = "Write a book (" + formatNumber(buildings.book.cost.research) + " Research)";

        if(playerIsCurrentlyGathering)
        {
            playerIsCurrentlyGathering = false;
            playerStartGathering(whatIsCurrentlyGathering);
        }

        if(buildings.library.amount > 0)
        {
            // Opens research and hides library buy button
            unlocks.research = true;

            // hide the library button
            document.getElementById("libraryButton").style.display = "none";
    
            // show research gathering button
            document.getElementById("buttonResearch").style.display = "inline-block";
    
            // shows library div
            document.getElementById("researchbuttons").style.display = "inline-block";
            document.getElementById("researchbuttons").style.width = "100%";
        }

        battleTarget = battleTargetVillages[battleTargetIndex];
        battleTarget.strength = battleTargetStrength;

        updateDisplay();
    }
}


function tick()
{
    tickCheckForGameOver();
    tickIncrementMaterials();
    tickUpdateFoodAndPopulation();
    tickCheckForUnlocks();
    tickPlayerGather(whatIsCurrentlyGathering)
    tickCheckExplorers();
    tickCheckStarvation();

    if(battling)
    {
        tickHandleBattle();
    }

    // Calculates available workers
    availableWorkers = population;
    for (let key in assignments) {
        availableWorkers -= assignments[key];
    }

    updateDisplay();
    totalTicks += 1;
    saveGame(true); // silently save the game
}

setInterval(tick, 1000);