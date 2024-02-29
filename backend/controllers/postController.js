// postController.js

// Dummy data array to simulate database documents
let posts = [];

// Get all posts
exports.getPosts = (req, res) => {
    res.status(200).json(posts);
};

// Create a new post
exports.createPost = (req, res) => {
    const newPost = {
        id: posts.length + 1,
        ...req.body,
    };
    posts.push(newPost);
    res.status(201).json(newPost);
};

// Update a post
exports.updatePost = (req, res) => {
    const { id } = req.params;
    let post = posts.find(post => post.id === parseInt(id));
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    post = { ...post, ...req.body };
    posts = posts.map(p => (p.id === parseInt(id) ? post : p));
    res.status(200).json(post);
};

// Delete a post
exports.deletePost = (req, res) => {
    const { id } = req.params;
    const postIndex = posts.findIndex(post => post.id === parseInt(id));
    if (postIndex === -1) {
        return res.status(404).json({ message: 'Post not found' });
    }

    posts = posts.filter(post => post.id !== parseInt(id));
    res.status(200).json({ message: 'Post deleted successfully' });
};
