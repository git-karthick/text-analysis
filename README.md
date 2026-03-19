Here’s your complete VS Code Copilot Plan Mode prompt. Paste this entire block into Copilot Chat with Claude Sonnet 4.6 selected:

You are a senior Java migration architect. Analyze this entire workspace and 
create a comprehensive migration plan and all required agent artifacts.

Do NOT write application code yet. Instead, produce:
1. A detailed migration plan document
2. A .github/copilot-instructions.md file
3. A .copilot/prompts/ folder with all conversion prompt files
4. A .copilot/skills/ folder with all skill definition files

===========================================================================
PROJECT CONTEXT
===========================================================================

MIGRATION SCOPE:
- Frontend:  JSP + HTML + JavaScript  →  Angular 17+ (TypeScript, standalone components)
- Backend:   Servlet + Spring Framework (XML config)  →  Spring Boot 3.x (annotation-driven)
- Runtime:   IBM Liberty Servlet container  →  Apache Tomcat (containerized via Docker)
- Build:     Ant / Maven legacy  →  Maven (backend), npm/Angular CLI (frontend)
- Database:  Keep existing schema — only migrate data access layer

CONSTRAINTS:
- Use GitHub Copilot API Gateway at http://127.0.0.1:3030/v1
- Primary AI model: claude-sonnet-4-6 (via Copilot, for complex reasoning)
- Bulk conversion model: gpt-5-mini (via gateway, cost-free on paid plans)
- Python 3.10+ for the conversion tooling
- No breaking changes to REST API contracts (URLs must stay the same)
- All converted code must compile — flag anything that cannot be auto-converted

===========================================================================
TASK 1 — CREATE .github/copilot-instructions.md
===========================================================================

Generate the full content for .github/copilot-instructions.md

This file instructs ALL Copilot agents in this workspace. Include:

--- START FILE CONTENT ---

# Copilot Workspace Instructions — LegacyShift Migration Project

## Project Mission
Migrate a legacy Java enterprise application to modern architecture:
- JSP/HTML/JS → Angular 17+ TypeScript (standalone components)
- Servlet + Spring MVC (XML) → Spring Boot 3.x (annotation-driven)
- IBM Liberty → Dockerized Apache Tomcat 10.x

## Agent Behavior Rules

### General
- Always preserve existing business logic exactly — never simplify or omit it
- Never change existing REST API URL patterns (they are consumed by clients)
- Use Jakarta EE namespace (jakarta.*) not javax.* for all Spring Boot 3.x code
- Add // MIGRATED: [reason] comment wherever behavior changes from original
- Add // SECURITY: [issue] comment for any detected security problem
- Add // TODO: MANUAL REVIEW — [reason] for anything that cannot be auto-converted
- Default package structure: com.{appname}.{layer} (controller/service/repository/model/config)

### Backend Rules
- Spring Boot version: 3.2.x
- Java version: 21
- Build tool: Maven with spring-boot-starter-parent
- All controllers: @RestController (not @Controller unless serving views)
- All responses wrapped in: ApiResponse<T> { success, data, message, timestamp }
- Exception handling: Global @ControllerAdvice with @ExceptionHandler
- Validation: jakarta.validation (Bean Validation 3.0)
- Security: Note Spring Security JWT setup needed — do not implement, just flag
- Database: Spring Data JPA with HikariCP connection pool
- No XML configuration — annotation and Java config only
- Actuator endpoints must be included in every service

### Frontend Rules  
- Angular version: 17+
- Use standalone components (no NgModules unless absolutely necessary)
- State management: Angular Signals for local state, RxJS for HTTP
- HTTP calls: Angular HttpClient with typed responses matching ApiResponse<T>
- Routing: Angular Router with lazy-loaded feature routes
- Forms: ReactiveFormsModule (not Template-driven)
- Styling: Keep existing CSS classes where possible, migrate to SCSS
- JSP EL expressions ${var} → {{ var }} interpolation
- JSTL c:forEach → *ngFor, c:if → *ngIf, c:choose/when → ngSwitch
- fmt:formatDate → Angular DatePipe {{ date | date:'yyyy-MM-dd' }}
- All HTTP calls go to environment.apiUrl base (not hardcoded URLs)
- Generate HttpClient service for every converted servlet endpoint

### Containerization Rules
- Base image: tomcat:10.1-jdk21-temurin
- Multi-stage Docker build (build stage + runtime stage)
- Externalize all config via environment variables
- Health check endpoint: /actuator/health
- Never embed credentials in Dockerfile or application.properties
- Use .env file pattern with docker-compose for local dev

