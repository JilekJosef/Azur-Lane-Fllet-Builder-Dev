let autoModeBool = true;

let constantCalculationMultiplier = 1;

let eHPModConst = 0;
let FPModConst = 0;   // all should be highest ship value * (constantCalculationMultiplier)
let TRPModConst = 0;
let AAModConst = 0;
let AVIModConst = 0;

//control panel
let eHPMultiplier = 0.0;
let burstDamageFear = 1.5; // 1 mean low, 2 mean high

let FPMultiplier = 0.0;
let TRPMultiplier = 0.0;
let AVIMultiplier = 0.0;
let AAMultiplier = 0.0;
let factionPriority = 0.5;
let connectionsPriority = 0.5;

const sliderIds = ["suvivabilitySlider", "burstSurvivabilitySlider", "firepowerSlider", "torpedoSlider", "aviationSlider", "antiAirSlider", "SameFactionSlider", "SynergySlider"];
const defaultPriorities = [eHPMultiplier,burstDamageFear,FPMultiplier,TRPMultiplier,AVIMultiplier,AAMultiplier,factionPriority,connectionsPriority]

let averageAccuracy = 151.4;
let averageLuck = 53.5;


// retrofits goes first !!! important
//new line extra ;
//no NBSP
//last new line no ;
//compiler insert
const shipsRaw = "";
let columns = 24;
let temp = shipsRaw.split(";");
let shipsStats = new Array(temp.length/columns);
for (let i = 0; i < shipsStats.length; i++) {
    shipsStats[i] = new Array(columns);
}
for (let i = 0; i < shipsStats.length; i++) {
    for (let j = 0; j < shipsStats[0].length; j++) {
        shipsStats[i][j] = temp[i*shipsStats[0].length+j];
    }
}
//new line extra ;
//no NBSP
//compiler insert
const shipEffisRaw = "";
columns = 9;
temp = shipEffisRaw.split(";");
let shipsEffis = new Array(temp.length/columns);
for (let i = 0; i < shipsEffis.length; i++) {
    shipsEffis[i] = new Array(columns);
}
for (let i = 0; i < shipsEffis.length; i++) {
    for (let j = 0; j < shipsEffis[0].length; j++) {
        shipsEffis[i][j] = temp[i*shipsEffis[0].length+j];
    }
}

//new line ;//
//compiler insert
const shipClassesRaw = "";
temp = shipClassesRaw.split(";//");
shipClasses = new Array(temp.length);
for (let i = 0; i < temp.length; i++) {
    shipClasses[i] = temp[i].split(";");
}

//template: 144px-22ShipyardIcon.png;base64;..... !dont put ; at the end
//compiler insert
const shipThumbnailsRaw = "";

class Ship{
    id;
    name;
    rarity;
    nation;
    type;
    fleetPart;
    luck;
    armor;
    speed;
    health;
    firepower;
    antiAir;
    torpedo;
    evasion;
    aviation;
    oil;
    reload;
    antiSub;
    oxygen;
    ammo;
    accuracy;
    tier;
    recommended;
    recommendedShips = [];
    notes;
    slot1;
    slot1Eff;
    slot2;
    slot2Eff;
    slot3;
    slot3Eff;
    effectiveFirepower = 0.00;
    effectiveTorpedo = 0.00;
    effectiveAviation = 0.00;
    effectiveAntiAir = 0.00;
    effectiveHealth = 0.00;
    auxiliariesSlot = 2;

    special;

    thumbnail="";

    constructor(id,name,rarity,nation,type,luck,armor,speed,health,firepower,antiAir,torpedo,evasion,aviation,oil,reload,antiSub,oxygen,ammo,accuracy,tier,recommended,special,notes,slot1,slot1Eff,slot2,slot2Eff,slot3,slot3Eff) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.nation = nation;
        this.type = type;
        if(type === "AE"||type === "CA"||type === "CB"||type === "CL"||type === "DD"){
            this.fleetPart = "Vanguard";
        }else if(type === "SS"||type === "SSV"){
            this.fleetPart = "Subs";
        }else{
            this.fleetPart = "Main";
        }
        this.luck = luck;
        this.armor = armor;
        this.speed = speed;
        this.health = health;
        this.firepower = firepower;
        this.antiAir = antiAir;
        this.torpedo = torpedo;
        this.evasion = evasion;
        this.aviation = aviation;
        this.oil = oil;
        this.reload = reload;
        this.antiSub = antiSub;
        this.oxygen = oxygen;
        this.ammo = ammo;
        this.accuracy = accuracy;
        this.tier = tier;
        this.recommended = recommended;
        this.special = special.split(",");
        this.notes = notes;
        this.slot1 = slot1;
        this.slot1Eff = slot1Eff;
        this.slot2 = slot2;
        this.slot2Eff = slot2Eff;
        this.slot3 = slot3;
        this.slot3Eff = slot3Eff;

        const slotArr = [slot1, slot2, slot3];
        const slotEffArr = [slot1Eff, slot2Eff, slot3Eff];

