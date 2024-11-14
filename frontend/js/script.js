function displayForm(show, hideOne, hideTwo, hideThree) {
	document.getElementsByClassName(show)[0].style.display = "block";
	document.getElementsByClassName(hideOne)[0].style.display = "none";
	document.getElementsByClassName(hideTwo)[0].style.display = "none";
	document.getElementsByClassName(hideThree)[0].style.display = "none";
}

function editName(e) {
	e.preventDefault();

	fetch("http://localhost:4000/update", {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			id: document.querySelector("#myForm input[name=id]").value,
			newName: document.querySelector("input[name=updatedName]").value,
		}),
	})
		.then((response) => response.json())
		.then(() => alert("Name Updated!"));

	document.getElementById("myForm").reset();
}

document.getElementById("myForm").addEventListener("submit", editName);



function deleteUser(e) {
	e.preventDefault();

	let deleteBox = document.querySelector("#delete-user input[name=id]");
	let deleteID = deleteBox.value;

	if (isNaN(deleteID) || deleteID.length == 0) {
		deleteBox.style.backgroundColor = "pink";
		deleteBox.style.border = "red 2px solid";
		// alert("Please enter number values only");
	} else {
		deleteBox.style.backgroundColor = "";
		deleteBox.style.border = "";

		fetch("http://localhost:4000/remove-user", {
			method: "DELETE",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				id: deleteID,
			}),
		}).then((response) => response.json());
		alert("User Deleted!");
		document.getElementById("delete-user").reset();
	}
}

document.getElementById("delete-user").addEventListener("submit", deleteUser);



function listCustomers() {
	const usersDiv = document.getElementById("data");
	fetch("http://localhost:4000/customers")
		.then((res) => res.json())
		.then((data) => {
			const usersDiv = document.getElementById('data');

			// Add a header for the list
			usersDiv.innerHTML = `<div class="row font-weight-bold mb-2">
            <div class="col-2">ID</div>
            <div class="col-4">Name</div>
            <div class="col-3">Address</div>
            <div class="col-3">Company</div>
        </div>
        <hr>`;

			data.forEach((customer, i) => {
				usersDiv.innerHTML += `
            <div class="row py-2 align-items-center border-bottom">
                <div class="col-2">${customer.id}</div>
                <div class="col-4">${customer.name}</div>
                <div class="col-3">${customer.address}</div>
                <div class="col-3">${customer.company}</div>
            </div>`;
			});
		});

}
document.getElementById("list").addEventListener("click", listCustomers);