### Code Quality Rules
- Every converted class needs a corresponding unit test skeleton
- Use Lombok: @Data @Builder @NoArgsConstructor @AllArgsConstructor on DTOs/Entities
- No field injection (@Autowired on fields) — constructor injection only
- No wildcard imports
- All public methods need Javadoc if the original had comments

## Layer Mapping Reference

| Legacy Pattern | Target Pattern |
|---|---|
| HttpServlet (doGet/doPost) | @RestController + @GetMapping/@PostMapping |
| Spring MVC @Controller (XML) | @RestController (annotation-driven) |
| web.xml servlet-mapping | @RequestMapping on controller class |
| Spring XML bean definitions | @Configuration + @Bean or @Component scan |
| JDBC DAO (raw PreparedStatement) | JpaRepository<Entity, ID> interface |
| Hibernate SessionFactory | Spring Data JPA (auto-configured) |
| Hibernate HQL | JPQL @Query annotations |
| EJB @Stateless | @Service |
| EJB @Stateful | @Service + @Scope("session") — flag for review |
| JSP + JSTL | Angular standalone component (TS + HTML + SCSS) |
| JSP form (POST action) | Angular ReactiveForm + HttpClient.post() |
| JSP pagination | Angular component with paginator signal |
| HTML + inline JS | Angular component with TypeScript class |
| JavaScript AJAX (XMLHttpRequest/jQuery) | Angular HttpClient service method |
| IBM Liberty server.xml datasource | Spring Boot application.properties + Docker env |
| IBM Liberty server.xml features | Spring Boot starters in pom.xml |
| web.xml filters | Spring Boot @Component implementing Filter |
| web.xml listeners | Spring Boot ApplicationListener<T> |
| web.xml error-page | @ControllerAdvice @ExceptionHandler |
| JNDI datasource lookup | spring.datasource.* in application.properties |

--- END FILE CONTENT ---

===========================================================================
TASK 2 — CREATE CONVERSION PROMPT FILES (.copilot/prompts/)
===========================================================================

Create the following prompt files. Each is a standalone .prompt.md file
that Copilot Agent uses when invoked with /prompt filename.

------- FILE: .copilot/prompts/convert-servlet.prompt.md -------

# Prompt: Convert HttpServlet to Spring Boot REST Controller

## Instructions for Agent

You will receive a legacy Java HttpServlet file. Convert it to a Spring Boot 
3.x REST Controller following ALL rules in .github/copilot-instructions.md.

### Input Analysis (do this first)
Before converting, identify and list:
- All URL mappings (from @WebServlet annotation or web.xml)
- All request parameters read (getParameter, getHeader, getSession)
- All response types (JSON, HTML redirect, file download, error codes)
- All JDBC or DAO calls made
- All session attributes read or written
- Any filter or security checks

### Conversion Steps
1. Create @RestController class with same name minus "Servlet" suffix + "Controller"
2. Add @RequestMapping with the EXACT same URL pattern as the servlet mapping
3. Convert each doGet/doPost/doPut/doDelete to annotated methods
4. Replace HttpServletRequest parameter reading:
   - getParameter("x") → @RequestParam("x") String x
   - getPathInfo() split → @PathVariable
   - readLine() / getInputStream() → @RequestBody DtoClass body
   - getHeader("x") → @RequestHeader("x") String x
5. Replace response writing:
   - response.getWriter().print(json) → return ResponseEntity.ok(ApiResponse.success(data))
   - response.sendError(404) → throw new ResourceNotFoundException(message)
   - response.sendRedirect(url) → return ResponseEntity.status(302).header("Location", url).build()
   - response.setStatus(201) → return ResponseEntity.status(HttpStatus.CREATED).body(...)
6. Replace session handling:
   - session.getAttribute("userId") → extract from JWT token via @AuthenticationPrincipal
   - session.setAttribute(...) → add // SECURITY: migrate to JWT — do not store in session
   - session.invalidate() → SecurityContextHolder.clearContext()
7. Replace JDBC with service calls:
   - For each SQL operation, create a method call to XxxService (assume it exists)
   - Add // TODO: implement XxxService.methodName() in service layer
8. Add @CrossOrigin(origins = "${app.cors.allowed-origins}") at class level
9. Generate the DTO class if request body parameters exist (5+ parameters = DTO)
10. Generate ApiResponse<T> wrapper usage for all return types