        for (let i = 0; i < 3; i++) {
            if(this.slotType(slotArr[i])[1]==="firepower"){
                this.effectiveFirepower += this.calcSlotPower(accuracy,luck,reload,this.slotType(slotArr[i])[0],this.slotEffToMultiplier(slotEffArr[i]));
            }else if(this.slotType(slotArr[i])[1]==="aviation"){
                this.effectiveAviation += this.calcSlotPower(accuracy,luck,reload,this.slotType(slotArr[i])[0],this.slotEffToMultiplier(slotEffArr[i]));
            }else if(this.slotType(slotArr[i])[1]==="antiAir"){
                this.effectiveAntiAir += this.calcSlotPower(accuracy,luck,reload,this.slotType(slotArr[i])[0],this.slotEffToMultiplier(slotEffArr[i]));
            }else if(this.slotType(slotArr[i])[1]==="torpedo"){
                this.effectiveTorpedo += this.calcSlotPower(accuracy,luck,reload,this.slotType(slotArr[i])[0],this.slotEffToMultiplier(slotEffArr[i]));
            }
        }

        //pseudo eHP + armor
        //TODO calculate best combination
        if(type === "DD"){
            this.effectiveHealth = (parseInt(health)+1060)/(Math.min(1, Math.max(0.1, (0.1 + averageAccuracy/(averageAccuracy+parseInt(evasion)+2) + ((averageLuck - parseInt(luck))/1000))))); // + 1060 health 2 repair toolboxes, needed for maintain accurate calc
        }else if(type === "CB" || type === "CA" || type === "CL"){
            this.effectiveHealth = (parseInt(health)+602)/(Math.min(1, Math.max(0.1, (0.1 + averageAccuracy/(averageAccuracy+parseInt(evasion)+2) + ((averageLuck - parseInt(luck)+49)/1000))))); // 1 repair toolbox + Improved Hydraulic Rudder (washing machine)
        }else{
            this.effectiveHealth = (parseInt(health))/(Math.min(1, Math.max(0.1, (0.1 + averageAccuracy/(averageAccuracy+parseInt(evasion)+2) + ((averageLuck - parseInt(luck))/1000)))));
        }
        if(armor === "Light"){
            this.effectiveHealth = this.effectiveHealth*0.95;
        }else if(armor === "Medium"){
            this.effectiveHealth = this.effectiveHealth*1.20;
        }else{
            this.effectiveHealth = this.effectiveHealth*1.40;
        }

    }
    updateEHP(){
        if(this.type === "DD"){
            this.effectiveHealth = (parseInt(this.health)+1060)/(Math.min(1, Math.max(0.1, (0.1 + averageAccuracy/(averageAccuracy+parseInt(this.evasion)+2) + ((averageLuck - parseInt(this.luck))/1000))))); // + 1060 health 2 repair toolboxes, needed for maintain accurate calc
        }else if(this.type === "CB" || this.type === "CA" || this.type === "CL"){
            this.effectiveHealth = (parseInt(this.health)+602)/(Math.min(1, Math.max(0.1, (0.1 + averageAccuracy/(averageAccuracy+parseInt(this.evasion)+2) + ((averageLuck - parseInt(this.luck)+49)/1000))))); // 1 repair toolbox + Improved Hydraulic Rudder (washing machine)
        }else{
            this.effectiveHealth = (parseInt(this.health))/(Math.min(1, Math.max(0.1, (0.1 + averageAccuracy/(averageAccuracy+parseInt(this.evasion)+2) + ((averageLuck - parseInt(this.luck))/1000)))));
        }
        if(this.armor === "Light"){
            this.effectiveHealth = this.effectiveHealth*0.95;
        }else if(this.armor === "Medium"){
            this.effectiveHealth = this.effectiveHealth*1.20;
        }else{
            this.effectiveHealth = this.effectiveHealth*1.40;
        }
    }

    calcSlotPower(accuracy,luck,reload,power,effi){
        let trueAcc = parseInt(accuracy)+(parseInt(luck)/1000.00); //TODO maybe should be same as eHP accuracy
        let trueReload = Math.sqrt(200.00/(parseInt(reload)+100.00));
        return (trueAcc*parseInt(power)/trueReload)*parseFloat(effi);
    }

    slotType(slot){
        if(slot.includes("Seaplanes")){
            return [this.aviation, "aviation"];
        }
        else if(slot.includes("Anti-Air")){
            return [this.antiAir, "antiAir"];
        }
        else if(slot.includes("Gun")){
            return [this.firepower, "firepower"];
        }else if (slot.includes("Fighters") || slot.includes("Bombers")){
            return [this.aviation, "aviation"];
        }else if(slot.includes("Torpedoes")){
            return [this.torpedo, "torpedo"];
        }else if(slot.includes("Auxiliaries")){
            this.auxiliariesSlot = this.auxiliariesSlot + 1;
            return [0, "auxiliaries"];
        }
    }

    slotEffToMultiplier(slotEff){
        return parseInt(slotEff.substring(0, slotEff.length - 1))/100.00;
    }
}

