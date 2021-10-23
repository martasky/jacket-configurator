"use strict";

document.addEventListener("DOMContentLoaded", loadSvg);

let customImg = {
  collar: "white",
  top: "white",
  sleeveRight: "white",
  sleeveLeft: "white",
  rightSide: "white",
  leftSide: "white",
  rightSideTop: "white",
  leftSideTop: "white",
  pocket: "white",
  badges: {
    alien: false,
    egg: false,
    rose: false,
    starwars: false,
    yoda: false,
  },
};

let currentColor = "";

async function loadSvg() {
  let response = await fetch("jacket-config-01.svg");
  let mySvgData = await response.text();
  document.querySelector(".image").innerHTML = mySvgData;

  //click on badges

  document.querySelectorAll(".badge").forEach((badge) => {
    badge.addEventListener("click", clickBadge);
  });

  init();
}

function init() {
  const url = window.location.href;
  if (localStorage.length != 0) {
    // gets object settings from local storage
    let img = JSON.parse(localStorage.getItem("userCreation"));
    console.log("after parsing", img);
    applySavedImage(img);
  } else if (url.indexOf("jacket_settings") > -1) {
    // get url
    const urlParams = new URLSearchParams(window.location.search);
    const jacketParams = urlParams.get("jacket_settings");
    console.log("jacket params", jacketParams);
    const jacketObj = JSON.parse(urlParams.get("jacket_settings"));
    console.log("jacket obj", jacketObj);

    applySavedImage(jacketObj);
  } else {
    console.log("empty storage");
    // sets color to white at the beginning
    document.querySelectorAll("g").forEach((g) => {
      setColor(g, "white");
    });
    selectPart();
  }
  registerButtons();
}
function registerButtons() {
  const saveBtn = document.querySelector(".save");
  const resetBtn = document.querySelector(".reset");
  const shareBtn = document.querySelector(".share");
  saveBtn.addEventListener("click", saveImg);
  resetBtn.addEventListener("click", resetImg);
  shareBtn.addEventListener("click", shareImg);
}
function selectPart() {
  // makes each element of the jacket clickable
  document.querySelectorAll("g").forEach((g) => {
    g.addEventListener("click", (event) => {
      setColor(event.target, currentColor);
      // it stores the color value in the object so it can be reused after reload
      let property = event.target.parentElement.id;
      if (property != "badges") {
        customImg[property] = currentColor;
      }

      if (g.id === "top") {
        setColor(event.target.parentElement, currentColor);
      }
    });
  });

  // getting color from the squares
  document.querySelectorAll(".color").forEach((element, i) => {
    element.addEventListener("click", (event) => {
      currentColor = event.target.style.backgroundColor;

      console.log(currentColor);
      cursor.style.backgroundColor = currentColor;
    });
  });
  // creating stoke on each element on hover and remove when mouse is out
  document.querySelectorAll("g").forEach((g) => {
    g.addEventListener("mouseover", createStroke);
    g.addEventListener("mouseout", removeStroke);
  });
}

function setColor(element, colorString) {
  element.style.fill = colorString;
  cursor.style.backgroundColor = "transparent";
}

function clickBadge(event) {
  const target = event.currentTarget;
  const badge = target.dataset.badge;
  console.log("current badge", badge);

  if (customImg.badges[badge] === false) {
    customImg.badges[badge] = true;
  } else {
    customImg.badges[badge] = false;
  }

  if (customImg.badges[badge]) {
    console.log(`Badge ${badge} is turned on!`);
    document.querySelector(`[data-badge=${badge}]`).classList.remove("hide");
    document.querySelector("#selected").cloneNode(createBadgeElement(badge));
  } else {
    console.log(`${badge} is turned off!`);
    document.querySelector(`[data-badge=${badge}]`).classList.add("hide");
    removeElement(badge);
  }
}
function createBadgeElement(badge) {
  // const li = document.createElement("li");
  // li.dataset.badge = badge;
  const selected = document.querySelector("#selected");

  const image = document.createElement("img");
  image.id = `${badge}`;
  image.src = `badges/small_${badge}.png`;

  selected.append(image);

  //FLIP animation
  const firstFrame = document
    .querySelector(`.${badge}-badge`)
    .getBoundingClientRect();
  console.log("firstframe", firstFrame);

  const lastFrame = image.getBoundingClientRect();
  console.log("lastframe", lastFrame);

  //position calculation
  const deltaX = firstFrame.left - lastFrame.left;
  const deltaY = firstFrame.top - lastFrame.top;

  //scale calculation
  const deltaWidth = firstFrame.width / lastFrame.width;
  const deltaHeight = firstFrame.height / lastFrame.height;

  image.animate(
    [
      {
        transformOrigin: "center",
        transform: `translate(${deltaX}px, ${deltaY}px) 
        scale(0, 0)`,
      },
      { transformOrigin: "center", transform: "none" },
    ],
    {
      duration: 200,
      easing: "ease-in-out",
    }
  );

  return selected;
}
function removeElement(badge) {
  const element = document.getElementById(`${badge}`);
  console.log("what is this??!", element);
  element.remove();
}

