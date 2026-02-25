const express = require('express');
const router = express.Router();
const { Circle, User, Post, Comment, Like } = require('../models');

// --- Circles ---

// Get all circles
router.get('/circles', async (req, res) => {
    try {
        const circles = await Circle.findAll({
            include: [{
                model: User,
                as: 'Members',
                attributes: ['id', 'name', 'avatar'],
                through: { attributes: [] }
            }]
        });
        res.json(circles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a circle
router.post('/circles', async (req, res) => {
    try {
        console.log('Incoming circle creation request:', req.body);
        const { name, description, icon, color, userId } = req.body;
        const circle = await Circle.create({
            name,
            description: description || '',
            icon: icon || 'Users',
            color: color || 'bg-primary/20',
            createdBy: userId
        });

        // Automatically join the creator to the circle
        if (userId) {
            const user = await User.findByPk(userId);
            if (user) {
                await user.addJoinedCircle(circle);
            }
        }

        // Fetch circle with members to return
        const fullCircle = await Circle.findByPk(circle.id, {
            include: [{
                model: User,
                as: 'Members',
                attributes: ['id', 'name', 'avatar'],
                through: { attributes: [] }
            }]
        });

        console.log('Circle created successfully:', circle.id);
        res.status(201).json(fullCircle);
    } catch (error) {
        console.error('Error creating circle:', error);
        res.status(500).json({ error: error.message });
    }
});

// Join a circle
router.post('/circles/:id/join', async (req, res) => {
    try {
        const circle = await Circle.findByPk(req.params.id);
        const { userId } = req.body;
        const user = await User.findByPk(userId);

        if (!circle || !user) {
            return res.status(404).json({ error: 'Circle or User not found' });
        }

        await user.addJoinedCircle(circle);
        res.json({ message: 'Joined circle successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leave a circle
router.post('/circles/:id/leave', async (req, res) => {
    try {
        const circle = await Circle.findByPk(req.params.id);
        const { userId } = req.body;
        const user = await User.findByPk(userId);

        if (!circle || !user) {
            return res.status(404).json({ error: 'Circle or User not found' });
        }

        await user.removeJoinedCircle(circle);
        res.json({ message: 'Left circle successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Posts ---

// Get all posts with comments and likes
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'avatar', 'role']
                },
                {
                    model: Circle,
                    attributes: ['id', 'name', 'color']
                },
                {
                    model: Comment,
                    include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
                },
                {
                    model: Like,
                    attributes: ['userId']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a post
router.post('/posts', async (req, res) => {
    try {
        console.log('Incoming post creation request:', req.body);
        const { content, category, userId, circleId } = req.body;

        if (!userId) {
            console.error('Missing userId in post creation');
            return res.status(400).json({ error: 'User ID is required' });
        }

        const post = await Post.create({
            content,
            category,
            userId,
            circleId: circleId || null
        });

        // Fetch the post with associations to return it
        const fullPost = await Post.findByPk(post.id, {
            include: [
                { model: User, attributes: ['id', 'name', 'avatar', 'role'] },
                { model: Circle, attributes: ['id', 'name', 'color'] },
                { model: Comment, include: [{ model: User, attributes: ['id', 'name', 'avatar'] }] },
                { model: Like, attributes: ['userId'] }
            ]
        });

        console.log('Post created successfully:', post.id);
        res.status(201).json(fullPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle like
router.post('/posts/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const postId = req.params.id;

        const existingLike = await Like.findOne({ where: { userId, postId } });

        if (existingLike) {
            await existingLike.destroy();
            res.json({ message: 'Post unliked', liked: false });
        } else {
            await Like.create({ userId, postId });
            res.json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Comments ---

// Add a comment
router.post('/comments', async (req, res) => {
    try {
        const { content, userId, postId } = req.body;
        const comment = await Comment.create({ content, userId, postId });

        const fullComment = await Comment.findByPk(comment.id, {
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
        });

        res.status(201).json(fullComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a post
router.delete('/posts/:id', async (req, res) => {
    try {
        const { userId } = req.body; // In a real app, this would come from the auth token
        const post = await Post.findByPk(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Only allow the creator to delete the post
        if (post.userId !== userId) {
            // Check if user is admin (optional, depends on requirement)
            const user = await User.findByPk(userId);
            if (user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized to delete this post' });
            }
        }

        await post.destroy();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