let ships = Array(shipsEffis.length-1);
for (let i = 1; i < shipsEffis.length; i++) {
    let index = null;
    //let indexCheck = -1;
    for (let j = 1; j < shipsStats.length; j++) {
        if(shipsEffis[i][1] === shipsStats[j][1] + " (Retrofit)"){
            index = j;
            break;
        }else if(shipsEffis[i][1] === shipsStats[j][1]){
            index = j;
        }
    }

    //if(index === indexCheck){
    //    console.log("Error when constructing: " + shipsEffis[i][1])
    //}
    //indexCheck = index;

    ships[i-1] = new Ship(shipsStats[index][0],shipsStats[index][1],shipsStats[index][2],shipsStats[index][3],shipsStats[index][4],shipsStats[index][5],shipsStats[index][6],shipsStats[index][7],shipsStats[index][8],shipsStats[index][9],shipsStats[index][10],shipsStats[index][11],shipsStats[index][12],shipsStats[index][13],shipsStats[index][14],shipsStats[index][15],shipsStats[index][16],shipsStats[index][17],shipsStats[index][18],shipsStats[index][19],shipsStats[index][20],shipsStats[index][21],shipsStats[index][22],shipsStats[index][23],shipsEffis[i][3],shipsEffis[i][4],shipsEffis[i][5],shipsEffis[i][6],shipsEffis[i][7],shipsEffis[i][8]);

    //calculating global effective modifiers
    if(ships[i-1].effectiveHealth*constantCalculationMultiplier > eHPModConst){
        eHPModConst = ships[i-1].effectiveHealth*constantCalculationMultiplier;
    }
    if(ships[i-1].effectiveFirepower*constantCalculationMultiplier > FPModConst){
        FPModConst = ships[i-1].effectiveFirepower*constantCalculationMultiplier;
    }
    if(ships[i-1].effectiveTorpedo*constantCalculationMultiplier > TRPModConst){
        TRPModConst = ships[i-1].effectiveTorpedo*constantCalculationMultiplier;
    }
    if(ships[i-1].effectiveAviation*constantCalculationMultiplier > AVIModConst){
        AVIModConst = ships[i-1].effectiveAviation*constantCalculationMultiplier;
    }
    if(ships[i-1].effectiveAntiAir*constantCalculationMultiplier > AAModConst){
        AAModConst = ships[i-1].effectiveAntiAir*constantCalculationMultiplier;
    }
}
recommendedShips(ships);
addThumbnailsToShips(ships, shipThumbnailsRaw);

//copy ships
const shipsOriginal = Array(ships.length);
for (let i = 0; i < ships.length; i++) {
    shipsOriginal[i] = ships[i];
}

function addThumbnailsToShips(ships, shipThumbnailsRaw){
    temp = shipThumbnailsRaw.split(";");
    for (let i = 0; i < temp.length-1; i+=2) {
        let tempName = temp[i].substring(6,temp[i].length - 16).replaceAll("_", " ")
        for (let j = 0; j < ships.length; j++) {
            if(ships[j].name === tempName){
                ships[j].thumbnail = temp[i+1];
                break;
            }
            //CHECK
            if(j === ships.length-1){
                console.log("No ship found for thumbnail name: " + tempName)
            }
        }
    }
}

function updateEHPModConstant(){
    for (let i = 0; i < ships.length; i++) {
        if(ships[i].effectiveHealth*constantCalculationMultiplier > eHPModConst){
            eHPModConst = ships[i].effectiveHealth*constantCalculationMultiplier;
        }
    }
}

function updateEHPs(ships) {
    eHPModConst = 0;
    for (let i = 0; i < ships.length; i++) {
        ships[i].updateEHP();
        if(ships[i].effectiveHealth*constantCalculationMultiplier > eHPModConst){
            eHPModConst = ships[i].effectiveHealth*constantCalculationMultiplier;
        }
    }
}

function recommendedShips(ships){
    for (let i = 0; i < ships.length; i++) {
        if(ships[i].recommended !== ""){
            temp = ships[i].recommended.split(";");
            let recommendedRevert = [];
            for (let j = 0; j < temp.length; j++) {
                for (let k = 0; k < ships.length; k++) {
                    if(ships[k].name === temp[j]||ships[k].type === temp[j]||ships[k].nation === temp[j]){
                        ships[k].recommendedShips.push(ships[i].name);
                        recommendedRevert.push(ships[k].name);
                    }
                }
                for (let k = 0; k < shipClasses.length; k++) {
                    if(shipClasses[k][0]===temp[j]){
                        for (let l = 1; l < shipClasses[k].length; l++) {
                            for (let m = 0; m < ships.length; m++) {
                                if(ships[m].name === shipClasses[k][l]){
                                    ships[m].recommendedShips.push(ships[i].name);
                                    recommendedRevert.push(ships[m].name);
                                }
                            }
                        }
                    }
                }
            }
            for (let j = 0; j < recommendedRevert.length; j++) {
                ships[i].recommendedShips.push(recommendedRevert[j]);
            }
        }
    }
}