### Output Format
Produce in this order:
1. // === FILE: src/main/java/{package}/controller/XxxController.java ===
   (full controller class)
2. // === FILE: src/main/java/{package}/dto/XxxRequestDto.java ===
   (if request DTO needed)
3. // === FILE: src/main/java/{package}/dto/XxxResponseDto.java ===
   (if response DTO needed)
4. // === FILE: src/test/java/{package}/controller/XxxControllerTest.java ===
   (unit test skeleton with @WebMvcTest)

------- FILE: .copilot/prompts/convert-spring-xml.prompt.md -------

# Prompt: Convert Spring XML Config to Spring Boot Annotation Config

## Instructions for Agent

Convert legacy Spring Framework XML configuration files to Spring Boot 3.x 
annotation-based configuration.

### Input Analysis
Identify in the XML:
- <bean> definitions → @Component / @Service / @Repository / @Configuration @Bean
- <context:component-scan> → @SpringBootApplication (already includes this)
- <mvc:annotation-driven> → remove (Spring Boot auto-configures)
- <context:property-placeholder> → application.properties + @Value
- <bean class="DataSource"> → spring.datasource.* properties
- <tx:annotation-driven> → @EnableTransactionManagement (or Spring Boot auto)
- <mvc:interceptors> → WebMvcConfigurer.addInterceptors()
- <mvc:cors> → WebMvcConfigurer.addCorsMappings()
- <mvc:resources> → WebMvcConfigurer.addResourceHandlers()
- <import resource="..."> → consolidate into single @Configuration class
- <aop:config> → @Aspect + @Around/@Before/@After

### Conversion Rules
- One XML file → One @Configuration class named XxxConfiguration
- Property values → @Value("${property.key}") or @ConfigurationProperties
- datasource bean → Delete entirely, use spring.datasource.* in application.properties
- transactionManager bean → Delete, Spring Boot auto-configures with JPA
- viewResolver bean → Delete, this is a REST API now
- messageSource bean → Keep as @Bean if i18n is used

### Output Format
1. // === FILE: src/main/java/{package}/config/XxxConfiguration.java ===
2. // === FILE: src/main/resources/application.properties ===
   (add any extracted properties here, use placeholders for credentials)
3. // === REMOVED: list of XML files that are now obsolete ===

------- FILE: .copilot/prompts/convert-jsp.prompt.md -------

# Prompt: Convert JSP to Angular Standalone Component

## Instructions for Agent

Convert a legacy JSP file (with JSTL and/or inline JavaScript) to a modern 
Angular 17+ standalone component.

### Input Analysis
Before converting, identify:
- Page title and route (from <title> or page heading)
- All JSTL variables used (${var}, ${bean.property})
- All form actions and their target servlets
- All AJAX calls (jQuery $.ajax, XMLHttpRequest, fetch)
- All JavaScript functions — note which are UI logic vs business logic
- All included JSP fragments (jsp:include, c:import)
- Session variables accessed (${sessionScope.x})
- CSS files linked

### Component Naming
- File: UserDashboard.jsp → user-dashboard component
- Class: UserDashboardComponent
- Selector: app-user-dashboard
- Route path: /user-dashboard

### Conversion Steps

TYPESCRIPT CLASS:
1. Create standalone component with imports array (not NgModule)
2. Declare signals for all page data: users = signal<User[]>([])
3. Declare form group for each form on the page
4. Create inject(HttpClient) for API calls — not constructor injection
5. Implement ngOnInit() to load initial data
6. Convert each form submit handler:
   - Legacy: form.action = "/UserServlet?action=save"
   - Modern: this.userService.save(this.form.value).subscribe(...)
7. Convert each AJAX call to typed HttpClient method:
   - jQuery $.ajax → inject(HttpClient).post<ApiResponse<T>>(url, body)
8. Add pagination signal: currentPage = signal(1); totalPages = signal(0)
9. Map ALL session variables to @Input() or injected AuthService properties
10. Move pure utility JavaScript functions to a shared utility service

HTML TEMPLATE:
1. Replace <c:forEach var="u" items="${userList}"> with @for (u of users(); track u.id)
   OR *ngFor="let u of users()" if not using new control flow syntax
2. Replace <c:if test="${condition}"> with @if (condition) or *ngIf
3. Replace <c:choose><c:when> with @switch or ngSwitch
4. Replace ${variable} with {{ variable }}
5. Replace <fmt:formatDate value="${date}" pattern="yyyy-MM-dd"/>
   with {{ date | date:'yyyy-MM-dd' }}
