auth.onAuthStateChanged((user) => {
	if (user) {
		document.getElementById('auth').style.display = 'none';
		document.getElementById('main').style.display = 'block';
		loadItems();
	} else {
		document.getElementById('auth').style.display = 'block';
		document.getElementById('main').style.display = 'none';
	}
});