function getFactionsAndConnections(currentShips){
    let factions = [];
    let connections = [];
    for (let i = 0; i < currentShips.length; i++) {

        let add = true;
        for (let k = 0; k < factions.length; k++) {
            if(factions[k] === ships[currentShips[i]].nation){
                add = false;
            }
        }
        if (add){
            factions.push(ships[currentShips[i]].nation);
        }

        for (let j = 0; j < ships[currentShips[i]].recommendedShips.length; j++) {
            connections.push(ships[currentShips[i]].recommendedShips[j]);
        }

    }
    //purify connections
    connections = Array.from(new Set(connections));

    return [factions,connections];
}

function shipSort(ships, fleetType, connectionsPriority, factionPriority, currentShips, shipFocus, eHPMultiplier, TRPMultiplier, FPMultiplier, AVIMultiplier, AAMultiplier) {
    let temp = getFactionsAndConnections(currentShips);
    let factions = temp[0];
    let connections = temp[1];

    //* mod from method parameters can be added here
    let constantMultiplier = 2;

    let shipsRated = [];
    let shipsRatedIndex = -1;
    for (let i = 0; i < ships.length; i++) {
        if(ships[i].fleetPart === fleetType){
            shipsRated.push([i, parseInt(ships[i].tier)]);
            shipsRatedIndex++;
            for (let j = 0; j < factions.length; j++) {
                if(ships[shipsRated[shipsRatedIndex][0]].nation === factions[j]){
                    shipsRated[shipsRatedIndex][1] += -factionPriority*constantMultiplier;// -0.5;
                }
            }

            for (let j = 0; j < connections.length; j++) {
                if (ships[shipsRated[shipsRatedIndex][0]].name === connections[j]){
                    shipsRated[shipsRatedIndex][1] += -connectionsPriority*constantMultiplier;// -0.5;
                }
            }
        }
    }

    for (let i = 0; i < shipsRated.length; i++) {
        /**/
        shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveAviation/AVIModConst*AVIMultiplier*constantMultiplier;
        shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveAntiAir/AAModConst*AAMultiplier*constantMultiplier;
        shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveTorpedo/TRPModConst*TRPMultiplier*constantMultiplier;
        shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveFirepower/FPModConst*FPMultiplier*constantMultiplier;
        shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveHealth/eHPModConst*eHPMultiplier*constantMultiplier;

        if(shipFocus === "flagship"){
            let find = false;
            for (let j = 0; j < ships[shipsRated[i][0]].special.length; j++) {
                if(ships[shipsRated[i][0]].special[j] === "flag"){
                    find = true;
                }
            }
            if(find){
                shipsRated[i][1] += -1; //shipsRated[i][1]/4;
            }else{
                shipsRated[i][1] += +1; //shipsRated[i][1]/4;
            }
        }else if(shipFocus === "side1"|| shipFocus === "side2"){
            let find = false;
            for (let j = 0; j < ships[shipsRated[i][0]].special.length; j++) {
                if(ships[shipsRated[i][0]].special[j] === "flag"){
                    find = true;
                }
            }
            if(find){
                shipsRated[i][1] += +1; //shipsRated[i][1]/4;
            }else{
                shipsRated[i][1] += -1; //shipsRated[i][1]/4;
            }
        }
    }

    // no connection duplikates
    // ship focus

    shipsRated = shipsSorter2D(shipsRated);

    return shipsRated;
}

