# Business Logic Controller and UI Component Relationship

This document outlines the relationship between the Business Logic Controller (BLC) and UI components in the WebAX architecture.

## Overview

The WebAX architecture follows a strict separation between business logic and UI components:

1. **Business Logic Controller (BLC)**: Implemented by jcule, manages application state, routing, API communication, and event processing
2. **UI Components**: Implemented by jellicule, handle rendering and user interaction

This separation ensures a clean architecture with clear responsibilities and enables powerful features like multi-tab support and state synchronization.

## Core Principles

### 1. UI Components Should Not Communicate Directly

UI components should never communicate directly with each other. Instead:

- Components emit events to the BLC
- The BLC processes these events and updates the application state
- The BLC sends state updates to the relevant UI components

```
┌─────────────┐     Events     ┌─────────────┐     State     ┌─────────────┐
│ UI Component │ ────────────> │     BLC     │ ────────────> │ UI Component │
└─────────────┘                └─────────────┘                └─────────────┘
       ▲                              │                              │
       │                              │                              │
       └──────────────────────────────┴──────────────────────────────┘
                                State
```

### 2. UI Components Should Be "Dumb"

UI components should be as "dumb" as possible, focusing only on:

- Rendering based on props
- Capturing user interactions
- Emitting events to the BLC

They should not:
- Maintain complex state
- Perform business logic
- Make API calls directly
- Access global state directly

### 3. BLC Is the Source of Truth

The BLC is the single source of truth for application state:

- All state changes go through the BLC
- UI components receive state as props
- UI state is derived from application state
- State is persisted and synchronized by the BLC

### 4. Multi-Tab Support

WebAX applications should work seamlessly across multiple browser tabs:

- Each tab has its own instance of the BLC
- BLCs communicate with each other via a messaging system (e.g., comlink)
- There is ONE true application state that all tabs sync with
- State updates are broadcast to all UI instances to keep them in sync

```
┌─────────────────────────┐     ┌─────────────────────────┐
│        Tab 1            │     │        Tab 2            │
│  ┌─────────────────┐    │     │  ┌─────────────────┐    │
│  │       BLC       │<───┼─────┼─>│       BLC       │    │
│  └─────────────────┘    │     │  └─────────────────┘    │
│          │              │     │          │              │
│          ▼              │     │          ▼              │
│  ┌─────────────────┐    │     │  ┌─────────────────┐    │
│  │  UI Components  │    │     │  │  UI Components  │    │
│  └─────────────────┘    │     │  └─────────────────┘    │
└─────────────────────────┘     └─────────────────────────┘
            │                               │
            └───────────────────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │  Application State  │
                  └─────────────────────┘
```

## Implementation Guidelines

### For UI Component Developers (jellicule)

1. **Focus on rendering and user interaction**:
   ```tsx
   function Button({ label, onClick, disabled }) {
     return (
       <button 
         disabled={disabled} 
         onClick={(e) => onClick && onClick(e)}
       >
         {label}
       </button>
     );
   }
   ```

2. **Emit events, don't handle business logic**:
   ```tsx
   function ProductCard({ product, onAddToCart }) {
     return (
       <div className="product-card">
         <h3>{product.name}</h3>
         <p>${product.price}</p>
         <button onClick={() => onAddToCart(product.id)}>
           Add to Cart
         </button>
       </div>
     );
   }
   ```

3. **Accept state as props, don't fetch it**:
   ```tsx
   // GOOD
   function ProductList({ products, loading, error, onProductClick }) {
     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;
     
     return (
       <div className="product-list">
         {products.map(product => (
           <ProductCard 
             key={product.id} 
             product={product} 
             onClick={() => onProductClick(product.id)} 
           />
         ))}
       </div>
     );
   }
   
   // BAD
   function ProductList() {
     const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       fetch('/api/products')
         .then(res => res.json())
         .then(data => setProducts(data))
         .catch(err => setError(err))
         .finally(() => setLoading(false));
     }, []);
     
     // Rest of component...
   }
   ```

### For Business Logic Controller Developers (jcule)

1. **Handle all state changes**:
   ```typescript
   function cartReducer(state, action) {
     switch (action.type) {
       case 'ADD_TO_CART':
         return {
           ...state,
           items: [...state.items, { id: action.payload.id, quantity: 1 }]
         };
       case 'REMOVE_FROM_CART':
         return {
           ...state,
           items: state.items.filter(item => item.id !== action.payload.id)
         };
       case 'UPDATE_QUANTITY':
         return {
           ...state,
           items: state.items.map(item => 
             item.id === action.payload.id 
               ? { ...item, quantity: action.payload.quantity } 
               : item
           )
         };
       default:
         return state;
     }
   }
   ```

2. **Process events from UI components**:
   ```typescript
   function handleAddToCart(productId) {
     // Validate product exists
     const product = getProduct(productId);
     if (!product) {
       dispatch({ type: 'ERROR', payload: { message: 'Product not found' } });
       return;
     }
     
     // Check inventory
     if (product.inventory <= 0) {
       dispatch({ type: 'ERROR', payload: { message: 'Product out of stock' } });
       return;
     }
     
     // Add to cart
     dispatch({ type: 'ADD_TO_CART', payload: { id: productId } });
     
     // Show confirmation
     dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Added to cart' } });
   }
   ```

3. **Synchronize state across tabs**:
   ```typescript
   // In BLC initialization
   comlink.subscribe('STATE_UPDATE', (message) => {
     if (message.source !== tabId) {
       // Update local state with changes from other tabs
       dispatch({ type: 'SYNC_STATE', payload: message.state });
     }
   });
   
   // After state changes
   function afterStateChange(newState) {
     // Broadcast state changes to other tabs
     comlink.publish('STATE_UPDATE', {
       source: tabId,
       state: newState
     });
   }
   ```

## Benefits of This Approach

1. **Maintainability**: Clear separation of concerns makes the codebase easier to maintain
2. **Testability**: UI components and business logic can be tested independently
3. **Reusability**: UI components can be reused across different applications
4. **Scalability**: The architecture scales well for large applications
5. **Multi-tab Support**: Applications work seamlessly across multiple browser tabs
6. **State Synchronization**: All UI instances stay in sync with the application state
7. **Offline Support**: The BLC can handle offline scenarios and sync when online
8. **Performance**: UI components can be optimized for rendering performance

## Common Anti-patterns to Avoid

1. **Direct Component Communication**: Components should never communicate directly with each other
2. **Smart UI Components**: UI components should not contain business logic
3. **Direct API Calls from Components**: Components should not make API calls directly
4. **Global State Access in Components**: Components should receive state as props
5. **Complex State in Components**: Components should maintain minimal local state
6. **Business Logic in Event Handlers**: Event handlers in components should only emit events

## Conclusion

The relationship between the Business Logic Controller and UI components is a fundamental aspect of the WebAX architecture. By following these principles, developers can create applications that are maintainable, testable, and provide a great user experience across multiple tabs and devices.
