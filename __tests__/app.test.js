const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const endpoints = require("../endpoints.json");

beforeEach(() => {
    return seed(testData);
});
afterAll(() => {
    db.end();
});

describe("/api/topics", () => {
    test("GET:200 should respond with an array of topic objects with slug and description properties", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                const { topics } = body;
                expect(topics).toHaveLength(3);
                topics.forEach((topic) => {
                    expect(typeof topic.slug).toBe("string");
                    expect(typeof topic.description).toBe("string");
                });
            });
    });
    test("GET:404 should respond with an appropriate message if an incorrect endpoint path is submitted", () => {
        return request(app)
            .get("/api/silly-fish")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("path not found");
            });
    });
});

describe("/api", () => {
    test("GET:200 responds with an object describing all the available endpoints", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => {
                expect(body.api).toEqual(endpoints);
            });
    });
});

describe("/api/articles", () => {
    test("GET:200 should respond with an articles array of article objects, with the correct properties and defaulted to ordering by date in descending order", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toHaveLength(13);
                expect(articles).toBeSortedBy("created_at", { descending: true });
                articles.forEach((article) => {
                    expect(typeof article.author).toBe("string");
                    expect(typeof article.title).toBe("string");
                    expect(typeof article.article_id).toBe("number");
                    expect(typeof article.topic).toBe("string");
                    expect(typeof article.created_at).toBe("string");
                    expect(typeof article.votes).toBe("number");
                    expect(typeof article.article_img_url).toBe("string");
                    expect(typeof article.comment_count).toBe("string");
                    expect(typeof article.body).toBe("undefined");
                    if (article.article_id === 1) {
                        expect(article.comment_count).toBe("11");
                    }
                });
            });
    });
});

describe("/api/articles/:article_id", () => {
    test("GET:200 should respond with the correct article object", () => {
        const expectedArticle = {
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          }
        return request(app)
            .get("/api/articles/3")
            .expect(200)
            .then(({ body }) => {
                expect(body.article).toMatchObject(expectedArticle);
            });
    });
    test("GET:400 should respond with an error message if an invalid id is requested", () => {
        return request(app)
            .get("/api/articles/chickens")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("GET:404 should respond with an error message if an article doesn't exist", () => {
        return request(app)
            .get("/api/articles/30")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article not found");
            });
    });
});

describe("/api/articles/:article_id/comments", () => {
    test("POST:201 should respond with the posted comment", () => {
        const timestamp = (new Date).toString();
        const newComment = {
            username: 'icellusedkars',
            body: 'what a crazy comment I just left lol'
        };
        const expectedResponse = {
            comment_id: 19,
            votes: 0,
            author: 'icellusedkars',
            body: 'what a crazy comment I just left lol',
            article_id: 2
        }
        return request(app)
            .post("/api/articles/2/comments")
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
                expect(body.comment).toMatchObject(expectedResponse);
                expect(new Date(body.comment.created_at).toString()).toBe(timestamp);
            });
    });
    // invalid article_id
    test("POST:400 should respond with an error message if an invalid id is sent to", () => {
        const newComment = {
            username: 'icellusedkars',
            body: 'what a crazy comment I just left lol'
        };
        return request(app)
            .post("/api/articles/lillypads/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    // invalid request body
    test("POST:400 should respond with an error message if an invalid body is sent", () => {
        const newComment = {
            body: 'what a crazy comment I just left lol'
        };
        return request(app)
            .post("/api/articles/2/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    // article doesn't exist
    test("POST:404 should respond with an error message if the article doesn't exist", () => {
        const newComment = {
            username: 'icellusedkars',
            body: 'what a crazy comment I just left lol'
        };
        return request(app)
            .post("/api/articles/99/comments")
            .send(newComment)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article not found");
            });
    });

});