let BBCount = 0;
let CVCount = 0;
let AACount = 0;
let healerCount = 0;
function shipSortAuto(ships, connectionsPriority, factionPriority, currentShips, shipFocus, mainOrVan){
    resetPriorities();
    let temp = getFactionsAndConnections(currentShips);
    let factions = temp[0];
    let connections = temp[1];

    let fleetFocus = $("#fleetFocus").val();
    let fleetType = $("#fleetType").val();
    let AAPriority =$("#AAFocus").is(":checked");

    let shipsRated = [];
    for (let i = 0; i < ships.length; i++) {
        shipsRated.push([i, parseInt(ships[i].tier)]);
        if (shipFocus === "flagship") {
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "flag"){
                    shipsRated[i][1] += -1;
                }
            }
        }else if (shipFocus === "mainTank"){
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "tank"){
                    shipsRated[i][1] += -2;
                }
            }
        }else if(shipFocus === "offTank") {
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "tank"){
                    shipsRated[i][1] += -0.5;
                }
            }
        }else if(shipFocus === "protected"){
            for (let j = 0; j < ships[i].special.length; j++) {
                let isTank = false;
                if(ships[i].special[j] === "tank"){
                    isTank = true
                }
                if(!isTank){
                    shipsRated[i][1] += -1;
                }
            }
        }else if(shipFocus === "side1"|| shipFocus === "side2"){
        }

        for (let j = 0; j < factions.length; j++) {
            if(factions[j] === ships[i].nation){
                shipsRated[i][1] += -factionPriority;
            }
        }
        for (let j = 0; j < connections.length; j++) {
            if(ships[i].recommended !== []){
                for (let k = 0; k < ships[i].recommended.length; k++) {
                    if(connections[j] === ships[i].recommended[k]){
                        shipsRated[i][1] += -connectionsPriority;
                        break;
                    }
                }
            }else{
                break;
            }
        }

        if(fleetFocus === "Boss"){
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "boss"){
                    shipsRated[i][1] += -1;
                    break;
                }
            }
        }else if(fleetFocus === "Mob"){
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "mob" || ships[i].special[j] === "healer"){
                    shipsRated[i][1] += -1;
                    break;
                }
            }
        }else{ //Universal

        }
        if(fleetType === "Standard"){
            if(shipFocus === "flagship" && (ships[i].type === "BB" || ships[i].type === "BC" || ships[i].type === "BBV" || ships[i].type === "BM")){
                shipsRated[i][1] += -1;
            }
            if((shipFocus === "side1" || shipFocus === "side2") && (BBCount > 1) && (ships[i].type === "CV" || ships[i].type === "CVL")){
                shipsRated[i][1] += -1;
            }
            if((shipFocus === "side1" || shipFocus === "side2") && (CVCount > 1) && (ships[i].type === "BB" || ships[i].type === "BC" || ships[i].type === "BBV" || ships[i].type === "BM")){
                shipsRated[i][1] += -1;
            }
        }else if(fleetType === "BB/BC"){
            if(ships[i].type === "BB" || ships[i].type === "BC" || ships[i].type === "BBV"){
                shipsRated[i][1] += -1;
            }
        }else{ //CV/CVL
            if(ships[i].type === "CV" || ships[i].type === "CVL"){
                shipsRated[i][1] += -1;
            }
        }
        if(AAPriority){
            if(AACount >! 2){
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "aa"){
                        shipsRated[i][1] += -1;
                        break;
                    }
                }
            }
        }
    }
    temp = [];
    for (let i = 0; i < shipsRated.length; i++) {
        if(ships[shipsRated[i][0]].fleetPart === mainOrVan){
            let duplicate = false;
            for (let j = 0; j < currentShips.length; j++) {
                if(shipsRated[i][0] === parseInt(currentShips[j])){
                    duplicate = true;
                    break;
                }
            }
            if(!duplicate){
                temp.push(shipsRated[i]);
            }
        }
    }
    shipsRated = temp;

    shipsRated = shipsSorter2D(shipsRated);

    return shipsRated;
}
//TODO complete rework
//add all tierlist flairs to data
//corting concept autobuild fleet, starting from flag
//sorting tier, flag
//if low tier or no flag use calculations
//

function shipsSorter2D(arr) {
    let change = false;
    do{
        change=false;
        for (let i = 0; i < arr.length-1; i++) {
            if (arr[i][1] > arr[i+1][1]){
                let temp = arr[i+1];
                arr[i+1] = arr[i];
                arr[i] = temp;
                change = true;
            }
        }
    }while(change);
    return arr;
}

function HTMLInjection(id, arr, valueToSet) {
    let out = "";
    out = out + "<option value=" + "empty" + ">" + "" + "</option>";
    for (let i = 0; i < arr.length; i++) {
        out = out + "<option value=" + arr[i][0] + ">" + ships[arr[i][0]].name + "</option>";
    }
    document.getElementById(id).innerHTML = out;
    document.getElementById(id).value = valueToSet;
}

function getCurrentShips(){
    let ids = ["side1","flagship","side2","mainTank","protected","offTank"];
    let currentShips = [];
    for (let i = 0; i < ids.length; i++) {
        temp = $("#" + ids[i] +" :selected").val();
        currentShips.push(temp);
    }
    return currentShips;
}

function purifyRawCurrentShips(currentShipsRaw){
    let currentShips = [];
    for (let i = 0; i < currentShipsRaw.length; i++) {
        if(currentShipsRaw[i] !== "empty"){
            currentShips.push(currentShipsRaw[i]);
        }
    }
    return currentShips;
}

function prepareToHTMLInjection(shipsSorted, currentShipsRaw, index){
    let out = [];
    let pseudoIndex = [];
    for (let i = 0; i < 6; i++) {
        if(index !== i){
            pseudoIndex.push(i);
        }
    }
    for (let i = 0; i < shipsSorted.length; i++) {
        if(shipsSorted[i][0] === parseInt(currentShipsRaw[index])){
            out.push(shipsSorted[i]);
        } else if(shipsSorted[i][0] !== parseInt(currentShipsRaw[pseudoIndex[0]]) && shipsSorted[i][0] !== parseInt(currentShipsRaw[pseudoIndex[1]]) && shipsSorted[i][0] !== parseInt(currentShipsRaw[pseudoIndex[2]]) && shipsSorted[i][0] !== parseInt(currentShipsRaw[pseudoIndex[3]]) && shipsSorted[i][0] !== parseInt(currentShipsRaw[pseudoIndex[4]])){
            out.push(shipsSorted[i]);
        }

    }
    return out;
}

