data class Product(
    val id: String,
    val name: Map<String, String>, // Localized names
    val price: Double,
    val quantity: Double,
    val unit: String,
    val images: List<String>,
    val farmerId: String
) {
    // Support offline caching
    @Entity(tableName = "products")
    data class LocalProduct(
        @PrimaryKey val id: String,
        val nameEn: String,
        val nameTa: String,
        val price: Double,
        // ... other fields
    )
} 