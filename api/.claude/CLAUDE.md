````markdown
# Claude.md

# Java Spring Boot Project Guidelines

This document defines the engineering standards and best practices for this project. Follow these guidelines consistently when generating, modifying, or reviewing code.

---

# General Principles

- Always prioritize readability over cleverness.
- Follow SOLID principles.
- Follow Clean Architecture and Clean Code practices.
- Prefer composition over inheritance.
- Avoid code duplication (DRY).
- Keep methods small and focused on a single responsibility.
- Keep classes cohesive.
- Always write code that is easy to test.

---

# Java Standards

- Use Java 21 features when appropriate.
- Prefer immutable objects whenever possible.
- Prefer `final` for local variables and method parameters whenever practical.
- Avoid unnecessary `static` methods.
- Never use wildcard imports.
- Organize imports automatically.
- Remove unused imports.
- Use meaningful variable names.
- Avoid abbreviations except for well-known terms (DTO, UUID, HTTP, JWT, etc.).

Example:

Good

```java
Customer customer = customerRepository.findById(id);

String accessToken = jwtService.generateToken(user);
```

Bad

```java
Customer c = repo.findById(id);

String t = jwt.generate(user);
```

---

# Package Organization

Organize packages by feature instead of technical layer whenever possible.

Preferred:

```
customer
    CustomerController
    CustomerService
    CustomerRepository
    CustomerMapper
    CustomerDTO
    CustomerEntity

order
payment
authentication
```

Avoid:

```
controllers
services
repositories
entities
dto
```

unless the project is already structured that way.

---

# Controllers

Controllers should:

- Only receive HTTP requests.
- Validate input.
- Delegate business logic to services.
- Return proper HTTP responses.
- Never contain business rules.

Example:

```java
@PostMapping
public ResponseEntity<CustomerResponse> create(
        @Valid @RequestBody CreateCustomerRequest request
) {
    return ResponseEntity.ok(customerService.create(request));
}
```

Controllers must NOT:

- Access repositories directly.
- Perform calculations.
- Implement business rules.

---

# Services

Services contain business logic.

Services should:

- Be small.
- Be focused.
- Use constructor injection.
- Throw meaningful exceptions.
- Never know HTTP details.

Avoid huge service classes.

If a service exceeds roughly 300 lines, consider splitting responsibilities.

---

# Repositories

- Extend Spring Data repositories whenever possible.
- Prefer derived query methods.
- Use JPQL only when necessary.
- Use native SQL only as a last resort.
- Keep repositories free from business logic.

---

# Entities

Entities should:

- Represent the database model.
- Contain minimal behavior.
- Avoid exposing mutable collections.
- Never expose internal IDs unnecessarily.

Prefer:

```java
@OneToMany(...)
private final List<Order> orders = new ArrayList<>();
```

instead of exposing setters for collections.

---

# DTOs

Always use DTOs.

Never expose JPA entities directly.

Separate:

- Request DTO
- Response DTO

Example:

```
CreateCustomerRequest

UpdateCustomerRequest

CustomerResponse
```

---

# Validation

Use Jakarta Validation annotations.

Example:

```java
@NotBlank

@Email

@NotNull

@Positive
```

Never validate manually if Bean Validation can do it.

---

# Dependency Injection

Always use constructor injection.

Good:

```java
@Service
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

}
```

Avoid field injection.

Never use:

```java
@Autowired
private CustomerRepository repository;
```

---

# Exception Handling

Use a global exception handler.

```
@RestControllerAdvice
```

Create custom exceptions for business rules.

Example:

```
CustomerAlreadyExistsException

ProductUnavailableException

InvalidPasswordException
```

Never expose stack traces to clients.

Always return meaningful error responses.

---

# Logging

Use SLF4J.

Good:

```java
log.info("Customer {} created successfully", customerId);
```

Never use:

```java
System.out.println(...)
```

Log:

- Important business events
- Warnings
- Errors

Do not log:

- Passwords
- Tokens
- Sensitive information

---

# Transactions

Use `@Transactional` only where necessary.

Prefer transactions at the service layer.

Avoid transactions in controllers.

---

# Configuration

Use:

```
application.yml
```

instead of large property files.

Store secrets in:

- Environment variables
- Secret managers

Never hardcode:

- passwords
- API keys
- JWT secrets

---

# Security

Always follow Spring Security best practices.

Requirements:

- JWT authentication
- BCrypt password hashing
- Stateless authentication
- CSRF disabled only for stateless APIs
- Principle of least privilege

Never store passwords in plain text.

---

# Mapping

Prefer using MapStruct.

Avoid manual mapping when possible.

---

# REST API Design

Use REST conventions.

Examples:

```
GET /customers

GET /customers/{id}

POST /customers

PUT /customers/{id}

PATCH /customers/{id}

DELETE /customers/{id}
```

Use nouns instead of verbs.

Good:

```
POST /orders
```

Avoid:

```
POST /createOrder
```

---

# HTTP Status Codes

Use proper status codes.

```
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

500 Internal Server Error
```

---

# Testing

Every business logic should be testable.

Prefer:

- JUnit 5
- Mockito
- Testcontainers (when integration tests are required)

Aim for:

- Unit tests for services
- Integration tests for controllers
- Repository tests when using custom queries

---

# Code Style

Maximum method size:

- Around 30 lines.

Maximum class size:

- Around 300 lines.

Avoid deep nesting.

Prefer early returns.

Good:

```java
if (customer == null) {
    throw new CustomerNotFoundException();
}

customer.activate();
```

Instead of:

```java
if (customer != null) {
    customer.activate();
}
```

---

# Documentation

Every public API should be documented using OpenAPI annotations.

Example:

```java
@Operation(summary = "Create a new customer")
```

---

# Performance

Avoid N+1 queries.

Use:

- Fetch joins
- EntityGraph
- Pagination

Never return huge collections without pagination.

---

# Naming

Classes:

```
CustomerService
CustomerController
CustomerRepository
```

Interfaces:

```
PaymentGateway
NotificationService
```

DTOs:

```
CreateOrderRequest

OrderResponse
```

Exceptions:

```
OrderNotFoundException
```

Enums:

```
OrderStatus

PaymentStatus
```

---

# Git

Commits should follow Conventional Commits.

Examples:

```
feat:

fix:

refactor:

test:

docs:

chore:

build:
```

---

# Before Writing Code

Always consider:

- Is there duplicated logic?
- Can this be simplified?
- Is the responsibility correct?
- Is the code testable?
- Is the API RESTful?
- Is validation complete?
- Are exceptions handled correctly?
- Is the code secure?
- Is naming clear?
- Is there unnecessary complexity?

If any answer is "no", improve the implementation before finishing.

---

# Golden Rule

Always generate production-ready code.

The generated code should be:

- Clean
- Secure
- Maintainable
- Testable
- Readable
- Well documented
- Consistent with Spring Boot best practices

Never generate quick hacks or placeholder implementations unless explicitly requested.
````