function updateShips(){
    let currentShipsRaw = getCurrentShips();
    let currentShips = purifyRawCurrentShips(currentShipsRaw);

    if(autoModeBool){
        let ids = ["flagship","side1","side2","mainTank","protected","offTank"];
        let fleetType = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"];
        for (let i = 0; i < ids.length; i++) {
            let shipsSorted = shipSortAuto(ships,connectionsPriority,factionPriority,currentShips,ids[i],fleetType[i]);
            HTMLInjection(ids[i], prepareToHTMLInjection(shipsSorted,currentShipsRaw,i), shipsSorted[0][0]);
            currentShipsRaw = getCurrentShips();
            currentShips = purifyRawCurrentShips(currentShipsRaw);
        }
        BBCount = 0;
        CVCount = 0;
        AACount = 0;
        healerCount = 0;
    }else{
        let ids = ["side1","flagship","side2","mainTank","protected","offTank"]; //might be global
        let fleetType = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"];
        for (let i = 0; i < ids.length; i++) {
            let shipsSorted = shipSort(ships,fleetType[i],connectionsPriority,factionPriority,currentShips,ids[i],eHPMultiplier,TRPMultiplier,FPMultiplier,AVIMultiplier,AAMultiplier);
            HTMLInjection(ids[i], prepareToHTMLInjection(shipsSorted,currentShipsRaw,i), currentShipsRaw[i]);
        }
    }
    currentShipsRaw = getCurrentShips();
    calculateFleetPower(currentShipsRaw);
}

//initial page config
document.addEventListener("DOMContentLoaded", function (){
    //$("#showFaction").multiSelect();
    //select multiple 127px
    //label screenshot
    baseFilterInjection();
    generateButtons();
    loadPriorities();
    initializeAutoPriorities();
    let ids = ["flagship","side1","side2","mainTank","protected","offTank"];
    for (let i = 0; i < ids.length; i++) {
        HTMLInjection(ids[i], new Array(0), "empty");
    }

    let currentShipsRaw = getCurrentShips();
    let currentShips = purifyRawCurrentShips(currentShipsRaw);
    if(autoModeBool){
        ids = ["flagship","side1","side2","mainTank","protected","offTank"];
        let fleetType = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"];
        for (let i = 0; i < ids.length; i++) {
            let shipsSorted = shipSortAuto(ships,connectionsPriority,factionPriority,currentShips,ids[i],fleetType[i]);
            let temp = ships[shipsSorted[0][0]].name.replaceAll(" ", "");
            HTMLInjection(ids[i], prepareToHTMLInjection(shipsSorted,currentShipsRaw,i), shipsSorted[0][0]);
            currentShipsRaw = getCurrentShips();
            currentShips = purifyRawCurrentShips(currentShipsRaw);
        }
        BBCount = 0;
        CVCount = 0;
        AACount = 0;
        healerCount = 0;
    }else{
        let fleetType = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"];
        for (let i = 0; i < ids.length; i++) {
            let shipsSorted = shipSort(ships,fleetType[i],connectionsPriority,factionPriority,[],ids[i],eHPMultiplier,TRPMultiplier,FPMultiplier,AVIMultiplier,AAMultiplier);
            HTMLInjection(ids[i], prepareToHTMLInjection(shipsSorted,[],i), "empty");
        }
    }
    currentShipsRaw = getCurrentShips();
    calculateFleetPower(currentShipsRaw);
});

const fleetFocusOptions = ["Boss","Mob","Universal"];
const fleetTypeOptions = ["Standard","BB/BC","CV/CVL"];
function initializeAutoPriorities(){
    HTMLOptionInjection("fleetType", fleetTypeOptions);
    HTMLOptionInjection("fleetFocus", fleetFocusOptions);
}
function manualModeSwitch(){
    autoModeBool = !autoModeBool;
    if(autoModeBool){
        document.getElementById("manualSwitch").innerHTML = "Switch to manual";
    }else{
        document.getElementById("manualSwitch").innerHTML = "Switch to auto";
    }
    if(autoModeBool){
        let elements = document.querySelectorAll(".manual");
        for (let i = 0; i < elements.length; i++) {
            elements[i].setAttribute("style", "display: none;");
        }
        elements = document.querySelectorAll(".auto");
        for (let i = 0; i < elements.length; i++) {
            elements[i].setAttribute("style", "");
        }
    }else{
        let elements = document.querySelectorAll(".manual");
        for (let i = 0; i < elements.length; i++) {
            elements[i].setAttribute("style", "");
        }
        elements = document.querySelectorAll(".auto");
        for (let i = 0; i < elements.length; i++) {
            elements[i].setAttribute("style", "display: none;");
        }
    }
    updateShips();
}

