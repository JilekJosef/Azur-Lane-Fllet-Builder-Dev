let autoModeBool = true;

//highest values for main fleet
let eHPMainModConst = 0;
let FPMainModConst = 0;
let TRPMainModConst = 0;
let AAMainModConst = 0;
let AVIMainModConst = 0;
//highest values for vanguard
let eHPVanModConst = 0;
let FPVanModConst = 0;
let TRPVanModConst = 0;
let AAVanModConst = 0;
let AVIVanModConst = 0;

//control panel
let eHPMultiplier = 0.0;
let burstDamageFear = 1.2; // 1 mean low, 2 mean high

let FPMultiplier = 0.0;
let TRPMultiplier = 0.0;
let AVIMultiplier = 0.0;
let AAMultiplier = 0.0;
let factionPriority = 0.5;
let connectionsPriority = 0.5;

const sliderIds = ["suvivabilitySlider", "burstSurvivabilitySlider", "firepowerSlider", "torpedoSlider", "aviationSlider", "antiAirSlider", "SameFactionSlider", "SynergySlider"];
const defaultPriorities = [eHPMultiplier,burstDamageFear,FPMultiplier,TRPMultiplier,AVIMultiplier,AAMultiplier,factionPriority,connectionsPriority]

let currentAccuracyGlobal = 0;
let currentLuckGlobal = 0;

