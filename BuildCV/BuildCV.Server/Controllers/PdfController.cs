using BuildCV.Server.Services;
using Microsoft.AspNetCore.Mvc;
using static BuildCV.Server.Models.CVData;

namespace BuildCV.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PdfController : ControllerBase
    {
        private readonly IPdfGenerationService _pdfService;
        private readonly ILogger<PdfController> _logger;

        public PdfController(IPdfGenerationService pdfService, ILogger<PdfController> logger)
        {
            _pdfService = pdfService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePdf([FromBody] PdfGenerationRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.HtmlContent))
                {
                    return BadRequest(new { message = "HTML content is required" });
                }

                _logger.LogInformation("Received PDF generation request");

                var pdfBytes = await _pdfService.GeneratePdfFromHtml(
                    request.HtmlContent,
                    request.Options ?? new PdfGenerationOptions()
                );

                return File(pdfBytes, "application/pdf", "CV-Preview.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in PDF generation endpoint");
                return StatusCode(500, new { message = "PDF generation failed", error = ex.Message });
            }
        }

        [HttpPost("generate-high-quality")]
        public async Task<IActionResult> GenerateHighQualityPdf([FromBody] PdfGenerationRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.HtmlContent))
                {
                    return BadRequest(new { message = "HTML content is required" });
                }

                _logger.LogInformation("Received high-quality PDF generation request");

                // Override scale for high quality export
                var options = request.Options ?? new PdfGenerationOptions();
                options.Scale = 1.5; // Higher quality for export

                var pdfBytes = await _pdfService.GeneratePdfFromHtml(request.HtmlContent, options);

                return File(pdfBytes, "application/pdf", "CV-Export.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in high-quality PDF generation endpoint");
                return StatusCode(500, new { message = "PDF generation failed", error = ex.Message });
            }
        }
    }
}
