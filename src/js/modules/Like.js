export default class Like {
	constructor() {
		this.likes = [];
	}
	
	addLike(id, title, author, img) {
		const like = { id, title, author, img };
		this.likes.push(like);
		
		// Luu tru du lieu data in LocalStorage
		this.persistData();
		
		return like;
	}
	
	deleteLike(id) {
		const index = this.likes.findIndex(el => el.id === id);
		
		this.likes.splice(index, 1);
		
		// Luu tru du lieu data in LocalStorage
		this.persistData();
	}
	
	isLike(id) {
		return this.likes.findIndex(el => el.id === id) !== -1 ;
	}
	
	getNumberLikes() {
		return this.likes.length;
	}
	
	persistData() {
		localStorage.setItem('Likes', JSON.stringify(this.likes));
	}
	
	readStorage() {
		const storage = JSON.parse(localStorage.getItem('Likes')); // Neu ko co gi thi tra ve null
		
		// Restoring like from the localStorage
		if (storage) this.likes = storage;
		
	}
}