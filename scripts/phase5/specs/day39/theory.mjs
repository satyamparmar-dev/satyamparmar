export const theoryTitle = "Spring bean lifecycle and advanced DI";

export const theoryBase = `### Plain-language overview

The **IoC container** instantiates beans, injects dependencies, runs lifecycle callbacks, and (for singletons) destroys beans on shutdown. **BeanPostProcessor** hooks wrap creation; **@PostConstruct** / **InitializingBean** / **initMethod** run in a defined order after injection.

**Interview angle:** state the callback order: BPP before init → @PostConstruct → InitializingBean → custom init → BPP after init (AOP proxy).

### Construction vs injection

Constructor injection is preferred for required dependencies; setter/field injection for optional. Circular dependencies may need @Lazy or refactor.

### @PostConstruct and JSR-250

Runs after dependency injection; one method per class; not on prototype the same as singleton regarding container-managed destroy.

### InitializingBean

afterPropertiesSet — older style; same phase roughly as init callbacks; avoid mixing three styles without docs.

### DisposableBean and @PreDestroy

Singleton destruction on context close; **prototype** destruction is **not** container-managed — manual cleanup.

### BeanPostProcessor

Global hook; registration order matters; can wrap beans with proxies (AOP).

### @DependsOn

Forces creation order when graph alone is insufficient (side effects, infrastructure beans).

### FactoryBean

Indirection: getObject() produces the bean; common for integrations.

### ObjectProvider / ObjectFactory

Lazy or multiple candidates resolution without @Autowired list.

### Scoped beans and proxies

request/session scope needs proxy when injected into singleton.

### @Primary and @Qualifier

Disambiguate multiple beans of same type.

### Production angle

Slow @PostConstruct breaks readiness; ordering bugs in K8s; prototype leaks.

### 60-second story

“I explain construction then injection then init callbacks then BPP after for proxies. I warn prototype destroy. I use @DependsOn for infra order. I disambiguate with @Qualifier/@Primary. I test with Boot test slices.”
`;
