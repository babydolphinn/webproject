class ProjectRenderer {
    constructor(project) {
        this.project = project;
    }

    // This method creates the HTML for a single card on the Home page
    renderCard() {
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${this.project.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${this.project.category}</h6>
                        <p class="card-text">${this.project.shortDescription}</p>
                        <a href="/project/${this.project._id}" class="btn btn-primary w-100">View Details</a>
                    </div>
                </div>
            </div>`;
    }
}