6. Replace <form action="..." method="POST"> with <form [formGroup]="form" (ngSubmit)="onSubmit()">
7. Replace <input name="x"> with <input formControlName="x">
8. Add [disabled]="isLoading()" to submit buttons
9. Replace inline onclick="jsFunction()" with (click)="componentMethod()"
10. Preserve all existing CSS classes (migrate file to .scss)

ANGULAR SERVICE (generate one per converted servlet):
- Class: UserApiService
- File: user-api.service.ts
- Methods matching every servlet endpoint this JSP called
- Return type: Observable<ApiResponse<T>>
- Base URL from: inject(environment).apiUrl

### Output Format
1. // === FILE: src/app/features/xxx/xxx.component.ts ===
2. // === FILE: src/app/features/xxx/xxx.component.html ===
3. // === FILE: src/app/features/xxx/xxx.component.scss ===
   (copy existing CSS, wrap in :host selector)
4. // === FILE: src/app/core/services/xxx-api.service.ts ===
   (if new service needed)
5. // === FILE: src/app/core/models/xxx.model.ts ===
   (TypeScript interfaces for all data shapes)
6. // === ROUTE: add to app.routes.ts ===
   { path: 'xxx', loadComponent: () => import('./features/xxx/xxx.component') }

------- FILE: .copilot/prompts/convert-dao.prompt.md -------

# Prompt: Convert JDBC DAO to Spring Data JPA Repository

## Instructions for Agent

Convert a legacy Java DAO class using raw JDBC to Spring Data JPA.

### Conversion Steps
1. Extract entity name from table name in SQL (users → User, order_items → OrderItem)
2. Create JPA Entity class if not already present:
   - @Entity @Table(name="legacy_table_name")
   - Map all columns (use @Column(name="col_name") for non-standard names)
   - Use Long for numeric PKs, String for varchar PKs
   - Add Lombok @Data @NoArgsConstructor @AllArgsConstructor @Builder
3. Create repository interface: XxxRepository extends JpaRepository<Xxx, Long>
4. Convert each DAO method:
   - findById(id) → built-in (delete method)
   - findAll() → built-in (delete method)  
   - findByColumn(value) → Spring Data derived method name
   - INSERT → repository.save(entity) in service layer
   - UPDATE → repository.save(entity) (JPA merges if ID present)
   - DELETE → repository.deleteById(id)
   - Complex SELECT → @Query("SELECT e FROM Entity e WHERE ...")
   - Stored procedure call → @Procedure or @Query(nativeQuery=true) — flag for review