const fleetIDSGlobal = ["flagship","side1","side2","mainTank","protected","offTank"];

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
            this.effectiveHealth = (parseInt(health)+1060)/(Math.min(1, Math.max(0.1, (0.1 + currentAccuracyGlobal/(currentAccuracyGlobal+parseInt(evasion)+2) + ((currentLuckGlobal - parseInt(luck))/1000))))); // + 1060 health 2 repair toolboxes, needed for maintain accurate calc
        }else if(type === "CB" || type === "CA" || type === "CL"){
            this.effectiveHealth = (parseInt(health)+602)/(Math.min(1, Math.max(0.1, (0.1 + currentAccuracyGlobal/(currentAccuracyGlobal+parseInt(evasion)+2) + ((currentLuckGlobal - parseInt(luck)+49)/1000))))); // 1 repair toolbox + Improved Hydraulic Rudder (washing machine)
        }else{
            this.effectiveHealth = (parseInt(health))/(Math.min(1, Math.max(0.1, (0.1 + currentAccuracyGlobal/(currentAccuracyGlobal+parseInt(evasion)+2) + ((currentLuckGlobal - parseInt(luck))/1000)))));
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
            this.effectiveHealth = (parseInt(this.health)+1060)/(Math.min(1, Math.max(0.1, (0.1 + currentAccuracyGlobal/(currentAccuracyGlobal+parseInt(this.evasion)+2) + ((currentLuckGlobal - parseInt(this.luck))/1000))))); // + 1060 health 2 repair toolboxes, needed for maintain accurate calc
        }else if(this.type === "CB" || this.type === "CA" || this.type === "CL"){
            this.effectiveHealth = (parseInt(this.health)+602)/(Math.min(1, Math.max(0.1, (0.1 + currentAccuracyGlobal/(currentAccuracyGlobal+parseInt(this.evasion)+2) + ((currentLuckGlobal - parseInt(this.luck)+49)/1000))))); // 1 repair toolbox + Improved Hydraulic Rudder (washing machine)
        }else{
            this.effectiveHealth = (parseInt(this.health))/(Math.min(1, Math.max(0.1, (0.1 + currentAccuracyGlobal/(currentAccuracyGlobal+parseInt(this.evasion)+2) + ((currentLuckGlobal - parseInt(this.luck))/1000)))));
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
    if(ships[i-1].fleetPart === "Main"){
        if(ships[i-1].effectiveHealth > eHPMainModConst){
            eHPMainModConst = ships[i-1].effectiveHealth;
        }
        if(ships[i-1].effectiveFirepower > FPMainModConst){
            FPMainModConst = ships[i-1].effectiveFirepower;
        }
        if(ships[i-1].effectiveTorpedo > TRPMainModConst){
            TRPMainModConst = ships[i-1].effectiveTorpedo;
        }
        if(ships[i-1].effectiveAviation > AVIMainModConst){
            AVIMainModConst = ships[i-1].effectiveAviation;
        }
        if(ships[i-1].effectiveAntiAir > AAMainModConst){
            AAMainModConst = ships[i-1].effectiveAntiAir;
        }
    }
    if(ships[i-1].fleetPart === "Vanguard"){
        if(ships[i-1].effectiveHealth > eHPVanModConst){
            eHPVanModConst = ships[i-1].effectiveHealth;
        }
        if(ships[i-1].effectiveFirepower > FPVanModConst){
            FPVanModConst = ships[i-1].effectiveFirepower;
        }
        if(ships[i-1].effectiveTorpedo > TRPVanModConst){
            TRPVanModConst = ships[i-1].effectiveTorpedo;
        }
        if(ships[i-1].effectiveAviation > AVIVanModConst){
            AVIVanModConst = ships[i-1].effectiveAviation;
        }
        if(ships[i-1].effectiveAntiAir > AAVanModConst){
            AAVanModConst = ships[i-1].effectiveAntiAir;
        }
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

function updateEHPs(ships) {
    for (let i = 0; i < ships.length; i++) {
        ships[i].updateEHP();
        if(ships[i].fleetPart === "Main") {
            if (ships[i].effectiveHealth > eHPMainModConst) {
                eHPMainModConst = ships[i].effectiveHealth;
            }
        }
        if(ships[i].fleetPart === "Vanguard") {
            if (ships[i].effectiveHealth > eHPVanModConst) {
                eHPVanModConst = ships[i].effectiveHealth;
            }
        }
    }
}

function recommendedShips(ships){
    for (let i = 0; i < ships.length; i++) {
        if(ships[i].recommended !== ""){
            temp = ships[i].recommended.split(";");
            let isPaired = false;
            for (let l = 0; l < ships[i].special.length; l++) {
                if(ships[i].special[l] === "paired"){
                    isPaired = true;
                    break;
                }
            }
            for (let j = 0; j < temp.length; j++) {
                for (let k = 0; k < ships.length; k++) {
                    if(ships[k].name === temp[j]||ships[k].type === temp[j]||ships[k].nation === temp[j] || temp[j] === ships[k].nation + " " + ships[k].type){
                        if(isPaired){
                            ships[i].recommendedShips.push([ships[k].name, 1]);
                        }else{
                            ships[i].recommendedShips.push([ships[k].name, 0.1]);
                        }
                    }
                }
                for (let k = 0; k < shipClasses.length; k++) {
                    if(shipClasses[k][0]===temp[j]){
                        for (let l = 1; l < shipClasses[k].length; l++) {
                            if(isPaired){
                                ships[i].recommendedShips.push([ships[k].name, 1]);
                            }else{
                                ships[i].recommendedShips.push([ships[k].name, 0.1]);
                            }
                        }
                    }
                }
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
    /*//purify connections
    connections = Array.from(new Set(connections));*/

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
        if(ships[shipsRated[i][0]] === "Main"){
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveAviation/AVIMainModConst*AVIMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveAntiAir/AAMainModConst*AAMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveTorpedo/TRPMainModConst*TRPMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveFirepower/FPMainModConst*FPMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveHealth/eHPMainModConst*eHPMultiplier*constantMultiplier;
        }
        if(ships[shipsRated[i][0]] === "Vanguard"){
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveAviation/AVIVanModConst*AVIMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveAntiAir/AAVanModConst*AAMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveTorpedo/TRPVanModConst*TRPMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveFirepower/FPVanModConst*FPMultiplier*constantMultiplier;
            shipsRated[i][1] += - ships[shipsRated[i][0]].effectiveHealth/eHPVanModConst*eHPMultiplier*constantMultiplier;
        }


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

function checkSpecial(attribute, shipIndex){
    let isSpecial = false;
    for (let o = 0; o < ships[shipIndex].special.length; o++) {
        if(ships[shipIndex].special[o] === attribute){
            isSpecial = true;
        }
    }
    return isSpecial;
}

/*function shipSortAuto(ships, connectionsPriority, factionPriority, currentShips){
    resetPriorities();
    let temp = getFactionsAndConnections(currentShips);
    let factions = temp[0];
    let connections = temp[1];

    let fleetFocus = $("#fleetFocus").val();
    let fleetType = $("#fleetType").val();
    let AAPriority =$("#AAFocus").is(":checked");
    let sameFaction =$("#SameFactionCheck").is(":checked");
    let includeCollabs =$("#includeCollabs").is(":checked");

    let flagship = recommendedShipsForPosition("flagship", "Main");
    let side = recommendedShipsForPosition("side", "Main");

    let mainTank = recommendedShipsForPosition("mainTank", "Vanguard");
    let protectedS = recommendedShipsForPosition("protected", "Vanguard");
    let offTank = recommendedShipsForPosition("offTank", "Vanguard");

    let bestFleet = []
    let bestFleetRatingSum = 100;
    for (let i = 0; i < Math.min(flagship.length, 20); i++) {
        for (let j = 0; j < Math.min(side.length, 20); j++) {
            for (let k = 0; k < Math.min(side.length, 20); k++) {
                for (let l = 0; l < Math.min(mainTank.length, 20); l++) {
                    for (let m = 0; m < Math.min(protectedS.length, 20); m++) {
                        for (let n = 0; n < Math.min(offTank.length, 20); n++) {
                            if(ships[flagship[i][0]].name !== ships[side[j][0]].name && ships[flagship[i][0]].name !== ships[side[k][0]].name && ships[side[j][0]].name !== ships[side[k][0]].name && ships[mainTank[l][0]].name !== ships[protectedS[m][0]].name && ships[mainTank[l][0]].name !== ships[offTank[n][0]].name && ships[protectedS[m][0]].name !== ships[offTank[n][0]].name){
                                let tierSum = 0//parseInt(ships[flagship[i][0]].tier) + parseInt(ships[side[j][0]].tier) + parseInt(ships[side[k][0]].tier) + parseInt(ships[mainTank[l][0]].tier) + parseInt(ships[protectedS[m][0]].tier + parseInt(ships[offTank[n][0]].tier));
                                let fleetFocusRating = 0;
                                let fleetTypeRating = 0;
                                let fleetAARating = 0;

                                let mobArmament = 0;
                                if(ships[mainTank[l][0]].slot1.includes("DD") || ships[mainTank[l][0]].slot1.includes("CL") || ships[mainTank[l][0]].slot1.includes("Torpedoes")){
                                    mobArmament++;
                                }
                                if(ships[mainTank[l][0]].slot2.includes("DD") || ships[mainTank[l][0]].slot2.includes("CL") || ships[mainTank[l][0]].slot2.includes("Torpedoes")){
                                    mobArmament++;
                                }
                                if(ships[mainTank[l][0]].slot3.includes("DD") || ships[mainTank[l][0]].slot3.includes("CL") || ships[mainTank[l][0]].slot3.includes("Torpedoes")){
                                    mobArmament++;
                                }

                                let flagshipIsFlag = false;
                                for (let o = 0; o < ships[flagship[i][0]].special.length; o++) {
                                    if(ships[flagship[i][0]].special[o] === "flag"){
                                        flagshipIsFlag = true;
                                    }
                                }
                                let side1IsFlag = false;
                                for (let o = 0; o < ships[side[j][0]].special.length; o++) {
                                    if(ships[side[j][0]].special[o] === "flag"){
                                        side1IsFlag = true;
                                    }
                                }let side2IsFlag = false;
                                for (let o = 0; o < ships[side[k][0]].special.length; o++) {
                                    if(ships[side[k][0]].special[o] === "flag"){
                                        side2IsFlag = true;
                                    }
                                }
                                //healer count
                                let healerCount = 0;
                                {
                                    if(checkSpecial("healer", flagship[i][0])){
                                        healerCount++;
                                    }
                                    if(checkSpecial("healer", side[j][0])){
                                        healerCount++;
                                    }
                                    if(checkSpecial("healer", side[k][0])){
                                        healerCount++;
                                    }
                                    if(checkSpecial("healer", mainTank[l][0])){
                                        healerCount++;
                                    }
                                    if(checkSpecial("healer", protectedS[m][0])){
                                        healerCount++;
                                    }
                                    if(checkSpecial("healer", offTank[n][0])){
                                        healerCount++;
                                    }
                                }


                                if(fleetFocus === "Mob"){
                                    //tank
                                    fleetFocusRating += -(Math.min(0.5, ships[mainTank[l][0]].effectiveHealth/eHPVanModConst)+Math.min(0.5, (ships[mainTank[l][0]].effectiveFirepower/FPVanModConst + ships[mainTank[l][0]].effectiveTorpedo/TRPVanModConst)));
                                    //protected
                                    fleetFocusRating += -(ships[protectedS[m][0]].effectiveFirepower/FPVanModConst + ships[protectedS[m][0]].effectiveTorpedo/TRPVanModConst);
                                    //off tank
                                    fleetFocusRating += -(Math.min(0.2, ships[offTank[n][0]].effectiveHealth/eHPVanModConst)+(ships[offTank[n][0]].effectiveFirepower/FPVanModConst + ships[offTank[n][0]].effectiveTorpedo/TRPVanModConst));
                                    //flagship
                                    if(flagshipIsFlag) {
                                        fleetFocusRating += -1;
                                    }else {
                                        fleetFocusRating += -Math.min(1, ships[flagship[i][0]].effectiveHealth / eHPMainModConst)
                                    }
                                    //side
                                    if(!side1IsFlag && !side2IsFlag) {
                                        fleetFocusRating += -3;
                                    }
                                    //healer
                                    if(healerCount === 1){
                                        fleetFocusRating += -1;
                                    }else if(healerCount > 1){
                                        fleetFocusRating += +3;
                                    }
                                }else if(fleetFocus === "Boss"){
                                    //main tank
                                    fleetFocusRating += - ships[mainTank[l][0]].effectiveHealth/eHPVanModConst
                                    //protected
                                    fleetFocusRating += -(ships[protectedS[m][0]].effectiveFirepower/FPVanModConst + ships[protectedS[m][0]].effectiveTorpedo/TRPVanModConst);
                                    //off tank
                                    fleetFocusRating += -(Math.min(1, ships[offTank[n][0]].effectiveHealth/eHPVanModConst)+Math.min(0.5,(ships[offTank[n][0]].effectiveFirepower/FPVanModConst + ships[offTank[n][0]].effectiveTorpedo/TRPVanModConst)))
                                    //flag
                                    if(flagshipIsFlag) {
                                        fleetFocusRating += -1;
                                    }else {
                                        fleetFocusRating += -Math.min(1, ships[flagship[i][0]].effectiveHealth / eHPMainModConst)
                                    }
                                    //side
                                    if(!side1IsFlag && !side2IsFlag) {
                                        fleetFocusRating += -3;
                                    }
                                    //healer
                                    if(healerCount > 0){
                                        fleetFocusRating += +1;
                                    }
                                }else{//Universal
                                    //tank
                                    fleetFocusRating += -(Math.min(0.7, ships[mainTank[l][0]].effectiveHealth/eHPVanModConst)+Math.min(0.5, (ships[mainTank[l][0]].effectiveFirepower/FPVanModConst + ships[mainTank[l][0]].effectiveTorpedo/TRPVanModConst)));
                                    //protected
                                    fleetFocusRating += -(ships[protectedS[m][0]].effectiveFirepower/FPVanModConst + ships[protectedS[m][0]].effectiveTorpedo/TRPVanModConst);
                                    //off tank
                                    fleetFocusRating += -(Math.min(0.4, ships[offTank[n][0]].effectiveHealth/eHPVanModConst)+(ships[offTank[n][0]].effectiveFirepower/FPVanModConst + ships[offTank[n][0]].effectiveTorpedo/TRPVanModConst));
                                    //flagship
                                    if(flagshipIsFlag) {
                                        fleetFocusRating += -1;
                                    }else {
                                        fleetFocusRating += -Math.min(1, ships[flagship[i][0]].effectiveHealth / eHPMainModConst)
                                    }
                                    //side
                                    if(!side1IsFlag && !side2IsFlag) {
                                        fleetFocusRating += -3;
                                    }
                                    //healer
                                    if(healerCount === 1){
                                        fleetFocusRating += -1;
                                    }else if(healerCount > 1){
                                        fleetFocusRating += +3;
                                    }
                                }

                                if(fleetType === "Standard"){
                                    //flagship
                                    if(ships[flagship[i][0]].type === "BB" || ships[flagship[i][0]].type === "BC" || ships[flagship[i][0]].type === "BBV" || ships[flagship[i][0]].type === "BM"){
                                        fleetTypeRating += -1;
                                    }
                                    //side
                                    if(ships[side[j][0]].type === "CV" || ships[side[j][0]].type === "CVL"){
                                        fleetTypeRating += -1;
                                    }
                                    if(ships[side[k][0]].type === "CV" || ships[side[k][0]].type === "CVL"){
                                        fleetTypeRating += -1;
                                    }
                                }else if(fleetType === "BB/BC"){
                                    if(ships[flagship[i][0]].type === "BB" || ships[flagship[i][0]].type === "BC" || ships[flagship[i][0]].type === "BBV" || ships[flagship[i][0]].type === "BM"){
                                        fleetTypeRating += -1;
                                    }
                                    if(ships[side[j][0]].type === "BB" || ships[side[j][0]].type === "BC" || ships[side[j][0]].type === "BBV"){
                                        fleetTypeRating += -1;
                                    }
                                    if(ships[side[k][0]].type === "BB" || ships[side[k][0]].type === "BC" || ships[side[k][0]].type === "BBV"){
                                        fleetTypeRating += -1;
                                    }
                                }else{ //CV/CVL
                                    if(ships[flagship[i][0]].type === "CV" || ships[flagship[i][0]].type === "CVL"){
                                        fleetTypeRating += -1;
                                    }
                                    if(ships[side[j][0]].type === "CV" || ships[side[j][0]].type === "CVL"){
                                        fleetTypeRating += -1;
                                    }
                                    if(ships[side[k][0]].type === "CV" || ships[side[k][0]].type === "CVL"){
                                        fleetTypeRating += -1;
                                    }
                                }

                                if(AAPriority){
                                    fleetAARating += -ships[flagship[i][0]].effectiveAntiAir/AVIMainModConst;
                                    fleetAARating += -ships[side[j][0]].effectiveAntiAir/AVIMainModConst;
                                    fleetAARating += -ships[side[k][0]].effectiveAntiAir/AVIMainModConst;

                                    fleetAARating += -ships[mainTank[l][0]].effectiveAntiAir/AVIVanModConst;
                                    fleetAARating += -ships[protectedS[m][0]].effectiveAntiAir/AVIVanModConst;
                                    fleetAARating += -ships[offTank[n][0]].effectiveAntiAir/AVIVanModConst;
                                }

                                //evaluation
                                if(tierSum + fleetFocusRating + fleetTypeRating + fleetAARating < bestFleetRatingSum){
                                    bestFleetRatingSum = tierSum + fleetFocusRating + fleetTypeRating + fleetAARating;
                                    bestFleet = [flagship[i], side[j], side[k], mainTank[l], protectedS[m], offTank[n]];
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return bestFleet;
}*/

function mobDamageEvaluator(ship){
    let out = 0;

    if (ship.slot1.includes("DD") || ship.slot1.includes("CL")){
        out += ship.effectiveFirepower/FPVanModConst;
    }else if (ship.slot2.includes("DD") || ship.slot2.includes("CL")){
        out += ship.effectiveFirepower/FPVanModConst;
    }else if (ship.slot3.includes("DD") || ship.slot3.includes("CL")){
        out += ship.effectiveFirepower/FPVanModConst;
    }
    if (ship.slot1.includes("Torpedoes")){
        out += ship.effectiveTorpedo/TRPVanModConst * 0.8;
    }else if (ship.slot2.includes("Torpedoes")){
        out += ship.effectiveTorpedo/TRPVanModConst * 0.8;
    }else if (ship.slot3.includes("Torpedoes")){
        out += ship.effectiveTorpedo/TRPVanModConst * 0.8;
    }
    return out;
}

function shipSortAuto(shipFocus,mainOrVan,currentShips){

    let fleetFocus = $("#fleetFocus").val();
    let fleetType = $("#fleetType").val();
    let AAPriority =$("#AAFocus").is(":checked");
    let includeCollabs =$("#includeCollabs").is(":checked");
    let sameFactionPriority =$("#sameFactionCheck").is(":checked");

    temp = getFactionsAndConnections(currentShips);
    let factions = temp[0];
    let connections = temp[1];

    //search specific
    let BBCount = 0;
    let CVCount = 0;
    let healerCount = 0;
    for (let i = 0; i < currentShips.length; i++) {
        if(ships[currentShips[i]].type === "BB" || ships[currentShips[i]].type === "BC" || ships[currentShips[i]].type === "BBV"){
            BBCount++;
        }
        if(ships[currentShips[i]].type === "CV" || ships[currentShips[i]].type === "CVL"){
            CVCount++;
        }
        for (let j = 0; j < ships[currentShips[i]].special.length; j++) {
            if(ships[currentShips[i]].special[j] === "healer"){
                healerCount++;
                break;
            }
        }
    }

    let shipsRated = [];
    for (let i = 0; i < ships.length; i++) {
        shipsRated.push([i, parseInt(ships[i].tier)/2]); //parseInt(ships[i].tier)
        if(fleetFocus === "Mob"){
            if(shipFocus === "mainTank"){
                shipsRated[i][1] += -Math.min(0.6, ships[i].effectiveHealth/eHPVanModConst);
                shipsRated[i][1] += -mobDamageEvaluator(ships[shipsRated[i][0]]);
            }else if(shipFocus === "protected"){
                shipsRated[i][1] += -mobDamageEvaluator(ships[shipsRated[i][0]]);
            }else if(shipFocus === "offTank"){
                shipsRated[i][1] += -Math.min(0.35, ships[i].effectiveHealth/eHPVanModConst);
                shipsRated[i][1] += -mobDamageEvaluator(ships[shipsRated[i][0]]);
            }else if(shipFocus === "flagship"){
                let isFlag = false;
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "flag"){
                        isFlag = true;
                    }
                }
                if(isFlag){
                    shipsRated[i][1] += -1;
                }/*else{
                    shipsRated[i][1] += -Math.min(0.6, ships[i].effectiveHealth/eHPMainModConst)/2;
                }*/
            }else{ //side
                let isFlag = false;
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "flag"){
                        isFlag = true;
                    }
                }
                if(isFlag){
                    shipsRated[i][1] += +1;
                }
            }
            //healers
            let isHealer = false;
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "healer"){
                    isHealer = true;
                }
            }
            if(healerCount >= 1 && isHealer){
                shipsRated[i][1] += +1.5;
            }
            if(healerCount < 1 && isHealer){
                shipsRated[i][1] += -1;
            }
        }else if(fleetFocus === "Boss"){
            if(shipFocus === "mainTank"){
                shipsRated[i][1] += -ships[i].effectiveHealth/eHPVanModConst;
                if(parseInt(ships[i].health) > 4500){
                    shipsRated[i][1] += -1.5;
                }
            }else if(shipFocus === "protected"){
                shipsRated[i][1] += -mobDamageEvaluator(ships[shipsRated[i][0]]);
            }else if(shipFocus === "offTank"){
                shipsRated[i][1] += -Math.min(0.8, ships[i].effectiveHealth/eHPVanModConst)//(Math.min(0.8, ships[i].effectiveHealth/eHPVanModConst)+(ships[i].effectiveFirepower/FPVanModConst)/2 + (ships[i].effectiveTorpedo/TRPVanModConst)/2);
                if(parseInt(ships[i].health) > 4000){
                    shipsRated[i][1] += -1.5;
                }
            }else if(shipFocus === "flagship"){
                let isFlag = false;
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "flag"){
                        isFlag = true;
                    }
                }
                if(isFlag){
                    shipsRated[i][1] += -1;
                }/*else{
                    shipsRated[i][1] += -Math.min(1, ships[i].effectiveHealth/eHPMainModConst)/2;
                }*/
            }else{ //side
                let isFlag = false;
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "flag"){
                        isFlag = true;
                    }
                }
                if(isFlag){
                    shipsRated[i][1] += +1;
                }
            }
            //healers
            let isHealer = false;
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "healer"){
                    isHealer = true;
                }
            }
            if(isHealer){
                shipsRated[i][1] += +0.5;
            }
        }else{//Universal
            if(shipFocus === "mainTank"){
                shipsRated[i][1] += -Math.min(0.7, ships[i].effectiveHealth/eHPVanModConst);
                shipsRated[i][1] += -mobDamageEvaluator(ships[shipsRated[i][0]]);
            }else if(shipFocus === "protected"){
                shipsRated[i][1] += -mobDamageEvaluator(ships[shipsRated[i][0]]);
            }else if(shipFocus === "offTank"){
                shipsRated[i][1] += -(Math.min(0.7, ships[i].effectiveHealth/eHPVanModConst)+Math.min(1.5,(ships[i].effectiveFirepower/FPVanModConst + ships[i].effectiveTorpedo/TRPVanModConst)));
            }else if(shipFocus === "flagship"){
                let isFlag = false;
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "flag"){
                        isFlag = true;
                    }
                }
                if(isFlag){
                    shipsRated[i][1] += -1;
                }/*else{
                    shipsRated[i][1] += -Math.min(1, ships[i].effectiveHealth/eHPMainModConst)/2;
                }*/
            }else{ //side
                let isFlag = false;
                for (let j = 0; j < ships[i].special.length; j++) {
                    if(ships[i].special[j] === "flag"){
                        isFlag = true;
                    }
                }
                if(isFlag){
                    shipsRated[i][1] += +1;
                }
            }
            //healers
            let isHealer = false;
            for (let j = 0; j < ships[i].special.length; j++) {
                if(ships[i].special[j] === "healer"){
                    isHealer = true;
                }
            }
            if(healerCount >= 1 && isHealer){
                shipsRated[i][1] += +1.5;
            }
            if(healerCount < 1 && isHealer){
                shipsRated[i][1] += -1;
            }
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

        //AA priority
        if(AAPriority){
            if(mainOrVan === "Main"){
                shipsRated[i][1] += -ships[i].effectiveAntiAir/AVIMainModConst;
            }else{
                shipsRated[i][1] += -ships[i].effectiveAntiAir/AVIVanModConst;
            }
        }
        //connections
        for (let j = 0; j < connections.length; j++) {
            if(connections[j][0] === ships[i].name){
                if(connections[j][1] === 1){
                    shipsRated[i][1] += -2;
                    break;
                }else{
                    shipsRated[i][1] += -connections[j][1];
                    break;
                }
            }
        }
        //factions
        if(sameFactionPriority){
            for (let j = 0; j < factions.length; j++) {
                if(factions[j] === ships[i].nation){
                    shipsRated[i][1] += -4;
                    break;
                }
            }
        }

    }
    temp = [];
    for (let i = 0; i < shipsRated.length; i++) {
        if(ships[shipsRated[i][0]].fleetPart === mainOrVan){
            if((includeCollabs || (ships[shipsRated[i][0]].nation === "Eagle Union" || ships[shipsRated[i][0]].nation === "Dragon Empery" || ships[shipsRated[i][0]].nation === "Royal Navy" || ships[shipsRated[i][0]].nation === "Sakura Empire" || ships[shipsRated[i][0]].nation === "Iron Blood" || ships[shipsRated[i][0]].nation === "Northern Parliament" || ships[shipsRated[i][0]].nation === "Iris Libre" || ships[shipsRated[i][0]].nation === "Sardegna Empire" || ships[shipsRated[i][0]].nation === "META"))){
                temp.push(shipsRated[i]);
            }
        }
    }
    shipsRated = temp;

    shipsRated = shipsSorter2D(shipsRated);

    return shipsRated;
}

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
    let currentShips = [];
    for (let i = 0; i < fleetIDSGlobal.length; i++) {
        temp = $("#" + fleetIDSGlobal[i] +" :selected").val();
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
        updateShipsAuto();
    }else{
        let fleetType = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"];
        for (let i = 0; i < fleetIDSGlobal.length; i++) {
            let shipsSorted = shipSort(ships,fleetType[i],connectionsPriority,factionPriority,currentShips,fleetIDSGlobal[i],eHPMultiplier,TRPMultiplier,FPMultiplier,AVIMultiplier,AAMultiplier);
            HTMLInjection(fleetIDSGlobal[i], prepareToHTMLInjection(shipsSorted,currentShipsRaw,i), currentShipsRaw[i]);
        }
    }
    currentShipsRaw = getCurrentShips();
    calculateFleetPower(currentShipsRaw);
}

