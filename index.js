// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "2607-FTB-CT-WEB-PT"; // 
const API = BASE + COHORT;


// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];


// === Data Fetching ===

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}


/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}


/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}


/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}


// === Components ===

/** Form to create a new party */
function CreatePartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name:
      <input name="name" required />
    </label>
    <label>
      Description:
      <textarea name="description" required></textarea>
    </label>
    <label>
      Date:
      <input type="date" name="date" required />
    </label>
    <label>
      Location:
      <input name="location" required />
    </label>
    <button type="submit">Create Party</button>
  `;

  $form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Convert date to ISO string as required by the API
    const dateFromForm = formData.get("date");
    const isoDate = new Date(dateFromForm).toISOString();
    
    const newParty = {
      name: formData.get("name"),
      description: formData.get("description"),
      date: isoDate,
      location: formData.get("location"),
    };

    try {
      const response = await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create party");
      }
      
      await getParties(); // Refresh the party list
      e.target.reset(); // Clear the form
    } catch (error) {
      console.error("Failed to create party:", error);
      alert("Failed to create party. Please try again.");
    }
  });

  return $form;
}


/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `<a href="#selected">${party.name}</a>`;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}


/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}


/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <button id="delete-party">Delete Party</button>
    <div id="guest-list"></div>
  `;

  // Add delete functionality
  $party.querySelector("#delete-party").addEventListener("click", async () => {
    if (!confirm(`Are you sure you want to delete "${selectedParty.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(API + "/events/" + selectedParty.id, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete party");
      }
      
      selectedParty = null; // Clear selection
      await getParties(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete party:", error);
      alert("Failed to delete party. Please try again.");
    }
  });

  $party.querySelector("#guest-list").replaceWith(GuestList());

  return $party;
}


/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  
  if (!selectedParty) {
    return $ul;
  }

  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}


// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner Admin</h1>
    <main>
      <section>
        <h2>Create New Party</h2>
        <div id="create-party-form"></div>
      </section>
      <section>
        <h2>Upcoming Parties</h2>
        <div id="party-list"></div>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <div id="selected-party"></div>
      </section>
    </main>
  `;

  document.getElementById("create-party-form").replaceWith(CreatePartyForm());
  document.getElementById("party-list").replaceWith(PartyList());
  document.getElementById("selected-party").replaceWith(SelectedParty());
}


// === Init ===
async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}


init();