5. Create @Service class wrapping the repository with all business logic methods
6. Flag any batch operations for manual review (// TODO: use JdbcTemplate for batch)
7. Flag any stored procedure calls (// TODO: MANUAL REVIEW — stored proc)

### Output Format
1. // === FILE: src/main/java/{package}/model/XxxEntity.java ===
2. // === FILE: src/main/java/{package}/repository/XxxRepository.java ===
3. // === FILE: src/main/java/{package}/service/XxxService.java ===
4. // === FILE: src/test/java/{package}/repository/XxxRepositoryTest.java ===

------- FILE: .copilot/prompts/convert-liberty-to-docker.prompt.md -------

# Prompt: Convert IBM Liberty Config to Dockerized Tomcat

## Instructions for Agent

Read IBM Liberty server.xml and generate Docker + Spring Boot configuration.

### Input Analysis (read server.xml)
Extract:
- httpEndpoint port → EXPOSE port in Dockerfile
- dataSource jndiName + properties → spring.datasource.* 
- All <feature> entries → map to Spring Boot starters
- applicationMonitor → remove (not needed)
- logging configuration → Spring Boot logging.* properties
- SSL/keystore config → flag for manual review
- JNDI bindings → convert to Spring @Value or @ConfigurationProperties

### Liberty Feature → Spring Boot Starter Mapping
| Liberty Feature | Spring Boot Starter / Config |
|---|---|
| servlet-4.0 / servlet-5.0 | spring-boot-starter-web (includes Tomcat) |
| jpa-2.2 / jpa-3.0 | spring-boot-starter-data-jpa |
| jdbc-4.2 | spring.datasource.* properties |
| jsonb-1.0 | spring-boot-starter-json (Jackson, included) |
| mpHealth-2.x | spring-boot-starter-actuator |
| mpMetrics-2.x | spring-boot-starter-actuator + micrometer |
| mpJwt-1.x | spring-boot-starter-security + jjwt library |
| cdi-2.0 | Remove — Spring @Component replaces CDI |
| ejb-3.2 | Remove — Spring @Service replaces EJB |
| websocket-1.1 | spring-boot-starter-websocket |
| ssl-1.0 | server.ssl.* properties — flag for cert setup |

### Output Format
1. // === FILE: Dockerfile ===
2. // === FILE: docker-compose.yml ===
3. // === FILE: docker-compose.override.yml === (local dev overrides)
4. // === FILE: .env.example === (all required environment variables)
5. // === FILE: src/main/resources/application.properties ===
6. // === FILE: src/main/resources/application-docker.properties ===
7. // === FILE: pom.xml additions === (starters to add/remove)

### Dockerfile Template to Follow
Use multi-stage build:
Stage 1 (build): maven:3.9-eclipse-temurin-21 → mvn package -DskipTests
Stage 2 (runtime): tomcat:10.1-jdk21-temurin
- COPY --from=build target/*.war webapps/ROOT.war
- ENV variables for all datasource config
- HEALTHCHECK using /actuator/health
- Non-root USER for security
- EXPOSE 8080

===========================================================================
TASK 3 — CREATE SKILL DEFINITION FILES (.copilot/skills/)
===========================================================================

Create skill files that teach Copilot how to handle patterns it will 
encounter repeatedly during this migration.

------- FILE: .copilot/skills/spring-boot-patterns.md -------

# Skill: Spring Boot 3.x Patterns for This Project

## ApiResponse Wrapper (ALWAYS use this for REST responses)
```java
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder().success(true).data(data).build();
    }
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().success(false).message(message).build();
    }
}


Global Exception Handler (use in every project)

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(400).body(ApiResponse.error(msg));
    }
}


Constructor Injection Pattern (NEVER field injection)

// CORRECT
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) { 
        this.userService = userService; 
    }
}
// WRONG — never do this
@Autowired private UserService userService;


application.properties Template

# Server
server.port=${PORT:8080}
server.servlet.context-path=/

# Database — all values from environment variables
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=${DB_DRIVER:org.postgresql.Driver}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=${SHOW_SQL:false}

# CORS
app.cors.allowed-origins=${CORS_ORIGINS:http://localhost:4200}

# Actuator
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized


—–– FILE: .copilot/skills/angular-patterns.md —––
Skill: Angular 17+ Patterns for This Project
Standalone Component Template (always use this structure)

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-xxx',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './xxx.component.html',
  styleUrl: './xxx.component.scss'
})
export class XxxComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  // State as signals
  items = signal<Item[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  ngOnInit(): void { this.loadData(); }
  
  loadData(): void {
    this.isLoading.set(true);
    this.http.get<ApiResponse<Item[]>>(`${environment.apiUrl}/items`)
      .subscribe({
        next: (res) => { this.items.set(res.data); this.isLoading.set(false); },
        error: (err) => { this.errorMessage.set(err.message); this.isLoading.set(false); }
      });
  }
}


ApiResponse Interface (matches Spring Boot backend)

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}


API Service Template (one per backend controller)

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;
  
  getAll(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl);
  }
  getById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }
  create(dto: CreateUserDto): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, dto);
  }
  update(id: number, dto: UpdateUserDto): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, dto);
  }
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}


Environment Files

// src/environments/environment.ts
export const environment = { production: false, apiUrl: 'http://localhost:8080/api' };
// src/environments/environment.prod.ts  
export const environment = { production: true, apiUrl: '/api' };


—–– FILE: .copilot/skills/migration-checklist.md —––
Skill: Migration Checklist — Apply to Every Converted File
Before marking a file as converted, verify:
Backend (Java)
	∙	Package declaration matches com.{appname}.{layer}
	∙	Uses jakarta.* not javax.* everywhere
	∙	Constructor injection only (no @Autowired fields)
	∙	Returns ApiResponse<T> from all @RestController methods
	∙	No hardcoded URLs, credentials, or environment values
	∙	No XML configuration references remain
	∙	All TODO comments added for items needing manual review
	∙	All SECURITY comments added for security issues found
	∙	Corresponding unit test file generated (even if skeleton)
Frontend (Angular)
	∙	Standalone component (no NgModule)
	∙	All data stored as signals not class properties
	∙	Uses environment.apiUrl not hardcoded localhost
	∙	ReactiveFormsModule not template-driven forms
	∙	No jQuery or vanilla JS in component (moved to service)
	∙	All session variable references replaced with service/input
	∙	SCSS file created from legacy CSS
Container
	∙	No credentials in Dockerfile
	∙	All config comes from environment variables
	∙	Health check configured
	∙	Multi-stage build used
Security Red Flags — Always flag these with // SECURITY:
	∙	Plaintext password storage or comparison
	∙	SQL string concatenation (SQL injection risk)
	∙	HttpSession storing sensitive data
	∙	Hardcoded credentials or API keys
	∙	MD5 or SHA1 password hashing
	∙	CORS set to * without restriction
===========================================================================
TASK 4 — MIGRATION PLAN DOCUMENT
Generate MIGRATION_PLAN.md with:
	1.	EXECUTIVE SUMMARY
	∙	What is being migrated and why
	∙	Estimated timeline by phase
	∙	Risk assessment (High/Medium/Low per area)
	2.	PHASE BREAKDOWN
Phase 0 — Setup & Tooling (Week 1)
	∙	Install conversion tool dependencies
	∙	Configure Copilot API Gateway
	∙	Run dry-run scan on entire codebase
	∙	Produce inventory: file counts by type
Phase 1 — Backend Foundation (Weeks 2–3)
	∙	Create Spring Boot project skeleton
	∙	Convert application.properties from Liberty server.xml
	∙	Convert Spring XML configs to @Configuration classes
	∙	Set up Docker + docker-compose
Phase 2 — Data Layer (Weeks 3–4)
	∙	Convert all JDBC DAOs to JpaRepository
	∙	Generate JPA entities from table structure
	∙	Validate entity mappings against existing schema
Phase 3 — Backend API Layer (Weeks 4–6)
	∙	Convert all Servlets to @RestController
	∙	Implement GlobalExceptionHandler
	∙	Wire service layer
	∙	Integration tests for all endpoints
Phase 4 — Frontend (Weeks 6–9)
	∙	Scaffold Angular project
	∙	Convert JSP pages to Angular components (bulk)
	∙	Convert HTML+JS pages to Angular components
	∙	Wire Angular services to Spring Boot API
	∙	End-to-end routing
Phase 5 — Containerization (Week 9)
	∙	Finalize Dockerfile
	∙	Configure docker-compose for local dev
	∙	CI/CD pipeline stub
Phase 6 — QA & Cutover (Weeks 10–12)
	∙	Side-by-side testing (legacy vs modern)
	∙	Performance baseline comparison
	∙	Security review of flagged items
	∙	Cutover plan
	3.	FILE INVENTORY TABLE
Scan the workspace and produce a table:


   
   |File                                           |Legacy Type|Target|Complexity|Status|
   |-----------------------------------------------|-----------|------|----------|------|
   |(populate with actual files found in workspace)|           |      |          |      |

	4.	MANUAL REVIEW ITEMS
List patterns that cannot be auto-converted:
	∙	Stored procedures
	∙	Complex multi-table batch JDBC operations
	∙	EJB @Stateful beans (session state)
	∙	Custom Liberty security features
	∙	IBM-specific APIs (WebSphere extensions)
	∙	COBOL/legacy system integrations
	5.	TOOLING COMMANDS REFERENCE
Scan workspace
python convert.py –dir src/ –dry-run
Convert backend only
python convert.py –dir src/main/java –out output/backend –pkg com.myapp
Convert JSPs only
python convert.py –dir src/main/webapp –out output/frontend –pkg com.myapp
Full conversion with report
python convert.py –dir src/ –out output/ –pkg com.myapp –report


---

## How to Use This Step by Step

**Step 1 — Set up the gateway**


Ctrl+Shift+P → “GitHub Copilot API Gateway: Start Server”


**Step 2 — Open Copilot Chat**


Select model: Claude Sonnet 4.6
Switch to: Agent Mode
Toggle: Plan Mode ON


**Step 3 — Paste the full prompt above and hit Enter**

Copilot will analyze your workspace and produce the full folder structure. Review the plan it generates — in Plan Mode it will show you exactly what it intends to create before writing anything.

**Step 4 — Approve the plan → switch to Agent Mode (no plan toggle) to execute**

**Step 5 — Then use individual prompt files per file type**


@workspace /convert-servlet UserServlet.java
@workspace /convert-jsp UserDashboard.jsp
@workspace /convert-liberty-to-docker server.xml


The `.github/copilot-instructions.md` file means every subsequent Copilot session in that workspace automatically follows all the migration rules — you only need to set this up once.​​​​​​​​​​​​​​​​
