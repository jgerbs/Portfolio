// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { time, timeStamp } from "console";

export const prisma = new PrismaClient();


// get user by ID
export function getUser(id) {
    return prisma.user.findUnique({
        where: { id: Number(id) }
    });
}

// get user by uname
export function getUserByUname(uname) {
    return prisma.user.findUnique({
        where: { uname }
    });
}

// create user
export function createUser(uname, password) {
    return prisma.user.create({
        data: { uname, password }
    });
}

// get subgroup by name
export async function getSubs() {
    const posts = await prisma.post.findMany({
        select: { subgroup: true }
    });

    return [...new Set(posts.map(p => p.subgroup))];
}

// create subgroup
export function createSub(name) {
    return prisma.sub.create({
        data: { name },
    });
}


// decorate a post
export async function decoratePost(post) {
    if (!post) return null;

    const [creator, votes, comments] = await Promise.all([
        prisma.user.findUnique({ where: { id: post.creator } }),
        prisma.vote.findMany({ where: { post_id: post.id } }),
        prisma.comment.findMany({
            where: { post_id: post.id },
            include: { author: true },
        }),
    ]);

    return {
        ...post,
        timestamp: Number(post.timestamp),
        creator,
        votes,
        voteTotal: votes.reduce((acc, v) => acc + v.value, 0),
        comments: comments.map(c => ({
            ...c,
            creator: c.author,
        })),
    };
}

// get N posts, optional subgroup filter
export async function getPosts(n = 5, sub) {
    const posts = await prisma.post.findMany({
        where: sub ? { subgroup: sub } : {},
        orderBy: { timestamp: "desc" },
        take: n,
    });

    return Promise.all(posts.map(p => decoratePost(p)));
}

// get single post by ID
export async function getPost(id) {
    const post = await prisma.post.findUnique({
        where: { id: Number(id) },
    });
    return decoratePost(post);
}

// add a new post
export async function addPost(title, link, creator, description, subgroup) {
    const post = await prisma.post.create({
        data: {
            title,
            link,
            description,
            creator: Number(creator),
            subgroup,
            timestamp: Date.now(),
        },
    });

    return decoratePost(post);
}

// edit a post
export function editPost(post_id, changes = {}) {
    return prisma.post.update({
        where: { id: Number(post_id) },
        data: changes,
    });
}

// delete a post
export async function deletePost(post_id) {
    const id = Number(post_id);

    // Delete votes for this post
    await prisma.vote.deleteMany({
        where: { post_id: id }
    });

    // Delete comments for this post
    await prisma.comment.deleteMany({
        where: { post_id: id }
    });

    // Delete the post
    return prisma.post.delete({
        where: { id }
    });
}

// get comment by ID
export function getCommentById(id) {
    return prisma.comment.findUnique({ where: { id: Number(id) } });
}

// add a comment to a post
export function addComment(post_id, creator, description) {
    return prisma.comment.create({
        data: {
            post_id: Number(post_id),
            creator: Number(creator),
            description,
            timestamp: Date.now(),
        },
    });
}

// delete a comment
export function deleteComment(id) {
    return prisma.comment.delete({
        where: { id: Number(id) },
    });
}

// set a vote
export async function setVote(user_id, post_id, value) {
    if (value === 0) {
        return prisma.vote.deleteMany({
            where: { user_id: Number(user_id), post_id: Number(post_id) },
        });
    }

    return prisma.vote.upsert({
        where: {
            user_id_post_id: {
                user_id: Number(user_id),
                post_id: Number(post_id),
            },
        },
        update: { value },
        create: {
            user_id: Number(user_id),
            post_id: Number(post_id),
            value,
        },
    });
}

// debug (optional)
export async function debug() {
    console.log("==== DB DEBUGGING ====");
    console.log("users", await prisma.user.findMany());
    console.log("posts", await prisma.post.findMany());
    console.log("comments", await prisma.comment.findMany());
    console.log("votes", await prisma.vote.findMany());
    console.log("==== DB DEBUGGING ====");
}
