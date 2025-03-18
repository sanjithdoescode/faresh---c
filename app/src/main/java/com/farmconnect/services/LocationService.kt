class LocationService @Inject constructor(
    private val context: Context
) {
    private val fusedLocationClient: FusedLocationProviderClient = 
        LocationServices.getFusedLocationProviderClient(context)

    suspend fun getCurrentLocation(): Location? {
        return withContext(Dispatchers.IO) {
            try {
                val task = fusedLocationClient.lastLocation
                Tasks.await(task)
            } catch (e: Exception) {
                null
            }
        }
    }
} 