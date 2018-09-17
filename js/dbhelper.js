/**
 * Common database helper functions.
 */
class DBHelper {

	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_URL() {
		const port = 1337 // Change this to your server port
		return `http://localhost:${port}/restaurants`;
	}

	/**
	 * Local IDB Database
	 */

	static createLocalIDB(restaurants) {
		// Check for IDB compatibility
		if (!('indexedDB' in window)) {
			console.log('No IndexedDB support on your Browser. Please, consider updating to a new one');
			return;
		}

		let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

		//Create or open IDB database
		let open = indexedDB.open("RestaurantsDB", 1);

		open.onupgradeneeded = function() {
			let db = open.result;
			let store = db.createObjectStore("RestaurantStore", { keyPath: "id" });
			let index = store.createIndex("by-id", "id");
		  };

		open.onerror = function(err) {
			console.error("Oops! An error with IndexedDB was found: " + err.target.errorCode);
		}

		open.onsuccess = function() {
			let db = open.result;
			let tx = db.transaction("RestaurantStore", "readwrite");
			let store = tx.objectStore("RestaurantStore");
			let index = store.index("by-id");

			restaurants.forEach(function(restaurant) {
				store.put(restaurant);
			});

			//When transaction is done, close the database
			tx.oncomplete = function() {
				db.close();
			};
		}
	}

	static getCachedData(callback) {
		let restaurants = [];
		let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
		let open = indexedDB.open('RestaurantsDB', 1);

		open.onsuccess = () => {
			let db = open.result;
			let tx = db.transaction('RestaurantStore', 'readwrite');
			let store = tx.objectStore('RestaurantStore');
			let getData = store.getAll();

			getData.onsuccess = () => {
				callback(null, getData.result);
			}

			//When transaction is done, close the database
			tx.oncomplete = () => {
				db.close();
			};
		}
	}

	/**
	 * Fetch all restaurants.
	 */
	static fetchRestaurants(callback) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', DBHelper.DATABASE_URL);
		xhr.onload = () => {
			if (xhr.status === 200) {
				// Got a success response from server!
				const restaurants = JSON.parse(xhr.responseText);
				// Add the data to our database
				DBHelper.createLocalIDB(restaurants);
				//creating IDB

				callback(null, restaurants);
			} else {
				// Oops!. Got an error from server.
				const error = (`Request failed. Returned status of ${xhr.status}`);
				callback(error, null);
			}
		};

		xhr.onerror = () => {
			DBHelper.getCachedData((error, restaurants) => {
				if (restaurants.length > 0) {
					console.log("Unable to fetch server data. Don't worry tho, we will use cache data!");

					callback(null, restaurants);
				}
			});
		}

		xhr.send();
	}

	/**
	 * Fetch a restaurant by its ID.
	 */
	static fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				const restaurant = restaurants.find(r => r.id == id);
				if (restaurant) { // Got the restaurant
					callback(null, restaurant);
				} else { // Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 */
	static fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter(r => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 */
	static fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(r => r.neighborhood == neighborhood);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants
				if (cuisine != 'all') { // filter by cuisine
					results = results.filter(r => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') { // filter by neighborhood
					results = results.filter(r => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	static fetchNeighborhoods(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
				callback(null, uniqueNeighborhoods);
			}
		});
	}

	/**
	 * Fetch all cuisines with proper error handling.
	 */
	static fetchCuisines(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
				callback(null, uniqueCuisines);
			}
		});
	}

	/**
	 * Restaurant page URL.
	 */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
	 * Restaurant image URL.
	 */
	static imageUrlForRestaurant(restaurant) {
		if (restaurant.photograph) {
			return (`/img/${restaurant.photograph}.jpg`);
		} else {
			return (`/img/fallback.jpg`);
		}
	}

  /**
  * Restaurant name.
  * Helps with accessibility alt text
  */
  static imageNameForRestaurant(restaurant) {
    return (`${restaurant.name}`);
  }

	/**
	 * Map marker for a restaurant.
	 */
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP
		});
		return marker;
	}

	static toggleFavorite(restaurant, isFavorite) {
			fetch(`${DBHelper.DATABASE_URL}/restaurants/${restaurant.id}/?is_favorite=${isFavorite}`, {
				method: 'PUT'
			})
			.then(response => {
				return response.json();
			})
			.then(data => {
				DBHelper.dbPromise.then(db => {
					if (!db) return;
					const tx = db.transaction('all-restaurants', 'readwrite');
					const store = tx.objectStore('all-restaurants');
					store.put(data)
				});
				return data;
			})
			.catch(error => {
				restaurant.is_favorite = isFavorite;
				DBHelper.dbPromise.then(db => {
					if (!db) return;
					const tx = db.transaction('all-restaurants', 'readwrite');
					const store = tx.objectStore('all-restaurants');
					store.put(restaurant);
				}).catch(error => {
					console.log(error);
					return;
				});
			});
		}

}
