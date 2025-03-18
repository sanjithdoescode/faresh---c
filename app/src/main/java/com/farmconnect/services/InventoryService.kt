@Singleton
class InventoryService @Inject constructor(
    private val productDao: ProductDao,
    private val notificationService: NotificationService
) {
    suspend fun updateInventory(productId: String, newQuantity: Double) {
        withContext(Dispatchers.IO) {
            val product = productDao.getProduct(productId)
            
            // Update local cache
            productDao.updateQuantity(productId, newQuantity)
            
            // Sync with server when online
            if (isNetworkAvailable()) {
                syncWithServer(productId, newQuantity)
            } else {
                queueForSync(productId, newQuantity)
            }
            
            // Check low inventory threshold
            if (newQuantity < product.lowInventoryThreshold) {
                notificationService.sendLowInventoryAlert(product)
            }
        }
    }
    
    suspend fun batchUpdateInventory(updates: List<InventoryUpdate>) {
        // Handle bulk updates efficiently
        withContext(Dispatchers.IO) {
            productDao.batchUpdate(updates)
        }
    }
} 