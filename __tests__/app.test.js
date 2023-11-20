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