function prioritiesUpdate() {
    eHPMultiplier = parseFloat($("#"+sliderIds[0]).val());
    if(burstDamageFear !== parseFloat($("#"+sliderIds[1]).val())){
        burstDamageFear = parseFloat($("#"+sliderIds[1]).val());
        updateEHPs(ships);
        updateEHPModConstant();
        updateShips();
    }
    FPMultiplier = parseFloat($("#"+sliderIds[2]).val());
    TRPMultiplier = parseFloat($("#"+sliderIds[3]).val());
    AVIMultiplier = parseFloat($("#"+sliderIds[4]).val());
    AAMultiplier = parseFloat($("#"+sliderIds[5]).val());
    factionPriority = parseFloat($("#"+sliderIds[6]).val());
    connectionsPriority = parseFloat($("#"+sliderIds[7]).val());
    updateShips();
}
function clearFleet(){
    let ids = ["side1","flagship","side2","mainTank","protected","offTank"];
    for (let i = 0; i < 6; i++) {
        document.getElementById(ids[i]).value = "empty";
    }
    updateShips();
}
function loadPriorities(){
    let step = 0.01;
    let min = 0; //standard min
    let max = 1; //standard max

    for (let i = 0; i < sliderIds.length; i++) {
        if(i === 1){
            document.getElementById(sliderIds[i]).setAttribute("min", 1);
            document.getElementById(sliderIds[i]).setAttribute("max", 2);
            document.getElementById(sliderIds[i]).setAttribute("step", step);
            document.getElementById(sliderIds[i]).setAttribute("value", defaultPriorities[i]);
            document.getElementById(sliderIds[i]).value = defaultPriorities[i];
        }else{
            document.getElementById(sliderIds[i]).setAttribute("min", min);
            document.getElementById(sliderIds[i]).setAttribute("max", max);
            document.getElementById(sliderIds[i]).setAttribute("step", step);
            document.getElementById(sliderIds[i]).setAttribute("value", defaultPriorities[i]);
            document.getElementById(sliderIds[i]).value = defaultPriorities[i];
        }
    }

}
function resetPriorities(){
    loadPriorities();
}
function calculateFleetPower(currentShipsRaw){
    let tempFP = 0;
    let tempAA = 0;
    let tempTRP = 0;
    let tempAVI = 0;
    let tempHP = 0;
    for (let i = 0; i < 3; i++) {
        if(currentShipsRaw[i] !== "empty"){
            tempFP += ships[parseInt(currentShipsRaw[i])].effectiveFirepower;
            tempAA += ships[parseInt(currentShipsRaw[i])].effectiveAntiAir;
            tempTRP += ships[parseInt(currentShipsRaw[i])].effectiveTorpedo;
            tempAVI += ships[parseInt(currentShipsRaw[i])].effectiveAviation;
            tempHP += ships[parseInt(currentShipsRaw[i])].effectiveHealth;
        }
    }
    document.getElementById("mainFirepower").innerHTML = Math.round(tempFP/FPModConst*100);
    document.getElementById("mainAntiAir").innerHTML = Math.round(tempAA/AAModConst*100);
    document.getElementById("mainTorpedo").innerHTML = Math.round(tempTRP/TRPModConst*100);
    document.getElementById("mainAviation").innerHTML = Math.round(tempAVI/AVIModConst*100);
    document.getElementById("mainHealth").innerHTML = Math.round(tempHP/eHPModConst*100);


    tempFP = 0;
    tempAA = 0;
    tempTRP = 0;
    tempAVI = 0;
    tempHP = 0;
    for (let i = 3; i < 6; i++) {
        if(currentShipsRaw[i] !== "empty"){
            tempFP += ships[parseInt(currentShipsRaw[i])].effectiveFirepower;
            tempAA += ships[parseInt(currentShipsRaw[i])].effectiveAntiAir;
            tempTRP += ships[parseInt(currentShipsRaw[i])].effectiveTorpedo;
            tempAVI += ships[parseInt(currentShipsRaw[i])].effectiveAviation;
            tempHP += ships[parseInt(currentShipsRaw[i])].effectiveHealth;
        }
    }
    document.getElementById("vanguardFirepower").innerHTML = Math.round(tempFP/FPModConst*100);
    document.getElementById("vanguardAntiAir").innerHTML = Math.round(tempAA/AAModConst*100);
    document.getElementById("vanguardTorpedo").innerHTML = Math.round(tempTRP/TRPModConst*100);
    document.getElementById("vanguardAviation").innerHTML = Math.round(tempAVI/AVIModConst*100);
    document.getElementById("vanguardHealth").innerHTML = Math.round(tempHP/eHPModConst*100);

}

function HTMLOptionInjection(id, arr) {
    let out = "";
    for (let i = 0; i < arr.length; i++) {
        out = out + "<option value=" + arr[i].replaceAll(" ", "") + ">" + arr[i] + "</option>";
    }
    document.getElementById(id).innerHTML = out;
}

