import { assertEquals, assertExists } from "jsr:@std/assert";
import { parseCode } from "./parseCode.ts";
import { join } from "@std/path";

// Helper: write a temp file, run parseCode, delete it
async function parseSnippet(ext: string, code: string) {
  const tmp = await Deno.makeTempFile({ suffix: ext });
  await Deno.writeTextFile(tmp, code);
  try {
    return await parseCode({ filePath: tmp });
  } finally {
    await Deno.remove(tmp);
  }
}

// ── JavaScript / TypeScript ───────────────────

Deno.test("parseCode: detects exported TS function", async () => {
  const result = await parseSnippet(
    ".ts",
    `export async function fetchData(url: string): Promise<string> {\n  return "";\n}`
  );
  assertEquals(result.elements.length >= 1, true);
  const fn = result.elements.find((e) => e.name === "fetchData");
  assertExists(fn, "fetchData should be detected");
  assertEquals(fn!.type, "function");
});

Deno.test("parseCode: detects TS class and interface", async () => {
  const result = await parseSnippet(
    ".ts",
    `export interface Animal { name: string; }\nexport class Dog implements Animal { name = "dog"; }`
  );
  const cls = result.elements.find((e) => e.name === "Dog");
  const iface = result.elements.find((e) => e.name === "Animal");
  assertExists(cls, "Dog class should be detected");
  assertEquals(cls!.type, "class");
  assertExists(iface, "Animal interface should be detected");
  assertEquals(iface!.type, "interface");
});

Deno.test("parseCode: detects arrow function assigned to const", async () => {
  const result = await parseSnippet(
    ".js",
    `const greet = (name) => \`Hello \${name}\`;\n`
  );
  const fn = result.elements.find((e) => e.name === "greet");
  assertExists(fn, "greet should be detected as a function");
  assertEquals(fn!.type, "function");
});

Deno.test("parseCode: detects Express router routes", async () => {
  const result = await parseSnippet(
    ".js",
    `router.get('/users', handler);\nrouter.post('/users', createUser);\n`
  );
  const getRoute = result.elements.find((e) => e.name === "GET /users");
  const postRoute = result.elements.find((e) => e.name === "POST /users");
  assertExists(getRoute, "GET /users route should be detected");
  assertEquals(getRoute!.type, "route");
  assertExists(postRoute, "POST /users route should be detected");
});

Deno.test("parseCode: detects TS type alias", async () => {
  const result = await parseSnippet(".ts", `export type UserId = string;\n`);
  const t = result.elements.find((e) => e.name === "UserId");
  assertExists(t, "UserId type should be detected");
  assertEquals(t!.type, "type");
});

// ── Python ────────────────────────────────────

Deno.test("parseCode: detects Python def and class", async () => {
  const result = await parseSnippet(
    ".py",
    `class Animal:\n    pass\n\ndef greet(name):\n    return f"Hello {name}"\n\nasync def fetch(url):\n    pass\n`
  );
  const cls = result.elements.find((e) => e.name === "Animal");
  const fn = result.elements.find((e) => e.name === "greet");
  const asyncFn = result.elements.find((e) => e.name === "fetch");
  assertExists(cls, "Animal class should be detected");
  assertEquals(cls!.type, "class");
  assertExists(fn, "greet function should be detected");
  assertEquals(fn!.type, "function");
  assertExists(asyncFn, "async fetch function should be detected");
  assertEquals(asyncFn!.type, "function");
});

// ── Java ──────────────────────────────────────

Deno.test("parseCode: detects Java class and methods", async () => {
  const result = await parseSnippet(
    ".java",
    `public class UserService {\n  public void createUser(String name) {}\n  private static int countUsers() { return 0; }\n}\n`
  );
  const cls = result.elements.find((e) => e.name === "UserService");
  const method = result.elements.find((e) => e.name === "createUser");
  assertExists(cls, "UserService class should be detected");
  assertEquals(cls!.type, "class");
  assertExists(method, "createUser method should be detected");
  assertEquals(method!.type, "function");
});

Deno.test("parseCode: detects Java interface", async () => {
  const result = await parseSnippet(
    ".java",
    `public interface Repository {\n  void save(Object o);\n}\n`
  );
  const iface = result.elements.find((e) => e.name === "Repository");
  assertExists(iface, "Repository interface should be detected");
  assertEquals(iface!.type, "interface");
});

// ── Go ────────────────────────────────────────

Deno.test("parseCode: detects Go functions and types", async () => {
  const result = await parseSnippet(
    ".go",
    `package main\n\nfunc main() {}\n\nfunc Add(a, b int) int { return a + b }\n\ntype User struct {\n  Name string\n}\n\ntype Stringer interface {\n  String() string\n}\n`
  );
  const main = result.elements.find((e) => e.name === "main");
  const add = result.elements.find((e) => e.name === "Add");
  const user = result.elements.find((e) => e.name === "User");
  const stringer = result.elements.find((e) => e.name === "Stringer");
  assertExists(main, "main function should be detected");
  assertEquals(main!.type, "function");
  assertExists(add, "Add function should be detected");
  assertExists(user, "User struct should be detected as class");
  assertEquals(user!.type, "class");
  assertExists(stringer, "Stringer interface should be detected");
  assertEquals(stringer!.type, "interface");
});

Deno.test("parseCode: detects Go method with receiver", async () => {
  const result = await parseSnippet(
    ".go",
    `func (u *User) Greet() string { return "hi" }\n`
  );
  const method = result.elements.find((e) => e.name === "Greet");
  assertExists(method, "Greet method should be detected");
  assertEquals(method!.type, "function");
});

// ── C / C++ ───────────────────────────────────

Deno.test("parseCode: detects C++ class and struct", async () => {
  const result = await parseSnippet(
    ".cpp",
    `class Animal {\npublic:\n  void speak() {}\n};\n\nstruct Point {\n  int x;\n  int y;\n};\n`
  );
  const cls = result.elements.find((e) => e.name === "Animal");
  const st = result.elements.find((e) => e.name === "Point");
  assertExists(cls, "Animal class should be detected");
  assertEquals(cls!.type, "class");
  assertExists(st, "Point struct should be detected");
  assertEquals(st!.type, "type");
});

Deno.test("parseCode: detects C function definition", async () => {
  const result = await parseSnippet(
    ".c",
    `int add(int a, int b) {\n  return a + b;\n}\n\nvoid printHello() {\n  printf("Hello");\n}\n`
  );
  const add = result.elements.find((e) => e.name === "add");
  const print = result.elements.find((e) => e.name === "printHello");
  assertExists(add, "add function should be detected");
  assertEquals(add!.type, "function");
  assertExists(print, "printHello function should be detected");
});

// ── Line numbers ──────────────────────────────

Deno.test("parseCode: line numbers are correct", async () => {
  const result = await parseSnippet(
    ".ts",
    `// line 1 comment\n// line 2\nexport function myFunc() {}\n`
  );
  const fn = result.elements.find((e) => e.name === "myFunc");
  assertExists(fn);
  assertEquals(fn!.line, 3, "myFunc should be on line 3");
});

// ── Edge cases ────────────────────────────────

Deno.test("parseCode: empty file returns no elements", async () => {
  const result = await parseSnippet(".ts", "");
  assertEquals(result.elements.length, 0);
});

Deno.test("parseCode: returns correct filePath", async () => {
  const tmp = await Deno.makeTempFile({ suffix: ".ts" });
  await Deno.writeTextFile(tmp, "export function hello() {}");
  try {
    const result = await parseCode({ filePath: tmp });
    assertEquals(result.filePath, tmp);
  } finally {
    await Deno.remove(tmp);
  }
});
