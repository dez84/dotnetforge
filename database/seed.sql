-- ============================================================================
-- DotNetForge — seed curriculum, capstones, and design patterns.
-- Idempotent: safe to re-run against a fresh database.
-- ============================================================================
BEGIN;

-- ---------------------------------------------------------------------------
-- Demo user (password: forge1234) — bcrypt hash generated for local dev only.
-- ---------------------------------------------------------------------------
INSERT INTO users (email, display_name, password_hash)
VALUES ('demo@dotnetforge.dev', 'Demo Engineer',
        '$2b$10$Q9YIpq0P0k1h3xEz6R2cO.ofGm0lS8vVQ0Mxq0XK7YbJ2hH1o1lLu')
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Tracks
-- ---------------------------------------------------------------------------
INSERT INTO tracks (slug, title, subtitle, description, icon, accent, sort_order, is_capstone) VALUES
('modern-csharp', 'Modern C# Essentials & OOP Foundations',
 'Language features, OOP, async, and LINQ mastery.',
 'Build a rock-solid foundation in the C# language: modern syntax, object-oriented design, asynchronous programming with the TPL, and querying with LINQ.',
 'braces', '#8b5cf6', 1, FALSE),
('aspnet-core', 'ASP.NET Core Web API Development',
 'REST design, middleware, DI, auth, and validation.',
 'Ship production-grade HTTP APIs with minimal APIs and controllers, a proper middleware pipeline, dependency injection, JWT security, validation, and OpenAPI docs.',
 'server', '#06b6d4', 2, FALSE),
('ef-core', 'Database Access with Entity Framework Core',
 'ORM fundamentals, migrations, relationships, performance.',
 'Model your domain with EF Core: DbContext configuration, code-first migrations, relationships, performance tuning, and high-performance Dapper queries.',
 'database', '#f59e0b', 3, FALSE),
('blazor', 'Blazor Web App & Architecture Patterns',
 'Components, render modes, state, Clean Architecture, CQRS.',
 'Compose rich interactive UIs with Blazor, then level up your architecture with Clean Architecture, the Repository pattern, and CQRS with MediatR.',
 'layers', '#10b981', 4, FALSE),
('capstone', 'Capstone Lab Hub',
 'Four guided, portfolio-ready .NET projects.',
 'Apply everything you have learned by building real, deployable systems step by step on VS Code + WSL2.',
 'rocket', '#ef4444', 5, TRUE);

-- ---------------------------------------------------------------------------
-- TRACK 1 — Modern C#
-- ---------------------------------------------------------------------------
INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'csharp-language', 'C# 12/13 Language Features',
       'Primary constructors, pattern matching, collection expressions, records, and init-only properties.', 1
FROM tracks WHERE slug = 'modern-csharp';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'oop-foundations', 'OOP Foundations & SOLID',
       'Interfaces, abstract classes, polymorphism, and the SOLID principles.', 2
FROM tracks WHERE slug = 'modern-csharp';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'async-programming', 'Asynchronous Programming',
       'async/await, the Task Parallel Library, and CancellationTokens.', 3
FROM tracks WHERE slug = 'modern-csharp';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'linq-mastery', 'LINQ Mastery',
       'Filtering, projecting, aggregations, and performance considerations.', 4
FROM tracks WHERE slug = 'modern-csharp';