function updateShipsAuto(){
    let fleetFocus = $("#fleetFocus").val();
    if(fleetFocus === "Boss"){
        currentAccuracyGlobal = 170;
        currentLuckGlobal = 50;
    }else if(fleetFocus === "Mob"){
        currentAccuracyGlobal = 80;
        currentLuckGlobal = 50;
    }else{
        currentAccuracyGlobal = 120;
        currentLuckGlobal = 50;
    }
    updateEHPs(ships);


    let currentShipsRaw = getCurrentShips();
    let currentShips = purifyRawCurrentShips(currentShipsRaw);

    let mainOrVan = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"]
    for (let i = 0; i < fleetIDSGlobal.length; i++) {
        let shipsSorted = shipSortAuto(fleetIDSGlobal[i], mainOrVan[i], currentShips);
        HTMLInjection(fleetIDSGlobal[i], prepareToHTMLInjection(shipsSorted,currentShipsRaw,i), currentShipsRaw[i]);
        currentShipsRaw = getCurrentShips();
        currentShips = purifyRawCurrentShips(currentShipsRaw);
    }

    currentShipsRaw = getCurrentShips();
    calculateFleetPower(currentShipsRaw);
}


//initial page config
document.addEventListener("DOMContentLoaded", function (){
    let fleetFocus = $("#fleetFocus").val();
    if(fleetFocus === "Boss"){
        currentAccuracyGlobal = 370;
        currentLuckGlobal = 50;
    }else if(fleetFocus === "Mob"){
        currentAccuracyGlobal = 80;
        currentLuckGlobal = 50;
    }else{
        currentAccuracyGlobal = 120;
        currentLuckGlobal = 50;
    }
    updateEHPs(ships);
    //$("#showFaction").multiSelect();
    //select multiple 127px
    //label screenshot
    baseFilterInjection();
    generateButtons();
    loadPriorities();
    initializeAutoPriorities();
    /*let ids = ["flagship","side1","side2","mainTank","protected","offTank"];
    for (let i = 0; i < ids.length; i++) {
        HTMLInjection(ids[i], new Array(0), "empty");
    }*/

    if(autoModeBool){
        let mainOrVan = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"]
        for (let i = 0; i < fleetIDSGlobal.length; i++) {
            let shipsSorted = shipSortAuto(fleetIDSGlobal[i], mainOrVan[i], []);
            HTMLInjection(fleetIDSGlobal[i], prepareToHTMLInjection(shipsSorted,[],i), "empty");
        }
    }else{
        let fleetType = ["Main","Main","Main","Vanguard","Vanguard","Vanguard"];
        for (let i = 0; i < fleetIDSGlobal.length; i++) {
            let shipsSorted = shipSort(ships,fleetType[i],connectionsPriority,factionPriority,[],fleetIDSGlobal[i],eHPMultiplier,TRPMultiplier,FPMultiplier,AVIMultiplier,AAMultiplier);
            HTMLInjection(fleetIDSGlobal[i], prepareToHTMLInjection(shipsSorted,[],i), "empty");
        }
    }
    let currentShipsRaw = getCurrentShips();
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
        document.getElementById("manualSwitch").innerHTML = "Switch to advanced";
    }else{
        document.getElementById("manualSwitch").innerHTML = "Switch to simple";
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
        updateEHPs(ships); //TODO shipsOriginal?
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
    for (let i = 0; i < 6; i++) {
        document.getElementById(fleetIDSGlobal[i]).value = "empty";
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
    document.getElementById("mainFirepower").innerHTML = Math.round(tempFP/FPMainModConst*100);
    document.getElementById("mainAntiAir").innerHTML = Math.round(tempAA/AAMainModConst*100);
    document.getElementById("mainTorpedo").innerHTML = Math.round(tempTRP/TRPMainModConst*100);
    document.getElementById("mainAviation").innerHTML = Math.round(tempAVI/AVIMainModConst*100);
    document.getElementById("mainHealth").innerHTML = Math.round(tempHP/eHPMainModConst*100);


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
    document.getElementById("vanguardFirepower").innerHTML = Math.round(tempFP/FPVanModConst*100);
    document.getElementById("vanguardAntiAir").innerHTML = Math.round(tempAA/AAVanModConst*100);
    document.getElementById("vanguardTorpedo").innerHTML = Math.round(tempTRP/TRPVanModConst*100);
    document.getElementById("vanguardAviation").innerHTML = Math.round(tempAVI/AVIVanModConst*100);
    document.getElementById("vanguardHealth").innerHTML = Math.round(tempHP/eHPVanModConst*100);

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
    clearFleet();
    updateShips();
}

function resetFilter(){
    baseFilterInjection();
    generateButtons();
    filterReflection();
}