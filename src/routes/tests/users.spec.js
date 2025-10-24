const usersroute = require("../users.js");

describe("route/user/", () => {
  // Test for the POST /create route
  it("should have expected `/create` post route", async () => {
    const path = "/create";
    const result = usersroute.stack.find((s) => s.route.path === path);

    // Ensure the route exists
    expect(result).not.toBeUndefined();
    // Check that the route path matches
    expect(result.route.path).toEqual(path);
    // Verify that the route method is POST
    expect(result.route.methods).toEqual({ post: true });
  });

  // Test for the GET /list route
  it("should have expected `/list` get route", async () => {
    const path = "/list";
    const result = usersroute.stack.find((s) => s.route.path === path);

    // Ensure the route exists
    expect(result).not.toBeUndefined();
    // Check that the route path matches
    expect(result.route.path).toEqual(path);
    // Verify that the route method is GET
    expect(result.route.methods).toEqual({ get: true });
  });

  // Test for the GET /:id route
  it("should have expected `/:id` get route", async () => {
    const path = "/getuser/:id";
    const result = usersroute.stack.find((s) => s.route.path === path && s.route.methods.get);

    // Ensure the route exists
    expect(result).not.toBeUndefined();
    // Check that the route path matches
    expect(result.route.path).toEqual(path);
    // Verify that the route method is GET
    expect(result.route.methods).toEqual({ get: true });
  });

  // Test for the DELETE /:id route
  it("should have expected `/delete/:id` get route", async () => {
    const path = "/delete/:id";
    const result = usersroute.stack.find(
      (s) => s.route && s.route.path === path && s.route.methods.get
    );
  
    // Ensure the route exists
    expect(result).not.toBeUndefined();
    // Check that the route path matches
    expect(result.route.path).toEqual(path);
    // Verify that the route method is GET
    expect(result.route.methods).toEqual({ get: true });
  });

  // Test for the POST /change_password route
  it("should have expected `/change_password` post route", async () => {
    const path = "/change_password";
    const result = usersroute.stack.find((s) => s.route.path === path && s.route.methods.post);

    // Ensure the route exists
    expect(result).not.toBeUndefined();
    // Check that the route path matches
    expect(result.route.path).toEqual(path);
    // Verify that the route method is POST
    expect(result.route.methods).toEqual({ post: true });
  });

  // Test for the POST /login route
  it("should have expected `/login` post route", async () => {
    const path = "/login";
    const result = usersroute.stack.find((s) => s.route.path === path && s.route.methods.post);

    // Ensure the route exists
    expect(result).not.toBeUndefined();
    // Check that the route path matches
    expect(result.route.path).toEqual(path);
    // Verify that the route method is POST
    expect(result.route.methods).toEqual({ post: true });
  });
});
