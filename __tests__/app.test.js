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
    test("POST:201 should respond with a newly added topic", () => {
        const newTopic = {
            slug: "foxes",
            description: "Fluffy, cute and curious"
        };
        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(({ body }) => {
                expect(body.topic).toMatchObject(newTopic);
            });
    });
    test("POST:201 should respond with a newly added topic, ignoring unnecessary request properties", () => {
        const newTopic = {
            slug: "foxes",
            description: "Fluffy, cute and curious",
            another_property: "some other string",
            votes: 0
        };
        const expectedResponse = {
            slug: "foxes",
            description: "Fluffy, cute and curious",
        };
        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(({ body }) => {
                expect(body.topic).toMatchObject(expectedResponse);
            });
    });
    test("POST:400 should respond with an error if no slug in request", () => {
        const newTopic = {
            description: "Fluffy, cute and curious"
        };
        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("POST:400 should respond with an error if no description in request", () => {
        const newTopic = {
            slug: "foxes",
        };
        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
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
    test("GET:200 should respond with an articles array of article objects, with the correct properties and defaulted to ordering by date in descending order, limited to the default of the first 10", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toHaveLength(10);
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
    test("POST:201 should respond with a newly posted article object and all correct properties", () => {
        const expectedResponse = {
            article_id: 14,
            title: "Cutest cat begs for food",
            topic: "cats",
            author: "rogersop",
            body: "this is the body of the article, look at how cute this cat is!",
            votes: 0,
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 0
        };
        const newArticle ={
            author: "rogersop",
            title: "Cutest cat begs for food",
            body: "this is the body of the article, look at how cute this cat is!",
            topic: "cats",
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        };
        const timestamp = (new Date).toString()
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                expect(body.article).toMatchObject(expectedResponse);
                expect((new Date(body.article.created_at)).toString()).toBe(timestamp);
            })
    });
    test("POST:201 should respond with a newly posted article object, with a default article_img_url if non given", () => {
        const expectedUrl = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
        const newArticle ={
            author: "rogersop",
            title: "Cutest cat begs for food",
            body: "this is the body of the article, look at how cute this cat is!",
            topic: "cats",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                expect(body.article.article_img_url).toBe(expectedUrl);
            });
    });
    test("POST:404 should respond with an error if the username does not exist", () => {
        const newArticle ={
            author: "foxesrule20XX",
            title: "Cutest cat begs for food",
            body: "this is the body of the article, look at how cute this cat is!",
            topic: "cats",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("foxesrule20XX not found");
            });
    });
    test("POST:404 should respond with an error if the topic does not exist", () => {
        const newArticle ={
            author: "rogersop",
            title: "Cutest cat begs for food",
            body: "this is the body of the article, look at how cute this cat is!",
            topic: "dogs",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("dogs not found");
            });
    });
    test("POST:400 should respond with an error if the request is missing title", () => {
        const newArticle ={
            author: "rogersop",
            body: "this is the body of the article, look at how cute this cat is!",
            topic: "cats",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("POST:400 should respond with an error if the request is missing author", () => {
        const newArticle ={
            title: "Cutest cat begs for food",
            body: "this is the body of the article, look at how cute this cat is!",
            topic: "cats",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("POST:400 should respond with an error if the request is missing body", () => {
        const newArticle ={
            author: "rogersop",
            title: "Cutest cat begs for food",
            topic: "cats",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("POST:400 should respond with an error if the request is missing topic", () => {
        const newArticle ={
            author: "rogersop",
            title: "Cutest cat begs for food",
            body: "this is the body of the article, look at how cute this cat is!",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    describe("?topic=", () => {
        test("GET:200 should respond with an array of articles filtered by topic", () => {
            return request(app)
                .get("/api/articles?topic=mitch")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(12);
                    expect(body.articles).toHaveLength(10);
                    body.articles.forEach((article) => {
                        expect(article.topic).toBe("mitch");
                    });
                });
        });
        test("GET:200 should respond with an empty array if no articles exist for that topic", () => {
            return request(app)
                .get("/api/articles?topic=paper")
                .expect(200)
                .then(({ body }) => {
                    expect(body.articles).toEqual([]);
                });
        });
        test("GET:404 should respond with an error message if no topic exists", () => {
            return request(app)
                .get("/api/articles?topic=dogs")
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("dogs not found");
                });
        });
    });
    describe("?sort_by=", () => {
        test("GET:200 should respond with an array of all articles sorted by the requested column except for body or article_img_url, defaulted in descending order", () => {
            return request(app)
                .get("/api/articles?sort_by=author")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(10);
                    expect(body.articles).toBeSortedBy("author", { descending: true });
                });
        });
        test("GET:400 should respond with an error message when given an invalid query of a column that doesn't exist", () => {
            return request(app)
                .get("/api/articles?sort_by=foxes")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
        test("GET:400 should respond with an error message when given an invalid query of a column that does exist", () => {
            return request(app)
                .get("/api/articles?sort_by=body")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
    });
    describe("?order=", () => {
        test("desc GET:200 should respond with an array of articles sorted by created_at in descending order", () => {
            return request(app)
                .get("/api/articles?order=desc")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(10);
                    expect(body.articles).toBeSortedBy("created_at", { descending: true });
                });
        });
        test("asc GET:200 should respond with an array of articles sorted by created_at in ascending order", () => {
            return request(app)
                .get("/api/articles?order=asc")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(10);
                    expect(body.articles).toBeSortedBy("created_at", { descending: false });
                });
        });
        test("asc&sort_by=article_id GET:200 should respond with an array of articles sorted by article_id in ascending order", () => {
            return request(app)
                .get("/api/articles?order=asc&sort_by=article_id")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(10);
                    expect(body.articles).toBeSortedBy("article_id", { descending: false });
                });
        });
        test("GET:400 should respond with an error message when given an invalid query", () => {
            return request(app)
                .get("/api/articles?order=down")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
    });
    describe("?limit=", () => {
        test("GET:200 should respond with the first 10 articles (10 is the default)", ()=> {
            return request(app)
                .get("/api/articles?limit=10")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(10);
                });
        });
        test("GET:200 should respond with the first 5 articles", ()=> {
            return request(app)
                .get("/api/articles?limit=5")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(5);
                });
        });
        test("GET:400 should respond with an error if the limit is invalid", () => {
            return request(app)
                .get("/api/articles?limit=ten")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
    });
    describe("?p=", () => {
        test("GET:200 should respond with the first page (10 articles) as an array of articles", () => {
            return request(app)
                .get("/api/articles?p=1")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(10);
                });
        });
        test("GET:200 should respond with the second page as an array of articles", () => {
            return request(app)
                .get("/api/articles?p=2")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(3);
                });
        });
        test("GET:200 should respond with the 5th page of 2 articles if limit is 2", () => {
            return request(app)
                .get("/api/articles?p=5&limit=2")
                .expect(200)
                .then(({ body }) => {
                    expect(body.total_count).toBe(13);
                    expect(body.articles).toHaveLength(2);
                });
        });
        test("GET:400 should respond with an error if the page query is invalid", () => {
            return request(app)
                .get("/api/articles?p=twenty")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
        test("GET:404 should respond with an error if there is nothing on the selected page", () => {
            return request(app)
                .get("/api/articles?p=20")
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("articles not found");
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
    test("GET:200 should also respond with the correct comment count for the requested article", () => {
        return request(app)
            .get("/api/articles/3")
            .expect(200)
            .then(({ body }) => {
                expect(body.article.comment_count).toBe("2");
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
    test("PATCH:200 should respond with the article, with it's votes increased", () => {
        const voteChange = { inc_votes: 1 };
        const expectedArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 101,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
        return request(app)
            .patch("/api/articles/1")
            .send(voteChange)
            .expect(200)
            .then(({ body }) => {
                expect(body.article).toMatchObject(expectedArticle)
            });
    });
    test("PATCH:200 should respond with the article, with it's votes decreased, allows for negative votes", () => {
        const voteChange = { inc_votes: -150 };
        return request(app)
            .patch("/api/articles/1")
            .send(voteChange)
            .expect(200)
            .then(({ body }) => {
                expect(body.article.votes).toBe(-50);
            });
    });
    test("PATCH:400 should respond with an error if the article ID is invalid", () => {
        const voteChange = { inc_votes: 5 };
        return request(app)
            .patch("/api/articles/cows")
            .send(voteChange)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("PATCH:400 should respond with an error if the request body has no inc_votes", () => {
        const voteChange = { more_votes: 5 };
        return request(app)
            .patch("/api/articles/1")
            .send(voteChange)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("PATCH:400 should respond with an error if inc_votes is invalid", () => {
        const voteChange = { inc_votes: "five" };
        return request(app)
            .patch("/api/articles/1")
            .send(voteChange)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("PATCH:404 should respond with an error if the article doesn't exist", () => {
        const voteChange = { inc_votes: 5 };
        return request(app)
            .patch("/api/articles/30")
            .send(voteChange)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article not found");
            });
    });
    test("DELETE:204 should delete an article by article_id, including all of its comments", () => {
        return request(app)
            .delete("/api/articles/6")
            .expect(204)
            .then(() => {
                return db.query("SELECT * FROM articles WHERE article_id = 6");
            })
            .then(({ rows }) => {
                expect(rows).toHaveLength(0);
                return db.query("SELECT * FROM comments WHERE article_id = 6");
            })
            .then(({ rows }) => {
                expect(rows).toHaveLength(0);
            });
    });
    test("DELETE:404 should respond with an error if the article doesn't exist", () => {
        return request(app)
            .delete("/api/articles/50")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article not found");
            });
    });
    test("DELETE:400 should respond with an error if the article ID is invalid", () => {
        return request(app)
            .delete("/api/articles/bunnyrabbits")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
});

describe("/api/articles/:article_id/comments", () => {
    test("GET:200 should respond with an array of the first page of comments for the given article_id, 10 most recent first, with the correct properties", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                expect(comments).toHaveLength(10);
                expect(comments).toBeSortedBy("created_at", { descending: true });
                comments.forEach((comment) => {
                    expect(typeof comment.comment_id).toBe("number");
                    expect(typeof comment.votes).toBe("number");
                    expect(typeof comment.created_at).toBe("string");
                    expect(typeof comment.author).toBe("string");
                    expect(typeof comment.body).toBe("string");
                    expect(typeof comment.article_id).toBe("number");
                });
            });
    });
    test("GET:200 should respond with an empty array if the requested article exists, but has no comments", () => {
        return request(app)
            .get("/api/articles/8/comments")
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toEqual([]);
            });
    });
    test("GET:400 should respond with an error if the article ID is invalid", () => {
        return request(app)
            .get("/api/articles/soggy_socks/comments")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("GET:404 should respond with an error if the article doesn't exist", () => {
        return request(app)
            .get("/api/articles/99/comments")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article not found");
            });
    });
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
    test("POST:201 should respond with the posted comment, any unnecessary properties should be ignored", () => {
        const timestamp = (new Date).toString();
        const newComment = {
            username: 'icellusedkars',
            body: 'what a crazy comment I just left lol',
            votes: '50 million!'
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
    test("POST:404 should respond with an error message if the username doesn't exist", () => {
        const newComment = {
            username: 'foxesrule20XX',
            body: 'this is a totally unique comment'
        };
        return request(app)
            .post("/api/articles/2/comments")
            .send(newComment)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("foxesrule20XX not found");
            });
    });
    describe("?limit=", () => {
        test("GET:200 should respond with the first 10 comments (10 is the default)", () => {
            return request(app)
                .get("/api/articles/1/comments?limit=10")
                .expect(200)
                .then(({ body }) => {
                    expect(body.comments).toHaveLength(10);
                });
        });
        test("GET:200 should respond with the first 2 comments", () => {
            return request(app)
                .get("/api/articles/1/comments?limit=2")
                .expect(200)
                .then(({ body }) => {
                    expect(body.comments).toHaveLength(2);
                });
        });
        test("GET:400 should respond with an error if the query is invalid", () => {
            return request(app)
                .get("/api/articles/1/comments?limit=ten")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
    });
    describe("?p=", () => {
        test("GET:200 should respond with the first page of 10 comments", () => {
            const expectedMissingComment = {
                comment_id: 9,
                votes: 0,
                author: 'icellusedkars',
                body: 'Superficially charming',
                article_id: 1,
                created_at: "2020-01-01T03:08:00.000Z"
            };
            return request(app)
                .get("/api/articles/1/comments?p=1")
                .expect(200)
                .then(({ body }) => {
                    expect(body.comments).toHaveLength(10);
                    body.comments.forEach((comment) => {
                        expect(comment).not.toMatchObject(expectedMissingComment);
                    });
                });
        });
        test("GET:200 should respond with the second page of comments", () => {
            return request(app)
                .get("/api/articles/1/comments?p=2")
                .expect(200)
                .then(({ body }) => {
                    expect(body.comments).toHaveLength(1);
                });
        });
        test("GET:200 should respond with the 4th page of comments when limit is 2", () => {
            const expectedOne = {
                comment_id: 6,
                votes: 0,
                author: 'icellusedkars',
                body: 'I hate streaming eyes even more',
                article_id: 1,
                created_at: "2020-04-11T21:02:00.000Z"
            };
            const expectedTwo = {
                comment_id: 12,
                votes: 0,
                author: 'icellusedkars',
                body: 'Massive intercranial brain haemorrhage',
                article_id: 1,
                created_at: "2020-03-02T07:10:00.000Z"
            }
            return request(app)
                .get("/api/articles/1/comments?p=4&limit=2")
                .expect(200)
                .then(({ body }) => {
                    expect(body.comments).toHaveLength(2);
                    body.comments.forEach((comment, i) => {
                        if (i === 0) expect(comment).toMatchObject(expectedOne);
                        if (i === 1) expect(comment).toMatchObject(expectedTwo);
                    })
                });
        });
        test("GET:400 should respond with an error if the page query is invalid", () => {
            return request(app)
                .get("/api/articles/1/comments?p=twenty")
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe("bad request");
                });
        });
        test("GET:404 should respond with an error if there is nothing on the selected page", () => {
            return request(app)
                .get("/api/articles/1/comments?p=20")
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe("comments not found");
                });
        });
    });
});

describe("/api/comments/:comment_id", () => {
    test("DELETE:204 should delete the given comment by ID", () => {
        return request(app)
            .delete("/api/comments/3")
            .expect(204)
            .then(() => {
                return db.query(`SELECT * FROM comments;`)
            })
            .then(({ rows }) => {
                expect(rows).toHaveLength(17);
            });
    });
    test("DELETE:400 should respond with an error if the comment ID is invalid", () => {
        return request(app)
            .delete("/api/comments/milkshake")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("DELETE:404 should respond with an error if the comment doesn't exist", () => {
        return request(app)
            .delete("/api/comments/70")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("comment not found");
            });
    });
    test("PATCH:200 should respond with the comment object with its votes increased", () => {
        const voteChange = { inc_votes: 5 };
        const expectedResponse = {
            comment_id: 7,
            votes: 5,
            author: 'icellusedkars',
            body: 'Lobster pot',
            article_id: 1,
            created_at: "2020-05-15T20:19:00.000Z"
        };
        return request(app)
            .patch("/api/comments/7")
            .send(voteChange)
            .expect(200)
            .then(({ body }) => {
                expect(body.comment).toMatchObject(expectedResponse)
            });
    });
    test("PATCH:200 should respond with the comment object with its votes decreased, allowing for negative vote count", () => {
        const voteChange = { inc_votes: -50 };
        const expectedVotes = -50;
        return request(app)
            .patch("/api/comments/7")
            .send(voteChange)
            .expect(200)
            .then(({ body }) => {
                expect(body.comment.votes).toBe(expectedVotes);
            });
    });
    test("PATCH:200 should respond correctly, ignoring unnecessary request properties", () => {
        const voteChange = { inc_votes: -50, update_body: "this is the new comment I'm making" };
        const expectedResponse = {
            comment_id: 7,
            votes: -50,
            author: 'icellusedkars',
            body: 'Lobster pot',
            article_id: 1,
            created_at: "2020-05-15T20:19:00.000Z"
        };
        return request(app)
            .patch("/api/comments/7")
            .send(voteChange)
            .expect(200)
            .then(({ body }) => {
                expect(body.comment).toMatchObject(expectedResponse);
            });
    });
    test("PATCH:404 should respond with an error if the comment doesn't exist", () => {
        const voteChange = { inc_votes: 1 };
        return request(app)
            .patch("/api/comments/95")
            .send(voteChange)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("comment not found");
            });
    });
    test("PATCH:400 should respond with an error if the comment id is invalid", () => {
        const voteChange = { inc_votes: 1 };
        return request(app)
            .patch("/api/comments/fifteen")
            .send(voteChange)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("PATCH:400 should respond with an error if the request body doesn't contain inc_votes", () => {
        const voteChange = { change_votes: 1 };
        return request(app)
            .patch("/api/comments/2")
            .send(voteChange)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
    test("PATCH:400 should respond with an error if the inc_votes is an invalid data type", () => {
        const voteChange = { inc_votes: "fifty" };
        return request(app)
            .patch("/api/comments/2")
            .send(voteChange)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("bad request");
            });
    });
});

describe("/api/users", () => {
    test("GET:200 should respond with an array of user objects, with the exected properties", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
                const { users } = body;
                expect(users).toHaveLength(4);
                users.forEach((user) => {
                    expect(typeof user.username).toBe("string");
                    expect(typeof user.name).toBe("string");
                    expect(typeof user.avatar_url).toBe("string");
                });
            });
    });
});

describe("/api/users/:username", () => {
    test("GET:200 should respond with a user object by username with the correct properties", () => {
        const expectedResponse = {
            username: "rogersop",
            name: "paul",
            avatar_url: "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4"
        };
        return request(app)
            .get("/api/users/rogersop")
            .expect(200)
            .then(({ body }) => {
                expect(body.user).toMatchObject(expectedResponse);
            });
    });
    test("GET:404 should resond with an error if the user does not exist",() => {
        return request(app)
            .get("/api/users/taiga")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("user not found");
            });
    });
});