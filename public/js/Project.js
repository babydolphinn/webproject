// This fulfills the requirement for ES6 Classes
class Project {
    constructor(data) {
        this._id = data._id;
        this.title = data.title;
        this.category = data.category;
        this.shortDescription = data.shortDescription;
        this.fullDescription = data.fullDescription;
        this.experience = data.experience;
    }

    // A helper method to make the category uppercase for the UI
    getFormattedCategory() {
        return this.category.toUpperCase();
    }

    // A helper method to limit the description length on the Home page
    getSnippet() {
        return this.shortDescription.length > 50 
            ? this.shortDescription.substring(0, 50) + "..." 
            : this.shortDescription;
    }
}
module.exports = Project;

// Export for use in the project (if using modern JS)
// module.exports = Project;