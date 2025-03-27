// App.js
import React from 'react';
import RentItem from './RentItem';
import ListItems from './ListItems';
import Signup from './signup';

const App = () => {
	return (
		<div>
			<h1>물건 대여 서비스</h1>
			<Signup />
			<RentItem />
			<ListItems />
		</div>
	);
};

export default App;