function baseFilterInjection(){
    let filterIDs = ["showFaction", "shipRarity", "shipType"];

    let data = [[],[],[]];
    for (let j = 0; j < shipsOriginal.length; j++) {
        let add = true;
        for (let k = 0; k < data[0].length; k++) {
            if(shipsOriginal[j].nation === data[0][k]){
                add = false;
                break;
            }
        }
        if(add){
            data[0].push(shipsOriginal[j].nation);
        }
    }

    for (let j = 0; j < shipsOriginal.length; j++) {
        let add = true;
        for (let k = 0; k < data[1].length; k++) {
            if(shipsOriginal[j].rarity === data[1][k]){
                add = false;
                break;
            }
        }
        if(add){
            data[1].push(shipsOriginal[j].rarity);
        }
    }

    for (let j = 0; j < shipsOriginal.length; j++) {
        let add = true;
        for (let k = 0; k < data[2].length; k++) {
            if(shipsOriginal[j].type === data[2][k]){
                add = false;
                break;
            }
        }
        if(add){
            data[2].push(shipsOriginal[j].type);
        }
    }

    for (let i = 0; i < filterIDs.length; i++) {
        HTMLOptionInjection(filterIDs[i], data[i])
    }

    document.getElementById("filterMode").innerHTML = "<option value=" + "BlackList" + ">" + "Black list" + "</option><option value=" + "WhiteList" + ">" + "White list" + "</option>";
}

function readBaseFilter(){
    let filterIDs = ["filterMode","showFaction", "shipRarity", "shipType"];
    let out = Array(4);
    for (let i = 0; i < filterIDs.length; i++) {
        out[i] = $("#"+filterIDs[i]).val();
    }
    return out;
}

const buttonState = new Array(shipsOriginal.length);

function generateButtons(){
    for (let i = 0; i < buttonState.length; i++) {
        buttonState[i] = [0,1];
    }
    let out = "";

    for (let i = 0; i < shipsOriginal.length; i++) {
        //#6e21eb
        let buttonScriptConstructor = "buttonUpdate(" + i + ")";
        let buttonT = "<button class=\"btn btn-primary\" type=\"button\" style=\"background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;\" id=\"i"+ i +"\" onClick=\" " + buttonScriptConstructor + "\">" + "<img src=\"data:image/png;base64, " + shipsOriginal[i].thumbnail + "\" alt=\"Red dot\" />" + shipsOriginal[i].name + "</button>";
        out += buttonT;
    }
    document.getElementById("filterTable").innerHTML = out;
}

function buttonUpdate(i){ //!NOT REDUNDANT!
    if(buttonState[i][0] === 0){
        buttonState[i][0] = 1;
    }else{
        buttonState[i][0] = 0;
    }
    if(document.getElementById("i"+i).getAttribute("style") === "background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;"){
        document.getElementById("i"+i).setAttribute("style", "background-color: #FF40D3; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;");
    }else{
        document.getElementById("i"+i).setAttribute("style", "background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;");
    }
    filterReflection();
}

function hideShipsOnFilter(){
    let selected = readBaseFilter();

    for (let i = 0; i < shipsOriginal.length; i++) {
        let nationB;
        nationB = selected[1].length === 0;
        if(selected[0] === "BlackList" && nationB){
            nationB = false;
        }
        for (let j = 0; j < selected[1].length; j++) {
            if(shipsOriginal[i].nation.replaceAll(" ", "") === selected[1][j]){
                nationB = true;
            }
        }

        let rarityB;
        rarityB = selected[2].length === 0;
        if(selected[0] === "BlackList" && rarityB){
            rarityB = false;
        }
        for (let j = 0; j < selected[2].length; j++) {
            if(shipsOriginal[i].rarity.replaceAll(" ", "") === selected[2][j]){
                rarityB = true;
            }
        }

        let typeB;
        typeB = selected[3].length === 0;
        if(selected[0] === "BlackList" && typeB){
            typeB = false;
        }
        for (let j = 0; j < selected[3].length; j++) {
            if(shipsOriginal[i].type.replaceAll(" ", "") === selected[3][j]){
                typeB = true;
            }
        }

        buttonState[i][0] = 0;

        if(selected[0] === "BlackList"){
            if(nationB || rarityB || typeB){
                buttonState[i][1] = 0;
                document.getElementById("i"+i).setAttribute("style","display: none; background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;");
            }else{
                buttonState[i][1] = 1;
                document.getElementById("i"+i).setAttribute("style","background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;");
            }
        }else{
            if(nationB && rarityB && typeB){
                buttonState[i][1] = 1;
                document.getElementById("i"+i).setAttribute("style","background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;");
            }else{
                buttonState[i][1] = 0;
                document.getElementById("i"+i).setAttribute("style","display: none; background-color: #6e21eb; margin-bottom: 2px; margin-right: 2px; margin-left: 2px; float: left;");
            }
        }
    }

    filterReflection();
}

function filterReflection(){
    ships = [];
    for (let i = 0; i < shipsOriginal.length; i++) {
        if(buttonState[i][0] === 1){
            ships.push(shipsOriginal[i]);
        }
    }
    if (ships.length === 0){
        for (let i = 0; i < shipsOriginal.length; i++) {
            if(buttonState[i][1] === 1){
                ships.push(shipsOriginal[i]);
            }
        }
    }
    updateShips();
    clearFleet();
}

function resetFilter(){
    baseFilterInjection();
    generateButtons();
    filterReflection();
}