let cursor = document.querySelector(".cursor");
document.body.addEventListener("mousemove", function (e) {
  (cursor.style.left = e.clientX + "px"), (cursor.style.top = e.clientY + "px");
});

function createStroke(e) {
  e.target.parentElement.classList.add("stroke");
}
function removeStroke(e) {
  e.target.parentElement.classList.remove("stroke");
}

function saveImg() {
  // modal box animations
  document
    .querySelector("#save_confirmation")
    .removeEventListener("animationend", removeAni);
  document.querySelector("#save_confirmation").classList.remove("hidden");
  document.querySelector("#save_confirmation").classList.add("fade");
  document
    .querySelector("#save_confirmation .x")
    .addEventListener("click", closeDialog);

  // saves object settings in local storage
  localStorage.setItem("userCreation", JSON.stringify(customImg));
}
function resetImg() {
  // resets settings to default dettings

  currentColor = "white";
  console.log("reset", customImg);
  for (let property in customImg) {
    if (property != "badges") {
      customImg[property] = currentColor;
    } else {
      for (let status in customImg.badges) {
        customImg.badges[status] = false;

        document.querySelector(`[data-badge=${status}]`).classList.add("hide");
        document.querySelector("#selected").innerHTML = "";
      }
    }
  }
  // resets image to default color
  document.querySelectorAll("g path").forEach((g) => {
    setColor(g, "white");
  });

  // removes object from local storage, if any
  if (localStorage.length != 0) {
    window.localStorage.removeItem("userCreation");
  }
  console.log("is reseted");
  console.log(customImg);
}

function shareImg() {
  // modal boxes
  document
    .querySelector("#share_confirmation")
    .removeEventListener("animationend", removeAni);
  document.querySelector("#share_confirmation").classList.remove("hidden");
  document.querySelector("#share_confirmation").classList.add("fade");
  document
    .querySelector("#share_confirmation .x")
    .addEventListener("click", closeDialog);

  // create link

  const myLink = `https://martaa.dk/jacket-configurator/index.html?jacket_settings=${JSON.stringify(
    customImg
  )}`;
  console.log("my link", myLink);

  document
    .querySelector("#share_confirmation p")
    .addEventListener("click", copyLink);

  function copyLink() {
    navigator.clipboard.writeText(myLink);
    document.querySelector("#share_confirmation p").textContent =
      "Link has been copied!";
  }
}

function closeDialog() {
  document
    .querySelector("#save_confirmation .x")
    .removeEventListener("click", closeDialog);
  document
    .querySelector("#share_confirmation .x")
    .removeEventListener("click", closeDialog);

  document.querySelector("#save_confirmation").classList.remove("fade");
  document.querySelector("#share_confirmation").classList.remove("fade");

  document.querySelector("#save_confirmation").classList.add("leave");
  document.querySelector("#share_confirmation").classList.add("leave");
  document
    .querySelector("#save_confirmation")
    .addEventListener("animationend", removeAni);

  document
    .querySelector("#share_confirmation")
    .addEventListener("animationend", removeAni);
  document.querySelector("#share_confirmation p").textContent =
    "Click to copy the link";
}
function removeAni() {
  document.querySelector("#save_confirmation").classList.add("hidden");
  document.querySelector("#share_confirmation").classList.add("hidden");
  document.querySelector("#save_confirmation").classList.remove("leave");
  document.querySelector("#share_confirmation").classList.remove("leave");
}
function applySavedImage(img) {
  // aplies image settings from local storage or the link
  customImg = img;
  console.log("after load", customImg);
  const colorProperties = Object.keys(customImg);
  colorProperties.forEach((key) => {
    console.log("what is customimg key", customImg[key]);
    document.querySelectorAll("g").forEach((g) => {
      if (g.id === key && key != "badges") {
        g.style.fill = customImg[key];
      }
    });

    for (let status in customImg.badges) {
      customImg.badges[status] = customImg.badges[status];
      if (customImg.badges[status]) {
        document
          .querySelector(`[data-badge=${status}]`)
          .classList.remove("hide");
      } else {
        document.querySelector(`[data-badge=${status}]`).classList.add("hide");
      }
    }
  });

  selectPart();
}
