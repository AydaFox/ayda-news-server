const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");

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
                expect(body.article).toEqual(expectedArticle);
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