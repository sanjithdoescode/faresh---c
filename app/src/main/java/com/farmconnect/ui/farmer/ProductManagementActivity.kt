@AndroidEntryPoint
class ProductManagementActivity : AppCompatActivity() {
    private val viewModel: ProductViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_management)
        
        // Simple UI for farmers with large touch targets
        setupSimpleProductForm()
        setupImageCapture()
        setupOfflineSupport()
    }
    
    private fun setupSimpleProductForm() {
        // Implement form with minimal fields and Tamil language support
        binding.productNameInput.apply {
            setHint(R.string.product_name_hint_tamil)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f) // Larger text for readability
        }
    }
} 