-- Lesson: records & init-only
INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'records-and-init', 'Records & Init-Only Properties', 12, 1, $json$[
 {"type":"p","text":"A record is a reference type designed for immutable data. The compiler generates value-based equality, a readable ToString, and non-destructive mutation via with-expressions."},
 {"type":"code","language":"csharp","code":"public record Money(decimal Amount, string Currency)\n{\n    public Money Add(Money other) =>\n        other.Currency == Currency\n            ? this with { Amount = Amount + other.Amount }\n            : throw new InvalidOperationException(\"Currency mismatch\");\n}"},
 {"type":"callout","variant":"tip","title":"Why init-only?","body":"init lets a property be set during object initialization only. Combine it with records to express immutable domain values that the compiler protects for you."},
 {"type":"code","language":"csharp","code":"var price = new Product { Name = \"Keyboard\", Price = 49.99m };\n// price.Name = \"Mouse\"; // compile error: init-only"}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug = 'modern-csharp' AND m.slug = 'csharp-language';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Which C# feature gives records automatic value-based equality?',
 '[{"id":"a","text":"The class keyword"},{"id":"b","text":"The compiler-generated record members"},{"id":"c","text":"Implementing IComparable"},{"id":"d","text":"A manual Equals override"}]'::jsonb,
 'b',
 'Records get compiler-generated Equals/GetHashCode based on all public fields and properties, so two records with equal data compare equal.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='modern-csharp' AND m.slug='csharp-language' AND l.slug='records-and-init';

-- Lesson: pattern matching & collection expressions
INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'pattern-matching', 'Pattern Matching & Collection Expressions', 14, 2, $json$[
 {"type":"p","text":"Modern C# treats patterns as first-class. switch expressions, property patterns, and list patterns let you express branching logic declaratively."},
 {"type":"code","language":"csharp","code":"string Classify(Shape shape) => shape switch\n{\n    Circle { Radius: > 10 } => \"large circle\",\n    Circle => \"circle\",\n    Rectangle { Width: var w, Height: var h } when w == h => \"square\",\n    Rectangle => \"rectangle\",\n    _ => \"unknown\",\n};"},
 {"type":"p","text":"Collection expressions unify array, list, and span creation with one syntax — and spread existing collections with the .. operator."},
 {"type":"code","language":"csharp","code":"int[] first = [1, 2, 3];\nint[] second = [4, 5];\nint[] all = [.. first, .. second, 6]; // [1,2,3,4,5,6]"}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug = 'modern-csharp' AND m.slug = 'csharp-language';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'In the switch expression, what does the `when w == h` clause do in a pattern?',
 '[{"id":"a","text":"It defines a default case"},{"id":"b","text":"It adds an additional guard condition the pattern must also satisfy"},{"id":"c","text":"It captures the matched value"},{"id":"d","text":"It converts the value to int"}]'::jsonb,
 'b',
 '`when` adds a case guard: the arm matches only if the pattern matches AND the guard expression is true.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='modern-csharp' AND m.slug='csharp-language' AND l.slug='pattern-matching';

-- Lesson: primary constructors
INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'primary-constructors', 'Primary Constructors', 10, 3, $json$[
 {"type":"p","text":"C# 12 lets classes and structs declare constructor parameters on the type declaration itself. Parameters are captured and usable throughout the type body."},
 {"type":"code","language":"csharp","code":"public class ProductService(IProductRepository repository, ILogger<ProductService> logger)\n{\n    public async Task<Product?> GetAsync(int id)\n    {\n        logger.LogInformation(\"Fetching product {Id}\", id);\n        return await repository.FindAsync(id);\n    }\n}"},
 {"type":"callout","variant":"warning","title":"Capture carefully","body":"Captured primary-constructor parameters behave like fields. If a parameter is only needed to initialize a base or another field, prefer a normal constructor to avoid an unnecessary hidden field."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug = 'modern-csharp' AND m.slug = 'csharp-language';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'When is a primary constructor parameter NOT stored as a hidden field?',
 '[{"id":"a","text":"Never — always stored"},{"id":"b","text":"When it is used only to initialize another member or a base call"},{"id":"c","text":"When it is marked readonly"},{"id":"d","text":"When the class is sealed"}]'::jsonb,
 'b',
 'The compiler only captures a parameter if the body actually reads it; otherwise no backing field is emitted.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='modern-csharp' AND m.slug='csharp-language' AND l.slug='primary-constructors';

-- OOP lesson: SOLID
INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'solid-principles', 'The SOLID Principles in Practice', 16, 1, $json$[
 {"type":"list","items":["S — Single Responsibility: a class should have one reason to change.","O — Open/Closed: open for extension, closed for modification.","L — Liskov Substitution: subtypes must honour the base contract.","I — Interface Segregation: many small interfaces beat one fat one.","D — Dependency Inversion: depend on abstractions, not concretions."]},
 {"type":"code","language":"csharp","code":"// Dependency Inversion in action\npublic interface INotifier { Task SendAsync(string message); }\n\npublic class OrderService(INotifier notifier)\n{\n    public Task PlaceAsync(Order order) => notifier.SendAsync($\"Order {order.Id} placed\");\n}"},
 {"type":"callout","variant":"tip","title":"Smell test","body":"If adding a feature forces you to edit a long if/else chain of types, you are probably violating Open/Closed. Prefer polymorphism or strategy objects."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug = 'modern-csharp' AND m.slug = 'oop-foundations';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Which SOLID principle does injecting INotifier instead of `new EmailNotifier()` demonstrate?',
 '[{"id":"a","text":"Single Responsibility"},{"id":"b","text":"Interface Segregation"},{"id":"c","text":"Dependency Inversion"},{"id":"d","text":"Liskov Substitution"}]'::jsonb,
 'c',
 'Dependency Inversion says high-level modules should depend on abstractions, not concrete implementations.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='modern-csharp' AND m.slug='oop-foundations' AND l.slug='solid-principles';

-- Async lesson
INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'async-await', 'async/await & CancellationTokens', 14, 1, $json$[
 {"type":"p","text":"async/await frees the calling thread while I/O is in flight. Never block on async code with .Result or .Wait() — it risks deadlocks and thread-pool starvation."},
 {"type":"code","language":"csharp","code":"public async Task<Report> BuildReportAsync(CancellationToken ct)\n{\n    var data = await _repo.LoadAsync(ct);\n    await Task.Delay(250, ct); // simulate slow work, cancellable\n    return new Report(data);\n}"},
 {"type":"callout","variant":"warning","title":"Cancellation is cooperative","body":"A CancellationToken only signals intent. Your code must check ThrowIfCancellationRequested() or pass ct into APIs that observe it."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug = 'modern-csharp' AND m.slug = 'async-programming';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'What is the recommended return type for an async method that does not return a value?',
 '[{"id":"a","text":"void"},{"id":"b","text":"Task"},{"id":"c","text":"Task<void>"},{"id":"d","text":"async void is preferred"}]'::jsonb,
 'b',
 'Return Task. async void should be reserved for event handlers because callers cannot await it or observe exceptions.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='modern-csharp' AND m.slug='async-programming' AND l.slug='async-await';

-- LINQ lesson
INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'linq-fundamentals', 'LINQ: Filter, Project, Aggregate', 15, 1, $json$[
 {"type":"p","text":"LINQ gives a consistent query surface over objects, EF Core, XML, and more. Method syntax composes cleanly; query syntax reads like SQL."},
 {"type":"code","language":"csharp","code":"var report = orders\n    .Where(o => o.Total > 100)\n    .GroupBy(o => o.CustomerId)\n    .Select(g => new { Customer = g.Key, Spend = g.Sum(o => o.Total) })\n    .OrderByDescending(x => x.Spend)\n    .Take(10)\n    .ToList();"},
 {"type":"callout","variant":"tip","title":"Deferred execution","body":"Where/Select do not run until you enumerate. Chain ToList()/ToArray() deliberately, and beware capturing a query that runs repeatedly inside a loop."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug = 'modern-csharp' AND m.slug = 'linq-mastery';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Why is `Where(...)` considered lazily evaluated?',
 '[{"id":"a","text":"It caches results forever"},{"id":"b","text":"It returns an IEnumerable that only executes when enumerated"},{"id":"c","text":"It runs on a background thread"},{"id":"d","text":"It compiles to SQL immediately"}]'::jsonb,
 'b',
 'LINQ operators build an expression pipeline; execution is deferred until enumeration (foreach, ToList, Count, etc.).',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='modern-csharp' AND m.slug='linq-mastery' AND l.slug='linq-fundamentals';

-- ---------------------------------------------------------------------------
-- TRACK 2 — ASP.NET Core
-- ---------------------------------------------------------------------------
INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'api-design', 'RESTful API Design', 'Minimal APIs vs controllers, routing, and versioning.', 1
FROM tracks WHERE slug = 'aspnet-core';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'middleware-di', 'Middleware, DI & Configuration', 'The request pipeline, service lifetimes, and options.', 2
FROM tracks WHERE slug = 'aspnet-core';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'auth-security', 'Authentication & Authorization', 'JWT, ASP.NET Core Identity, and OAuth2.', 3
FROM tracks WHERE slug = 'aspnet-core';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'validation-openapi', 'Validation & OpenAPI', 'FluentValidation, global error handling, and Swagger.', 4
FROM tracks WHERE slug = 'aspnet-core';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'minimal-vs-controllers', 'Minimal APIs vs Controllers', 13, 1, $json$[
 {"type":"p","text":"Minimal APIs reduce ceremony: map a delegate straight to a route. Controllers still shine for large surface areas with filters and conventional routing."},
 {"type":"code","language":"csharp","code":"var products = app.MapGroup(\"/api/products\").WithTags(\"Products\");\n\nproducts.MapGet(\"/\", async (IProductService svc) =>\n    Results.Ok(await svc.ListAsync()));\n\nproducts.MapPost(\"/\", async (CreateProductDto dto, IProductService svc) =>\n{\n    var created = await svc.CreateAsync(dto);\n    return Results.Created($\"/api/products/{created.Id}\", created);\n});"}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='api-design';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Which HTTP status best represents a successful resource creation?',
 '[{"id":"a","text":"200 OK"},{"id":"b","text":"201 Created"},{"id":"c","text":"204 No Content"},{"id":"d","text":"302 Found"}]'::jsonb,
 'b',
 '201 Created with a Location header pointing at the new resource is the RESTful convention for POST that creates a resource.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='api-design' AND l.slug='minimal-vs-controllers';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'di-lifetimes', 'Dependency Injection Lifetimes', 12, 1, $json$[
 {"type":"p","text":"Three lifetimes govern how the container resolves services: Transient (new every time), Scoped (one per request), Singleton (one per application)."},
 {"type":"list","items":["Transient — lightweight, stateless helpers.","Scoped — per-request state such as a DbContext.","Singleton — application-wide caches or configuration."]},
 {"type":"code","language":"csharp","code":"builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(cs)); // scoped\nbuilder.Services.AddSingleton<IClock, SystemClock>();          // singleton\nbuilder.Services.AddTransient<IEmailSender, SmtpEmailSender>(); // transient"},
 {"type":"callout","variant":"warning","title":"Captive dependency","body":"Injecting a Scoped service into a Singleton captures it for the app lifetime — a classic bug. Validate scopes in development with ValidateScopes = true."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='middleware-di';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'A DbContext should almost always be registered with which lifetime?',
 '[{"id":"a","text":"Transient"},{"id":"b","text":"Scoped"},{"id":"c","text":"Singleton"},{"id":"d","text":"Static"}]'::jsonb,
 'b',
 'DbContext is not thread-safe and tracks per-request state, so the scoped lifetime (one instance per HTTP request) is the correct choice.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='middleware-di' AND l.slug='di-lifetimes';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'jwt-auth', 'JWT Authentication & Policies', 16, 1, $json$[
 {"type":"p","text":"JWT bearer auth issues signed tokens the API validates on each request. Combine [Authorize] with policies for fine-grained, role- or claim-based access."},
 {"type":"code","language":"csharp","code":"builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)\n    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters\n    {\n        ValidateIssuer = true,\n        ValidateAudience = true,\n        ValidateLifetime = true,\n        IssuerSigningKey = new SymmetricSecurityKey(key)\n    });\n\nbuilder.Services.AddAuthorization(o =>\n    o.AddPolicy(\"AdminOnly\", p => p.RequireRole(\"Admin\")));"},
 {"type":"callout","variant":"warning","title":"Never trust the payload alone","body":"Always validate issuer, audience, lifetime, and signature. Store signing keys in secrets, never in source control."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='auth-security';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Which token validation parameter protects against token replay after expiry?',
 '[{"id":"a","text":"ValidateIssuer"},{"id":"b","text":"ValidateAudience"},{"id":"c","text":"ValidateLifetime"},{"id":"d","text":"ValidateSignature"}]'::jsonb,
 'c',
 'ValidateLifetime checks the exp/nbf claims so expired tokens are rejected.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='auth-security' AND l.slug='jwt-auth';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'fluentvalidation', 'FluentValidation & Global Errors', 12, 1, $json$[
 {"type":"p","text":"FluentValidation expresses rules as readable validators. Wire them into the pipeline so invalid requests short-circuit with a consistent problem-details response."},
 {"type":"code","language":"csharp","code":"public class CreateProductValidator : AbstractValidator<CreateProductDto>\n{\n    public CreateProductValidator()\n    {\n        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);\n        RuleFor(x => x.Price).GreaterThan(0);\n    }\n}"},
 {"type":"p","text":"A global exception handler converts unhandled exceptions into RFC 7807 ProblemDetails, so clients always get a predictable error shape."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='validation-openapi';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'What standard does ProblemDetails (RFC 7807) define?',
 '[{"id":"a","text":"A JWT claim set"},{"id":"b","text":"A machine-readable shape for HTTP API errors"},{"id":"c","text":"A database migration format"},{"id":"d","text":"A caching header"}]'::jsonb,
 'b',
 'RFC 7807 defines a JSON structure (type, title, status, detail) for conveying error details consistently across APIs.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='aspnet-core' AND m.slug='validation-openapi' AND l.slug='fluentvalidation';

-- ---------------------------------------------------------------------------
-- TRACK 3 — EF Core
-- ---------------------------------------------------------------------------
INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'ef-fundamentals', 'EF Core Fundamentals', 'ORM basics and DbContext configuration.', 1
FROM tracks WHERE slug = 'ef-core';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'ef-migrations', 'Migrations & Relationships', 'Code-first migrations and 1:1, 1:N, N:M mappings.', 2
FROM tracks WHERE slug = 'ef-core';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'ef-performance', 'Performance & Dapper', 'AsNoTracking, loading strategies, indexing, and raw SQL.', 3
FROM tracks WHERE slug = 'ef-core';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'dbcontext-basics', 'DbContext & DbSet Basics', 11, 1, $json$[
 {"type":"p","text":"A DbContext represents a session with the database. DbSet<T> properties expose aggregate roots you can query and change-track."},
 {"type":"code","language":"csharp","code":"public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)\n{\n    public DbSet<Product> Products => Set<Product>();\n    public DbSet<Category> Categories => Set<Category>();\n}"}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='ef-core' AND m.slug='ef-fundamentals';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'What does a DbSet<T> represent?',
 '[{"id":"a","text":"A single database row"},{"id":"b","text":"A queryable collection of entities of type T"},{"id":"c","text":"A compiled SQL view"},{"id":"d","text":"A connection string"}]'::jsonb,
 'b',
 'DbSet<T> is a queryable, change-tracking collection mapped to a table or view of entities of type T.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='ef-core' AND m.slug='ef-fundamentals' AND l.slug='dbcontext-basics';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'migrations-and-relations', 'Migrations & Entity Relationships', 17, 1, $json$[
 {"type":"terminal","commands":["dotnet ef migrations add InitialCreate","dotnet ef database update","dotnet ef migrations script --idempotent -o migrate.sql"]},
 {"type":"p","text":"Relationships are expressed through navigation properties. EF Core infers 1:N and N:M from conventions, or you can be explicit with the Fluent API."},
 {"type":"code","language":"csharp","code":"modelBuilder.Entity<Order>()\n    .HasOne(o => o.Customer)\n    .WithMany(c => c.Orders)\n    .HasForeignKey(o => o.CustomerId);\n\nmodelBuilder.Entity<Product>()\n    .HasMany(p => p.Tags)\n    .WithMany(t => t.Products); // implicit join table"}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='ef-core' AND m.slug='ef-migrations';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Which command applies pending migrations to the database?',
 '[{"id":"a","text":"dotnet ef migrations add"},{"id":"b","text":"dotnet ef database update"},{"id":"c","text":"dotnet build --migrate"},{"id":"d","text":"dotnet ef dbcontext script"}]'::jsonb,
 'b',
 '`dotnet ef database update` applies all pending migrations; `migrations add` only scaffolds a new one.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='ef-core' AND m.slug='ef-migrations' AND l.slug='migrations-and-relations';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'loading-perf', 'Loading Strategies & Performance', 15, 1, $json$[
 {"type":"list","items":["Lazy loading — loads on first access; easy to trigger N+1 storms.","Eager loading — Include/ThenInclude pulls related data in one query.","Explicit loading — you control when related data is fetched.","Projection — Select only the columns you need."]},
 {"type":"code","language":"csharp","code":"// Read-only query: skip change tracking entirely\nvar list = await db.Products\n    .AsNoTracking()\n    .Where(p => p.Price > 100)\n    .Select(p => new ProductSummary(p.Id, p.Name, p.Price))\n    .ToListAsync();"},
 {"type":"callout","variant":"tip","title":"Measure before you tune","body":"Enable EF Core query logging or a profiler first. Add indexes for filters and joins, and prefer AsNoTracking for read-heavy endpoints."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='ef-core' AND m.slug='ef-performance';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'When is AsNoTracking() most appropriate?',
 '[{"id":"a","text":"When you will modify and save the entities"},{"id":"b","text":"For read-only queries that do not need change tracking"},{"id":"c","text":"Only inside migrations"},{"id":"d","text":"When using Dapper"}]'::jsonb,
 'b',
 'AsNoTracking skips the change tracker, reducing memory and CPU for queries whose results you will not update.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='ef-core' AND m.slug='ef-performance' AND l.slug='loading-perf';

-- ---------------------------------------------------------------------------
-- TRACK 4 — Blazor
-- ---------------------------------------------------------------------------
INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'blazor-components', 'Blazor Components', 'Data binding, events, and the component lifecycle.', 1
FROM tracks WHERE slug = 'blazor';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'render-modes', 'Render Modes & State', 'Server, WebAssembly, Auto, cascading values, and JS interop.', 2
FROM tracks WHERE slug = 'blazor';

INSERT INTO modules (track_id, slug, title, summary, sort_order)
SELECT id, 'architecture-patterns', 'Clean Architecture & CQRS', 'Layered architecture, Repository, and MediatR.', 3
FROM tracks WHERE slug = 'blazor';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'components-lifecycle', 'Components, Binding & Lifecycle', 14, 1, $json$[
 {"type":"p","text":"A Blazor component is a reusable UI unit. Parameters flow in via [Parameter]; @bind wires two-way binding; lifecycle hooks let you run code at key moments."},
 {"type":"code","language":"csharp","code":"@code {\n    [Parameter] public int Count { get; set; }\n    [Parameter] public EventCallback<int> CountChanged { get; set; }\n\n    protected override async Task OnInitializedAsync()\n        => _items = await Http.GetFromJsonAsync<List<Item>>(\"api/items\");\n}"},
 {"type":"callout","variant":"tip","title":"Prefer EventCallback","body":"Use EventCallback<T> over Action<T> for component parameters — it triggers re-renders on the correct synchronization context automatically."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='blazor' AND m.slug='blazor-components';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'Which lifecycle method runs once when a component is first rendered and is safe for async data loading?',
 '[{"id":"a","text":"OnAfterRender"},{"id":"b","text":"OnInitializedAsync"},{"id":"c","text":"Dispose"},{"id":"d","text":"ShouldRender"}]'::jsonb,
 'b',
 'OnInitializedAsync runs once at initialization and supports awaiting, making it the usual place to load data.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='blazor' AND m.slug='blazor-components' AND l.slug='components-lifecycle';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'render-modes-state', 'Render Modes, State & JS Interop', 15, 1, $json$[
 {"type":"p","text":"Blazor Web App render modes decide where components execute: Server (on the server over SignalR), WebAssembly (in the browser), or Auto (server first, then WASM)."},
 {"type":"code","language":"csharp","code":"@rendermode InteractiveAuto\n\n@code {\n    // Cascading parameters flow down the component tree\n    [CascadingParameter] public AppState? State { get; set; }\n}"},
 {"type":"p","text":"JS interop bridges to browser APIs via IJSRuntime. Use it for things C# cannot reach, such as localStorage or a canvas."}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='blazor' AND m.slug='render-modes';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'What does the InteractiveAuto render mode do?',
 '[{"id":"a","text":"Always runs in WebAssembly only"},{"id":"b","text":"Starts on the server, then switches to WebAssembly on later visits once assets are cached"},{"id":"c","text":"Disables interactivity"},{"id":"d","text":"Runs only during prerender"}]'::jsonb,
 'b',
 'Auto downloads the WASM runtime, so the first visit uses Server for speed and subsequent visits use WebAssembly.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='blazor' AND m.slug='render-modes' AND l.slug='render-modes-state';

INSERT INTO lessons (module_id, slug, title, est_minutes, sort_order, content)
SELECT m.id, 'clean-cqrs', 'Clean Architecture & CQRS with MediatR', 18, 1, $json$[
 {"type":"p","text":"Clean Architecture nests dependencies inward: Domain has no dependencies; Application depends on Domain; Infrastructure and API depend on Application. Dependencies always point inward."},
 {"type":"list","items":["Domain — entities, value objects, domain events.","Application — use cases (commands/queries), interfaces.","Infrastructure — EF Core, external services.","API — controllers/minimal endpoints, composition root."]},
 {"type":"code","language":"csharp","code":"public record CreateOrderCommand(Guid CustomerId, List<OrderLine> Lines)\n    : IRequest<Guid>;\n\npublic class CreateOrderHandler(IOrderRepository repo)\n    : IRequestHandler<CreateOrderCommand, Guid>\n{\n    public async Task<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)\n    {\n        var order = Order.Create(cmd.CustomerId, cmd.Lines);\n        await repo.AddAsync(order, ct);\n        return order.Id;\n    }\n}"}
]$json$::jsonb
FROM modules m JOIN tracks t ON t.id = m.track_id
WHERE t.slug='blazor' AND m.slug='architecture-patterns';

INSERT INTO quiz_questions (lesson_id, prompt, options, correct_id, explanation, sort_order)
SELECT l.id,
 'In CQRS, what is the difference between a command and a query?',
 '[{"id":"a","text":"Commands read data; queries write it"},{"id":"b","text":"Commands change state; queries only read"},{"id":"c","text":"They are identical"},{"id":"d","text":"Queries must use MediatR"}]'::jsonb,
 'b',
 'Commands mutate state and return no data (or an id); queries are side-effect free reads.',
 1
FROM lessons l JOIN modules m ON m.id = l.module_id JOIN tracks t ON t.id = m.track_id
WHERE t.slug='blazor' AND m.slug='architecture-patterns' AND l.slug='clean-cqrs';

-- ---------------------------------------------------------------------------
-- CAPSTONE LAB HUB
-- ---------------------------------------------------------------------------
INSERT INTO capstone_projects (slug, title, objective, difficulty, est_hours, tools, deliverables, accent, icon, sort_order) VALUES
('secure-ecommerce-api', 'Project 1 — Secure Enterprise E-Commerce REST API',
 'Build a scalable backend API featuring JWT authentication, product catalog management, role-based access control, and dynamic query filtering.',
 'intermediate', 8,
 '["VS Code","WSL2",".NET SDK","PostgreSQL (via Docker)","Postman/Thunder Client"]'::jsonb,
 '["EF Core migrations","Repository pattern implementation","Policy-secured endpoints","OpenAPI docs"]'::jsonb,
 '#06b6d4', 'shield', 1),
('realtime-dashboard', 'Project 2 — Real-Time Interactive Dashboard',
 'Develop a live monitoring dashboard using Blazor Server/WASM that broadcasts real-time system metrics or chat updates using SignalR hubs.',
 'intermediate', 6,
 '["VS Code","WSL2",".NET SDK","C# Dev Kit extension"]'::jsonb,
 '["Responsive Blazor components","SignalR hub + WebSocket connections","Client-side UI updates without full reloads"]'::jsonb,
 '#8b5cf6', 'activity', 2),
('clean-architecture-microservice', 'Project 3 — Clean Architecture Microservice with CQRS & MediatR',
 'Architect a decoupled Order Management service using Clean Architecture layers (Domain, Application, Infrastructure, API).',
 'advanced', 10,
 '["VS Code","WSL2","Docker (Desktop/Engine)","MediatR","FluentValidation"]'::jsonb,
 '["Separated commands/queries (CQRS)","Domain event handlers","FluentValidation pipeline","Dockerized container"]'::jsonb,
 '#10b981', 'layers', 3),
('redis-rabbitmq-worker', 'Project 4 — Distributed Caching & Message Queue Task Worker',
 'Build a background processing engine in .NET that consumes message queues for heavy tasks such as automated email sending and PDF invoice generation.',
 'advanced', 9,
 '["VS Code","WSL2","Docker (Redis + RabbitMQ)","MassTransit"]'::jsonb,
 '["BackgroundWorker service","Publisher/consumer channels","Redis distributed caching"]'::jsonb,
 '#f59e0b', 'cpu', 4);

-- Project 1 steps
INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'scaffold', 'Scaffold the solution & API project',
 'Create a solution folder and a Minimal API project, then add the PostgreSQL EF Core provider.',
 '["mkdir -p ~/forge/ecommerce-api && cd ~/forge/ecommerce-api","dotnet new sln -n EcommerceApi","dotnet new webapi -minimal -o src/Api","dotnet sln add src/Api","dotnet add src/Api package Npgsql.EntityFrameworkCore.PostgreSQL"]'::jsonb,
 NULL, 'csharp', 1
FROM capstone_projects p WHERE p.slug='secure-ecommerce-api';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'database', 'Run PostgreSQL in Docker',
 'Start a lightweight PostgreSQL container and point the API at it via a connection string in user-secrets.',
 '["docker run -d --name forge-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=shop -p 5432:5432 postgres:16-alpine","dotnet user-secrets init --project src/Api","dotnet user-secrets set \"ConnectionStrings:Default\" \"Host=localhost;Database=shop;Username=postgres;Password=dev\" --project src/Api"]'::jsonb,
 NULL, 'csharp', 2
FROM capstone_projects p WHERE p.slug='secure-ecommerce-api';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'model', 'Model the catalog & secure with JWT policies',
 'Define Product and Category entities, then protect write endpoints with role-based policies.',
 '[]'::jsonb,
 E'public record Product(int Id, string Name, decimal Price, int CategoryId);\n\nbuilder.Services.AddAuthorization(o =>\n    o.AddPolicy("CanManageCatalog", p => p.RequireRole("Admin", "Manager")));\n\napp.MapPost("/api/products", CreateProduct)\n   .RequireAuthorization("CanManageCatalog");',
 'csharp', 3
FROM capstone_projects p WHERE p.slug='secure-ecommerce-api';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'migrate-docs', 'Generate migrations & OpenAPI docs',
 'Create the initial migration, apply it, and expose a rich OpenAPI document with metadata.',
 '["dotnet ef migrations add InitialCreate --project src/Api","dotnet ef database update --project src/Api","dotnet run --project src/Api"]'::jsonb,
 NULL, 'csharp', 4
FROM capstone_projects p WHERE p.slug='secure-ecommerce-api';

-- Project 2 steps
INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'scaffold', 'Create the Blazor Web App',
 'Scaffold a Blazor Web App with interactive server rendering, then add a SignalR hub.',
 '["dotnet new blazor -o src/Dashboard --interactivity Server --all-interactive","dotnet add src/Dashboard package Microsoft.AspNetCore.SignalR.Client"]'::jsonb,
 NULL, 'csharp', 1
FROM capstone_projects p WHERE p.slug='realtime-dashboard';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'hub', 'Build the SignalR metrics hub',
 'Expose a strongly-typed hub that broadcasts system metrics on an interval.',
 '[]'::jsonb,
 E'public interface IMetricsClient\n{\n    Task ReceiveMetric(SystemMetric metric);\n}\n\npublic class MetricsHub : Hub<IMetricsClient>\n{\n    public Task Subscribe() => Groups.AddToGroupAsync(Context.ConnectionId, "metrics");\n}',
 'csharp', 2
FROM capstone_projects p WHERE p.slug='realtime-dashboard';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'component', 'Wire the live component',
 'Connect from Blazor, subscribe to the hub, and update the UI as metrics arrive — no page reloads.',
 '["dotnet run --project src/Dashboard"]'::jsonb,
 E'@code {\n    protected override async Task OnInitializedAsync()\n    {\n        _hub = new HubConnectionBuilder()\n            .WithUrl(Nav.ToAbsoluteUri("/metrics"))\n            .WithAutomaticReconnect()\n            .Build();\n        _hub.On<SystemMetric>("ReceiveMetric", m =>\n        {\n            _metrics.Add(m);\n            InvokeAsync(StateHasChanged);\n        });\n        await _hub.StartAsync();\n    }\n}',
 'csharp', 3
FROM capstone_projects p WHERE p.slug='realtime-dashboard';

-- Project 3 steps
INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'layers', 'Create the Clean Architecture layers',
 'Create four projects (Domain, Application, Infrastructure, API) and wire dependencies inward.',
 '["dotnet new classlib -o src/Ordering.Domain","dotnet new classlib -o src/Ordering.Application","dotnet new classlib -o src/Ordering.Infrastructure","dotnet new webapi -minimal -o src/Ordering.Api","dotnet add src/Ordering.Application reference src/Ordering.Domain","dotnet add src/Ordering.Infrastructure reference src/Ordering.Application","dotnet add src/Ordering.Api reference src/Ordering.Application src/Ordering.Infrastructure"]'::jsonb,
 NULL, 'csharp', 1
FROM capstone_projects p WHERE p.slug='clean-architecture-microservice';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'cqrs', 'Add CQRS with MediatR & FluentValidation',
 'Define commands and queries, their handlers, and a validation pipeline behaviour.',
 '["dotnet add src/Ordering.Application package MediatR","dotnet add src/Ordering.Application package FluentValidation.DependencyInjectionExtensions"]'::jsonb,
 E'public class ValidationBehaviour<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)\n    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull\n{\n    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)\n    {\n        var context = new ValidationContext<TRequest>(request);\n        var failures = validators\n            .Select(v => v.Validate(context))\n            .SelectMany(r => r.Errors)\n            .Where(f => f is not null)\n            .ToList();\n        if (failures.Count != 0) throw new ValidationException(failures);\n        return await next();\n    }\n}',
 'csharp', 2
FROM capstone_projects p WHERE p.slug='clean-architecture-microservice';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'dockerize', 'Containerize the service',
 'Add a Dockerfile and run the API plus its database with Docker Compose.',
 '["docker build -t ordering-api .","docker run -d -p 8080:8080 ordering-api"]'::jsonb,
 E'FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish src/Ordering.Api -c Release -o /app\n\nFROM mcr.microsoft.com/dotnet/aspnet:8.0\nWORKDIR /app\nCOPY --from=build /app .\nENTRYPOINT ["dotnet", "Ordering.Api.dll"]',
 'dockerfile', 3
FROM capstone_projects p WHERE p.slug='clean-architecture-microservice';

-- Project 4 steps
INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'infra', 'Start Redis & RabbitMQ',
 'Run the message broker and cache as containers alongside your worker.',
 '["docker run -d --name forge-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management","docker run -d --name forge-redis -p 6379:6379 redis:7-alpine"]'::jsonb,
 NULL, 'csharp', 1
FROM capstone_projects p WHERE p.slug='redis-rabbitmq-worker';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'worker', 'Create the Worker Service & consumers',
 'Scaffold a Worker Service, wire MassTransit to RabbitMQ, and consume an InvoiceRequested message.',
 '["dotnet new worker -o src/InvoiceWorker","dotnet add src/InvoiceWorker package MassTransit.RabbitMQ","dotnet add src/InvoiceWorker package StackExchange.Redis"]'::jsonb,
 E'public class InvoiceRequestedConsumer : IConsumer<InvoiceRequested>\n{\n    public async Task Consume(ConsumeContext<InvoiceRequested> context)\n    {\n        var invoice = await RenderPdfAsync(context.Message.OrderId);\n        await context.Publish(new InvoiceReady(context.Message.OrderId, invoice.Url));\n    }\n}',
 'csharp', 2
FROM capstone_projects p WHERE p.slug='redis-rabbitmq-worker';

INSERT INTO capstone_steps (project_id, slug, title, body, commands, code, code_language, sort_order)
SELECT p.id, 'cache', 'Add Redis distributed caching',
 'Cache expensive lookups in Redis with an IDistributedCache-backed decorator.',
 '["dotnet run --project src/InvoiceWorker"]'::jsonb,
 E'public class CachedCatalog(ICatalog inner, IDistributedCache cache) : ICatalog\n{\n    public async Task<Catalog?> GetAsync(int id, CancellationToken ct)\n    {\n        var json = await cache.GetStringAsync($"catalog:{id}", ct);\n        if (json is not null) return JsonSerializer.Deserialize<Catalog>(json);\n        var value = await inner.GetAsync(id, ct);\n        await cache.SetStringAsync($"catalog:{id}", JsonSerializer.Serialize(value), ct);\n        return value;\n    }\n}',
 'csharp', 3
FROM capstone_projects p WHERE p.slug='redis-rabbitmq-worker';

-- ---------------------------------------------------------------------------
-- Design patterns (drag & drop game)
-- ---------------------------------------------------------------------------
INSERT INTO design_patterns (slug, name, category, description, intent, code_hint, sort_order) VALUES
('singleton', 'Singleton', 'creational', 'Ensures a class has exactly one instance with a global access point.', 'Control global state such as configuration or a connection pool.', 'public sealed class Registry { public static Registry Instance { get; } = new(); }', 1),
('factory-method', 'Factory Method', 'creational', 'Defines an interface for creating an object, letting subclasses decide which class to instantiate.', 'Decouple client code from concrete types.', 'public IExporter Create() => new CsvExporter();', 2),
('repository', 'Repository', 'structural', 'Mediates between the domain and data mapping layers using a collection-like interface.', 'Keep persistence concerns out of business logic.', 'public interface IOrderRepository { Task<Order?> FindAsync(Guid id); }', 3),
('decorator', 'Decorator', 'structural', 'Attaches additional responsibilities to an object dynamically by wrapping it.', 'Add cross-cutting behaviour such as caching or logging.', 'public class LoggingService(IService inner) : IService', 4),
('strategy', 'Strategy', 'behavioral', 'Defines a family of algorithms, encapsulates each, and makes them interchangeable.', 'Swap algorithms at runtime without conditionals.', 'public class PricingContext(IPricingStrategy strategy)', 5),
('observer', 'Observer', 'behavioral', 'Defines a one-to-many dependency so that when one object changes state, dependents are notified.', 'Implement event-driven notifications.', 'public event EventHandler<OrderPlaced>? OnOrderPlaced;', 6);

COMMIT;
