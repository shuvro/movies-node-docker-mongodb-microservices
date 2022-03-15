const supertest = require('supertest');
const Movies = require('../models/movie');
const app = require('../src/index');

describe("Testing the movies API", () => {

    // Testing the Base endpoint
    it("tests the base route and returns true for status", async () => {
        const response = await supertest(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
    });

});
